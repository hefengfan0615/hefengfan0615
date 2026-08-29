// ============================================================================
// Fengfan Xiangqi Service Worker
//
// 缓存策略：文件级精确同步（Cache First + 逐文件 stale-while-revalidate）
//   1. 每个文件独立校验：哪个文件内容变了，就只回源重下那个文件并覆盖其缓存；
//      没变的文件沿用缓存，绝不做"整体版本号失效、整体重下"，不重复下载 ~50MB 引擎数据。
//   2. 校验依据：
//        * 小型文件（wasm/js/assets/html 等）：用 version.json 中的 sha256 内容哈希比对；
//        * 大文件 pikafish.data（~50MB）：用 ETag / Last-Modified 轻量比对，避免读全量算哈希。
//   3. 更新机制：缓存命中先秒开，后台静默校验；发现该文件已变更，则只 fetch 这一个文件
//      并 cache.put 覆盖，从而"哪个文件修改，就只更新哪个文件的缓存"。
//   4. 导航（HTML 文档）：命中缓存立即返回并注入 COOP/COEP 隔离头，绝不被后台校验阻塞；
//      否则多线程引擎拿不到 SharedArrayBuffer 会卡在 0%（无痕模式尤其明显）。
//   5. 所有响应统一注入 COOP/COEP，保证多线程 WASM 引擎（SharedArrayBuffer）可用。
//
// 说明：不再使用"ENGINE_VERSION=引擎数据哈希"的版本化缓存名——那会导致
//   "只改 WASM/JS、数据不变"时既不更新 WASM/JS，而"数据一变"又会整体清空缓存。
//   改为固定缓存名 + 逐文件校验，实现真正的"改哪个更新哪个、实时与仓库同步"。
// ============================================================================

"use strict";

// 缓存结构版本：仅当缓存读写结构变化时手动递增（v1 -> v2 ...），
// 用于一次性清理旧结构缓存；日常内容更新一律走"逐文件校验"，不依赖此版本。
const CACHE_NAME = "fengfan-xiangqi-files-v1";
const MANIFEST_PATH = "/version.json";

// 应用外壳（小体积）：离线首屏所需的最小集合。
// 引擎大文件（pikafish.js/.wasm/.data）按需下载 + 缓存，不阻塞激活。
const APP_SHELL = [
    "/xiangqiai.html",
    "/version.json",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

// .data 约 50MB：不做全量 sha256，改用 ETag/Last-Modified 轻量比对。
function isLargeFile(url) {
    return url.pathname === "/wasm/pikafish.data";
}

// ----------------------------------------------------------------------------
// 安装：仅预缓存外壳并立即 skipWaiting，尽快接管页面、尽早建立跨源隔离。
// ----------------------------------------------------------------------------
self.addEventListener("install", function (event) {
    event.waitUntil(
        (async function () {
            const cache = await caches.open(CACHE_NAME);
            await Promise.allSettled(
                APP_SHELL.map(function (url) { return cache.add(url); })
            );
            return self.skipWaiting();
        })()
    );
});

// ----------------------------------------------------------------------------
// 激活：清理旧结构缓存并立即接管页面。
// ----------------------------------------------------------------------------
self.addEventListener("activate", function (event) {
    event.waitUntil(
        (async function () {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
            await self.clients.claim();
        })().catch(function () {
            // 清理/接管失败不影响后续 fetch。
        })
    );
});

// ----------------------------------------------------------------------------
// 抓取：仅拦截同源 GET 请求。
// ----------------------------------------------------------------------------
self.addEventListener("fetch", function (event) {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        serve(req).catch(function () {
            return new Response(null, { status: 504, statusText: "Network Unavailable" });
        })
    );
});

// ----------------------------------------------------------------------------
// 核心：Cache First + 逐文件后台校验。
//   命中缓存：先 clone 一份交给后台校验，原响应立即返回并注入隔离头；
//   未命中：回源下载并缓存一份。
// ----------------------------------------------------------------------------
async function serve(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        revalidateInBackground(request, cache, cached.clone());
        return withIsolationHeaders(cached);
    }

    return downloadAndStore(request, cache);
}

// ----------------------------------------------------------------------------
// 回源下载并缓存：只缓存成功(2xx)的同源基本响应，原样返回给页面。
// ----------------------------------------------------------------------------
async function downloadAndStore(request, cache) {
    // cache:"reload" 绕过浏览器 HTTP/磁盘缓存，直接回源取得最新文件。
    const response = await fetch(request, { cache: "reload" });
    if (response.ok && response.type === "basic") {
        // 后台写缓存（克隆一份，原响应原样返回）：Cache API 完整读取 clone 后才落盘，
        // 读不完（中断/网络错）则不写入，天然杜绝"半截缓存"。
        cache.put(request, response.clone()).catch(function () { /* 忽略，下次访问重试 */ });
    }
    return withIsolationHeaders(response);
}

