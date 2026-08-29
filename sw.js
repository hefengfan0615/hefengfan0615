// ============================================================================
// Fengfan Xiangqi Service Worker
//
// 缓存策略：引擎 / 前端界面 分层缓存 + Cache First + stale-while-revalidate
//
//   命中缓存立即返回（快、不阻塞首屏），同时后台回源校验，并用 version.json
//   的 sha256 作为唯一真值源做精确比对（不依赖不可靠的服务器 ETag）：
//     —— 哪个文件 hash 变了，就只下载替换那一个文件，其余沿用缓存；
//     —— 未变则完全不动，保持最新且不多下。
//   引擎大文件 pikafish.data（~50MB）：下载时算一次 sha256 存 meta，
//   之后只做字符串比对（秒级，不读 50MB），未变不重下。
//
//   所有响应统一注入 COOP/COEP，保证多线程 WASM（SharedArrayBuffer）可用，
//   避免无痕模式引擎卡在 0%。
// ============================================================================

"use strict";

const CACHE_NAME = "fengfan-xiangqi-files-v1";
const MANIFEST_PATH = "/version.json";
const DATA_PATH = "/wasm/pikafish.data";
const DATA_META_KEY = "/__meta/pikafish.data.sha256"; // 仅内部记录 data 的 sha256，非真实文件

// 前端界面外壳：小体积，安装时预缓存，保证离线首屏
const APP_SHELL = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

// 引擎文件判断（本项目为 pikafish.js / .wasm / .data）
function isEngineFile(urlPath) {
    return urlPath.indexOf("/wasm/pikafish.js") >= 0 ||
           urlPath.indexOf("/wasm/pikafish.wasm") >= 0 ||
           urlPath.indexOf("/wasm/pikafish.data") >= 0;
}

// ----------------------------------------------------------------------------
// 安装：预缓存前端外壳并立即 skipWaiting，尽快接管页面。
// ----------------------------------------------------------------------------
self.addEventListener("install", function (event) {
    event.waitUntil(
        (async function () {
            const cache = await caches.open(CACHE_NAME);
            await Promise.allSettled(
                APP_SHELL.map(function (u) { return cache.add(u); })
            );
            await self.skipWaiting();
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
        })().catch(function () { /* 清理/接管失败不影响后续 fetch */ })
    );
});

// ----------------------------------------------------------------------------
// 通知所有打开页面：缓存内容有更新，可提示刷新/重启。
// ----------------------------------------------------------------------------
function notifyUpdate() {
    self.clients.matchAll({ type: "window" }).then(function (list) {
        list.forEach(function (c) { c.postMessage({ type: "CACHE_UPDATED" }); });
    });
}

// ----------------------------------------------------------------------------
// 抓取：仅拦截同源 GET 请求。
// ----------------------------------------------------------------------------
self.addEventListener("fetch", function (event) {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(serve(req, url));
});

// ----------------------------------------------------------------------------
// 核心分流：清单 / 导航走网络优先；引擎文件与前端资源走 Cache First + SWR。
// ----------------------------------------------------------------------------
async function serve(req, url) {
    const cache = await caches.open(CACHE_NAME);

    // version.json 自身：必须拿到最新清单。
    if (url.pathname === MANIFEST_PATH) return networkFirst(req, cache);

    // 导航请求（HTML 文档）：网络优先，保证界面每次都是最新，并第一时间注入
    // COOP/COEP 建立跨源隔离（无痕模式卡 0% 的修复就靠这条快速通道）。
    if (req.mode === "navigate") return networkFirst(req, cache);

    // 引擎文件：Cache First + SWR。
    if (isEngineFile(url.pathname)) {
        // 大文件 data 单独走 meta 哈希逻辑，避免每次读 50MB 计算。
        if (url.pathname === DATA_PATH) return cacheFirstData(req, cache);
        return cacheFirstSWR(req, url, cache);
    }

    // 前端界面资源：Cache First + SWR。
    return cacheFirstSWR(req, url, cache);
}

