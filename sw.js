// ============================================================================
// Fengfan Xiangqi Service Worker
//
// 缓存策略：Network-First（网络优先，缓存兜底）
//   1. 每次访问都先请求服务器，保证"每次加载都是最新文件"。
//   2. 已缓存的请求会带上 If-None-Match / If-Modified-Since 条件头，
//      服务器返回 304 表示内容未变 -> 直接用缓存（缓存即最新，且不重复传输 body，
//      对大文件 pikafish.data 尤其关键，避免每次刷新重下 ~50MB）。
//   3. 网络失败（彻底离线）-> 回退缓存，保证离线仍能加载。
//   4. 导航（HTML 文档）同样网络优先；离线时快速回退缓存并注入 COOP/COEP 隔离头，
//      避免多线程引擎拿不到 SharedArrayBuffer 而卡在 0%（无痕模式尤其明显）。
//   5. 所有响应统一注入 COOP/COEP，保证多线程 WASM 引擎（SharedArrayBuffer）可用。
// ============================================================================

"use strict";

// 缓存结构版本：仅当缓存读写结构变化时手动递增（v1 -> v2 ...）。
// 本次仅把"回源获取方式"从 Cache-First 改为 Network-First，缓存内容不变，
// 因此保持 v1，避免清空旧缓存导致所有文件（含 ~50MB 引擎数据）重新下载。
const CACHE_NAME = "fengfan-xiangqi-files-v1";

// 应用外壳（小体积）：离线首屏所需的最小集合。
// 引擎大文件（pikafish.js/.wasm/.data）按需下载 + 缓存，不阻塞激活。
const APP_SHELL = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

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

    event.respondWith(serve(req));
});

// ----------------------------------------------------------------------------
// 核心：Network-First（每次加载都取最新文件，缓存仅作离线兜底）。
// ----------------------------------------------------------------------------
async function serve(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    try {
        const fresh = await fetchFresh(request, cached);

        // 304：服务器确认内容未变，缓存里的即是最新，直接用。
        if (fresh.status === 304 && cached) {
            return withIsolationHeaders(cached);
        }

        // 2xx：拿到最新文件，写回缓存并原样返回。
        if (fresh.ok && fresh.type === "basic") {
            cache.put(request, fresh.clone()).catch(function () { /* 忽略，下次再写 */ });
            return withIsolationHeaders(fresh);
        }

        // 服务器返回异常（4xx/5xx）：优先用缓存兜底。
        if (cached) return withIsolationHeaders(cached);
        return withIsolationHeaders(fresh);
    } catch (e) {
        // 网络失败（离线）：回退缓存，离线仍可用。
        if (cached) return withIsolationHeaders(cached);
        return new Response(null, { status: 504, statusText: "Network Unavailable" });
    }
}

// 带条件请求头回源：缓存存在时用 ETag / Last-Modified 做 304 协商，
// 既保证每次拿到最新，又避免未变文件（尤其 ~50MB 的 pikafish.data）重复传输。
function fetchFresh(request, cached) {
    const headers = new Headers(request.headers);
    if (cached) {
        const etag = cached.headers.get("etag");
        const lastModified = cached.headers.get("last-modified");
        if (etag) headers.set("If-None-Match", etag);
        else if (lastModified) headers.set("If-Modified-Since", lastModified);
    }
    // cache:"no-store" 绕过浏览器 HTTP 缓存，确保真正向服务器确认最新；
    // 响应仍由我们上面的 cache.put 写入 Cache API，不受影响。
    return fetch(request, {
        method: request.method,
        headers: headers,
        cache: "no-store"
    });
}

// ----------------------------------------------------------------------------
// 注入跨源隔离头，保证 COOP/COEP 生效，使多线程引擎可正常运行。
// ----------------------------------------------------------------------------
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