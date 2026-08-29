// ============================================================================
// Fengfan Xiangqi Service Worker
//
// 缓存策略：内容哈希精确同步（以 version.json 的 sha256 为唯一真值源）
//
//   "哪个文件变了"只由 version.json 里的 sha256 决定，不依赖服务器的 ETag：
//   1. 每次加载某个文件时，先取最新 version.json，比对该文件的 sha256：
//        - 一致       -> 直接用缓存（未变：不重新下载，且缓存内容即最新）；
//        - 不一致/无缓存 -> 回源下载这一个文件并覆盖缓存，返回最新。
//      因此"改了哪个文件，就只更新哪个文件的缓存，其余全部沿用"。
//   2. 大文件 pikafish.data（~50MB）：下载时算一次 sha256 并缓存到 meta 条目，
//      之后每次只做"version.json 哈希 vs 已存哈希"的字符串比对（秒级，不读 50MB），
//      未变不重下；只有哈希真的变了才回源重下并重算哈希。
//   3. 离线：version.json / 回源失败时回退缓存，离线仍能打开。
//   4. 所有响应统一注入 COOP/COEP，保证多线程 WASM（SharedArrayBuffer）可用，
//      避免无痕模式下引擎卡在 0%。
// ============================================================================

"use strict";

// 缓存结构版本：仅当缓存读写结构变化时手动递增（v1 -> v2 ...）。
// 本次仅新增 data 的 meta 哈希条目，内容/读写结构兼容，保持 v1，避免清空旧缓存重下。
const CACHE_NAME = "fengfan-xiangqi-files-v1";
const MANIFEST_PATH = "/version.json";
const DATA_PATH = "/wasm/pikafish.data";
const DATA_META_KEY = "/__meta/pikafish.data.sha256"; // 仅内部记录 data 的 sha256，非真实文件

// 应用外壳（小体积）：离线首屏所需的最小集合。
// 引擎大文件（pikafish.js/.wasm/.data）按需下载 + 缓存，不阻塞激活。
const APP_SHELL = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

// ----------------------------------------------------------------------------
// 安装：仅预缓存外壳并立即 skipWaiting，尽快接管页面。
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

    event.respondWith(serve(req));
});

// ----------------------------------------------------------------------------
// 核心分流：清单/大文件各自特殊处理，其余按小文件精确比对。
// ----------------------------------------------------------------------------
async function serve(request) {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(request.url);

    // 导航请求（HTML 文档）走快速通道：直接 Network-First 并注入 COOP/COEP，
    // 不等待 version.json 拉取和 sha256 计算。无痕模式首屏时引擎卡 0% 的根因
    // 正是多线程 WASM 需要的 SharedArrayBuffer 拿不到（页面未跨源隔离），而隔离头
    // 只能由 SW 在导航响应里注入；若导航被哈希比对拖慢/拖垮，隔离就迟迟不生效。
    if (request.mode === "navigate") return networkFirst(request, cache);

    if (url.pathname === MANIFEST_PATH) return networkFirst(request, cache);
    if (url.pathname === DATA_PATH) return serveData(request, cache);
    return serveSmall(request, url, cache);
}

// ----------------------------------------------------------------------------
// 小文件（assets/js/css/html/wasm 等）：
//   用 version.json 的 sha256 精确比对；一致直接用缓存，不一致才回源重下。
// ----------------------------------------------------------------------------
async function serveSmall(request, url, cache) {
    const cached = await cache.match(request);
    const manifest = await getManifest(cache);
    const expected = manifest ? manifest[url.pathname] : undefined;

    if (expected && cached) {
        const hash = await sha256Hex(await readAllBytes(cached.clone().body));
        if (hash === expected) {
            return withIsolationHeaders(cached); // 缓存内容即最新，直接用
        }
    }

    return networkFirst(request, cache); // 变更或首次：回源拿最新
}

// ----------------------------------------------------------------------------
// 大文件 data：用 meta 里缓存的 sha256 与 version.json 比对（不读 50MB）；
//   匹配直接用缓存，不匹配才回源下载并重算哈希。
// ----------------------------------------------------------------------------
async function serveData(request, cache) {
    const manifest = await getManifest(cache);
    const expected = manifest ? manifest[DATA_PATH] : undefined;

    if (expected) {
        const stored = await readStoredSha(cache);
        if (stored === expected) {
            const cached = await cache.match(DATA_PATH);
            if (cached) return withIsolationHeaders(cached);
        }
    }

    // 需要回源：下载最新，算一次 sha256，写缓存 + 写 meta。
    try {
        const fresh = await fetch(DATA_PATH, { cache: "reload" });
        if (!(fresh.ok && fresh.type === "basic")) {
            const cached = await cache.match(DATA_PATH);
            if (cached) return withIsolationHeaders(cached);
            return withIsolationHeaders(fresh);
        }

        const bytes = await readAllBytes(fresh.clone().body);
        const sha = await sha256Hex(bytes);
        cache.put(DATA_PATH, fresh.clone()).catch(function () { /* 忽略，下次再写 */ });
        cache.put(DATA_META_KEY, new Response(sha, { headers: { "Content-Type": "text/plain" } }))
            .catch(function () { /* 忽略 */ });
        return withIsolationHeaders(fresh);
    } catch (e) {
        const cached = await cache.match(DATA_PATH);
        if (cached) return withIsolationHeaders(cached);
        return new Response(null, { status: 504, statusText: "Network Unavailable" });
    }
}

async function readStoredSha(cache) {
    try {
        const r = await cache.match(DATA_META_KEY);
        if (r) return (await r.text()).trim();
    } catch (e) { /* 忽略 */ }
    return null;
}

// ----------------------------------------------------------------------------
// 网络优先（用于 version.json 自身、无哈希文件、以及已确认要回源的文件）：
//   成功 -> 写缓存并返回；失败/异常 -> 回退缓存或 504。
// ----------------------------------------------------------------------------
async function networkFirst(request, cache) {
    try {
        const fresh = await fetch(request, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            cache.put(request, fresh.clone()).catch(function () { /* 忽略 */ });
            return withIsolationHeaders(fresh);
        }
        const cached = await cache.match(request);
        if (cached) return withIsolationHeaders(cached);
        return withIsolationHeaders(fresh);
    } catch (e) {
        const cached = await cache.match(request);
        if (cached) return withIsolationHeaders(cached);
        return new Response(null, { status: 504, statusText: "Network Unavailable" });
    }
}

// ----------------------------------------------------------------------------
// 清单（version.json）：同一加载周期内并发请求合并为单次回源；失败退回缓存清单。
// ----------------------------------------------------------------------------
let manifestInflight = null;

function getManifest(cache) {
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
                await cache.put(MANIFEST_PATH, fresh.clone()).catch(function () { /* 忽略 */ });
                return data;
            }
        }
    } catch (e) {
        // 回源失败：用缓存清单。
    }
    try {
        const r = await cache.match(MANIFEST_PATH);
        if (r) return (await r.json().catch(function () { return null; })) || null;
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