// ----------------------------------------------------------------------------
// 小文件（前端 assets / 引擎 js·wasm）：Cache First + stale-while-revalidate。
//   命中缓存立即返回；后台用 version.json 的 sha256 校验，变了才回源更新缓存。
// ----------------------------------------------------------------------------
async function cacheFirstSWR(req, url, cache) {
    const cached = await cache.match(req);

    // 后台校验并更新（不阻塞本次响应）
    const refreshing = (async function () {
        try {
            const manifest = await getManifest(cache);
            const expected = manifest ? manifest[url.pathname] : undefined;
            if (expected && cached) {
                const hash = await sha256Hex(await readAllBytes(cached.clone().body));
                if (hash === expected) return; // 缓存内容即最新，无需更新
            }
            const fresh = await fetch(req, { cache: "reload" });
            if (fresh && fresh.ok && fresh.type === "basic") {
                await cache.put(req, fresh.clone()).catch(function () {});
                if (cached) notifyUpdate();
            }
        } catch (e) { /* 忽略，回退缓存即可 */ }
    })();

    if (cached) {
        return withIsolationHeaders(cached); // 立即返回缓存（stale）
    }

    // 无缓存：等待后台回源完成再返回
    await refreshing;
    const freshCached = await cache.match(req);
    if (freshCached) return withIsolationHeaders(freshCached);
    return new Response(null, { status: 504, statusText: "Network Unavailable" });
}

// ----------------------------------------------------------------------------
// 引擎大文件 pikafish.data：Cache First + SWR + meta 哈希。
//   命中缓存立即返回；后台比对 version.json 哈希与已存 meta 哈希（字符串比对），
//   一致不动，不一致才回源下载并重算 sha256 更新 meta。
// ----------------------------------------------------------------------------
async function cacheFirstData(req, cache) {
    const cached = await cache.match(DATA_PATH);

    const refreshing = (async function () {
        try {
            const manifest = await getManifest(cache);
            const expected = manifest ? manifest[DATA_PATH] : undefined;
            if (expected) {
                const stored = await readStoredSha(cache);
                if (stored === expected) return; // 已最新
            }
            const fresh = await fetch(DATA_PATH, { cache: "reload" });
            if (fresh && fresh.ok && fresh.type === "basic") {
                const bytes = await readAllBytes(fresh.clone().body);
                const sha = await sha256Hex(bytes);
                await cache.put(DATA_PATH, fresh.clone()).catch(function () {});
                await cache.put(DATA_META_KEY, new Response(sha, { headers: { "Content-Type": "text/plain" } }))
                    .catch(function () {});
                if (cached) notifyUpdate();
            }
        } catch (e) { /* 忽略 */ }
    })();

    if (cached) {
        return withIsolationHeaders(cached);
    }

    await refreshing;
    const freshCached = await cache.match(DATA_PATH);
    if (freshCached) return withIsolationHeaders(freshCached);
    return new Response(null, { status: 504, statusText: "Network Unavailable" });
}

async function readStoredSha(cache) {
    try {
        const r = await cache.match(DATA_META_KEY);
        if (r) return (await r.text()).trim();
    } catch (e) { /* 忽略 */ }
    return null;
}

// ----------------------------------------------------------------------------
// 网络优先（用于 version.json 与导航文档）：成功写缓存返回，失败回退缓存。
// ----------------------------------------------------------------------------
async function networkFirst(req, cache) {
    try {
        const fresh = await fetch(req, { cache: "reload" });
        if (fresh && fresh.ok && fresh.type === "basic") {
            await cache.put(req, fresh.clone()).catch(function () {});
            return withIsolationHeaders(fresh);
        }
        const cached = await cache.match(req);
        if (cached) return withIsolationHeaders(cached);
        return withIsolationHeaders(fresh);
    } catch (e) {
        const cached = await cache.match(req);
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
        if (fresh && fresh.ok && fresh.type === "basic") {
            const data = await fresh.json().catch(function () { return null; });
            if (data) {
                await cache.put(MANIFEST_PATH, fresh.clone()).catch(function () {});
                return data;
            }
        }
    } catch (e) { /* 回源失败：用缓存清单 */ }
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
    if (!body) return new Uint8Array(0);
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

// ----------------------------------------------------------------------------
// 来自页面的指令：跳过等待 / 清空缓存。
// ----------------------------------------------------------------------------
self.addEventListener("message", function (event) {
    const d = event.data || {};
    if (d.type === "SKIP_WAITING") {
        self.skipWaiting();
    } else if (d.type === "CLEAR_CACHE") {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(function () { return self.clients.matchAll(); })
                .then(function (list) {
                    list.forEach(function (c) { c.postMessage({ type: "CACHE_CLEARED" }); });
                })
        );
    }
});