// ----------------------------------------------------------------------------
// 后台逐文件校验（非阻塞）：哪个文件变更就只更新哪个文件的缓存。
// ----------------------------------------------------------------------------
const revalidating = new Set();

function revalidateInBackground(request, cache, cached) {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (revalidating.has(key)) return;
    revalidating.add(key);
    revalidate(request, cache, cached)
        .catch(function () { /* 网络失败：保留旧缓存 */ })
        .then(function () { revalidating.delete(key); });
}

async function revalidate(request, cache, cached) {
    const url = new URL(request.url);

    // 先 HEAD 判断文件是否还存在（不下载 body），并拿到最新 ETag/Last-Modified。
    const head = await fetch(request.url, { method: "HEAD", cache: "reload" });
    if (head.status === 404 || head.status === 410) {
        // 文件已从仓库删除：清除缓存，下次访问按 miss 处理。
        if (cached) { try { await cache.delete(request); } catch (e) { /* 忽略 */ } }
        return;
    }
    if (!head.ok) return; // 网络/服务器异常：保留现有缓存，下次再校验。

    if (!(await hasChanged(url, cached, head, cache))) return; // 未变更：沿用缓存。

    // 已变更：只回源重下这一个文件并覆盖缓存。
    const fresh = await fetch(request.url, { cache: "reload" });
    if (fresh.ok && fresh.type === "basic") {
        await cache.put(request, fresh.clone());
    }
}

// 判断单个文件是否已变更。
async function hasChanged(url, cached, head, cache) {
    // 大文件 .data：ETag / Last-Modified 轻量比对。
    if (isLargeFile(url)) {
        const serverV = head.headers.get("etag") || head.headers.get("last-modified");
        const cachedV = cached ? (cached.headers.get("etag") || cached.headers.get("last-modified")) : null;
        return !(serverV && cachedV && serverV === cachedV);
    }

    if (!cached) return true;

    // 小型文件：优先用 version.json 的 sha256 内容哈希比对。
    const manifest = await getLatestManifest(cache);
    const expected = manifest ? (manifest[url.pathname] || null) : null;
    if (expected) {
        const cachedHash = await sha256Hex(await readAllBytes(cached.body));
        return cachedHash !== expected;
    }

    // 清单无此文件（如未知资源）：退回 ETag / Last-Modified 比对。
    const serverV = head.headers.get("etag") || head.headers.get("last-modified");
    const cachedV = cached.headers.get("etag") || cached.headers.get("last-modified");
    return !(serverV && cachedV && serverV === cachedV);
}

// ----------------------------------------------------------------------------
// 清单（version.json）：并发校验时合并为单次回源；回源失败退回缓存清单。
// ----------------------------------------------------------------------------
let manifestInflight = null;

function getLatestManifest(cache) {
    if (manifestInflight) return manifestInflight;
    manifestInflight = loadManifest(cache).then(
        function (v) { manifestInflight = null; return v; },
        function () { manifestInflight = null; return null; }
    );
    return manifestInflight;
}

async function loadManifest(cache) {
    try {
        const fresh = await fetch(MANIFEST_PATH, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            const data = await fresh.json().catch(function () { return null; });
            if (data) {
                await cache.put(MANIFEST_PATH, new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
                return data;
            }
        }
    } catch (e) {
        // 回源失败：走缓存清单。
    }
    try {
        const r = await cache.match(MANIFEST_PATH);
        if (r) return await r.json().catch(function () { return null; }) || null;
    } catch (e) { /* 忽略 */ }
    return null;
}

// ----------------------------------------------------------------------------
// 工具函数。
// ----------------------------------------------------------------------------
async function readAllBytes(body) {
    const reader = body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
        const r = await reader.read();
        if (r.done) break;
        chunks.push(r.value);
        size += r.value.byteLength;
    }
    const full = new Uint8Array(size);
    let offset = 0;
    chunks.forEach(function (c) { full.set(c, offset); offset += c.byteLength; });
    return full;
}

async function sha256Hex(data) {
    const buf = (data instanceof Uint8Array) ? data : new Uint8Array(data);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest)).map(function (b) {
        return b.toString(16).padStart(2, "0");
    }).join("");
}

// 注入跨源隔离头，保证 COOP/COEP 生效，使多线程引擎可正常运行。
function withIsolationHeaders(response) {
    if (!response) return response;
    const status = response.status;
    if (status < 200 || status > 599 || response.type === "opaque" || response.type === "opaqueredirect") {
        return response;
    }
    try {
        const headers = new Headers(response.headers);
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, {
            status: status,
            statusText: response.statusText,
            headers: headers
        });
    } catch (e) {
        return response;
    }
}