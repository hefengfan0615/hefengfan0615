// Fengfan Xiangqi Service Worker
//
// 缓存原理（参考 https://github.com/hefengfan0615/fengfan 的版本化缓存策略）：
//   1. 版本化缓存名：CACHE_NAME = "fengfan-xiangqi-" + ENGINE_VERSION。
//      ENGINE_VERSION 由 CI 依据引擎内容哈希生成（见 scripts/sync-engine-version.sh）：
//        引擎内容不变 -> 版本不变 -> 缓存名不变 -> 用户日常访问永远命中本地缓存，不再"隔天重下";
//        引擎内容变化 -> 版本变化 -> sw.js 变化 -> 浏览器安装新 SW、激活时删除旧缓存，从而精准失效旧引擎。
//   2. 安装时仅预缓存应用外壳（小体积）并立即 skipWaiting 激活、接管页面，
//      促使文档尽快拿到 COOP/COEP 跨源隔离，从而让多线程 WASM 引擎尽早可用。
//      引擎大文件（pikafish.js/.wasm/.data）改为"按需流式下载 + 完整落缓存"：
//      不阻塞激活，避免无痕模式下每次全新建仓时安装被 ~50MB 下载卡住、
//      跨源隔离迟迟不来，导致引擎进度永远停在 0%。
//   3. 运行时 Cache First + stale-while-revalidate：命中缓存立即返回（秒开），
//      前端资源后台以 version.json 的内容哈希静默校验，只有内容真正变化的文件才单独重下。
//   4. 所有响应统一注入 COOP/COEP 隔离头，保证多线程 WASM 引擎（SharedArrayBuffer）可用。

"use strict";

// 引擎版本（CI 回写）。首次提交时由 scripts/sync-engine-version.sh 生成，
// 值为引擎数据文件 wasm/pikafish.data 内容哈希的前 16 位。
const ENGINE_VERSION = "3cd15292bf8c9798";
const CACHE_NAME = "fengfan-xiangqi-" + ENGINE_VERSION;

// 应用外壳（小体积）：离线秒开所需的最小集合。
// 前端入口资源为带哈希的文件名，随前端构建变化；这里仅预缓存当前入口，
// 其余资源由运行时 on-demand 缓存 + 内容哈希校验接管。
const APP_SHELL = [
    "/xiangqiai.html",
    "/manifest.json",
    "/icon-512.jpg",
    "/version.json",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

// 引擎文件（大体积，.data 约 50MB）：安装时与外壳一起预缓存，构成完整离线快照。
const ENGINE_FILES = [
    "/wasm/pikafish.js",
    "/wasm/pikafish.wasm",
    "/wasm/pikafish.data"
];

function isEngineRequest(url) {
    return ENGINE_FILES.indexOf(url.pathname) !== -1;
}

// ---------- 安装：仅预缓存外壳，快速激活与接管 ----------
// 引擎大文件不在此预缓存：安装 waitUntil 若等待 ~50MB 的 .data 下载，
// 会卡住激活 -> 文档迟迟拿不到 COOP/COEP -> 跨源隔离不来 -> 引擎卡在 0%。
// 引擎改为运行时按需流式下载（见 serve/downloadAndStore），边下边缓存、进度可感知。
self.addEventListener("install", function (event) {
    event.waitUntil(
        (async function () {
            const cache = await caches.open(CACHE_NAME);
            // 外壳：任一失败不阻塞激活与接管。
            await Promise.allSettled(
                APP_SHELL.map(function (url) { return cache.add(url); })
            );
            return self.skipWaiting();
        })()
    );
});

// ---------- 激活：清理旧版本缓存并立即接管 ----------
self.addEventListener("activate", function (event) {
    event.waitUntil(
        (async function () {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
            try {
                await self.clients.claim();
            } catch (e) {
                // 非致命：控制权在后续导航中会被 SW 正常接管。
            }
        })()
    );
});

// ---------- 抓取：Cache First + stale-while-revalidate ----------
self.addEventListener("fetch", function (event) {
    const req = event.request;
    // 非 GET、跨源请求不拦截，交给浏览器原生处理。
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        serve(req).catch(function () {
            // 兜底也失败时返回 504，绝不向上抛未捕获的 Promise 拒绝。
            return new Response(null, { status: 504, statusText: "Network Unavailable" });
        })
    );
});

async function serve(request) {
    const url = new URL(request.url);
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        if (!isEngineRequest(url)) {
            // 前端资源：命中即秒开，同时后台按内容哈希静默校验更新。
            revalidateFile(request);
        }
        // 引擎文件：由版本化缓存名保证一致性，命中直接使用，不做逐次校验。
        return withIsolationHeaders(cached);
    }

    return downloadAndStore(request, cache);
}

// ---------- 下载并缓存（完整接收后才落缓存）----------
async function downloadAndStore(request, cache) {
    const url = new URL(request.url);
    // cache:"reload" 绕过浏览器 HTTP/磁盘缓存，直接回源取得完整文件，避免读到半截坏缓存。
    const response = await fetch(request, { cache: "reload" });
    if (!isValidResponse(response)) {
        return withIsolationHeaders(response);
    }
    const headers = new Headers(response.headers);
    const contentLength = parseFloat(response.headers.get("content-length")) || 0;
    const chunks = [];
    let received = 0;
    let aborted = false;
    const reader = response.body.getReader();

    const forwarded = new Response(new ReadableStream({
        async start(controller) {
            try {
                for (;;) {
                    const chunk = await reader.read();
                    if (chunk.done) break;
                    received += chunk.value.byteLength;
                    chunks.push(chunk.value);
                    controller.enqueue(chunk.value);
                }
                controller.close();
                // 完整接收且未被中断 -> 才落缓存，杜绝半截缓存。
                if (!aborted && (contentLength === 0 || received === contentLength)) {
                    const full = new Uint8Array(received);
                    let offset = 0;
                    chunks.forEach(function (c) { full.set(c, offset); offset += c.byteLength; });
                    await cache.put(request, new Response(full, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers
                    }));
                }
            } catch (e) {
                if (!aborted) {
                    try { controller.error(e); } catch (_) { /* 忽略 */ }
                }
                // 中断/出错：不提交任何缓存，下次刷新重新完整下载。
            }
        },
        cancel: function () {
            aborted = true;
            if (reader && typeof reader.cancel === "function") {
                reader.cancel().catch(function () { /* 忽略取消错误 */ });
            }
        }
    }), {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });

    return withIsolationHeaders(forwarded);
}

// ---------- 前端资源后台校验（stale-while-revalidate）----------
const MANIFEST_PATH = "/version.json";
const revalidating = new Set();

async function getManifest() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const r = await cache.match(MANIFEST_PATH);
        if (!r) return null;
        return await r.json().catch(function () { return null; }) || null;
    } catch (e) {
        return null;
    }
}

async function refreshManifest() {
    try {
        const fresh = await fetch(MANIFEST_PATH, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(MANIFEST_PATH, fresh.clone());
        }
    } catch (e) {
        // 忽略：本次拿不到清单就以现有缓存判定。
    }
}

async function revalidateFile(request) {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (revalidating.has(key)) return;
    revalidating.add(key);
    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        // 先用 HEAD 判断文件是否已被删除（不触发下载）。
        const head = await fetch(request.url, { method: "HEAD", cache: "reload" });
        if (head.status === 404 || head.status === 410) {
            if (cached) {
                try { await cache.delete(request); } catch (e) { /* 忽略 */ }
            }
            return;
        }
        if (!head.ok) return; // 网络/服务器异常：保留现有缓存，下次再校验。

        await refreshManifest();
        const manifest = await getManifest();
        const manifestHash = manifest ? (manifest[url.pathname] || null) : null;

        let needUpdate = false;
        if (manifestHash) {
            if (cached) {
                const cachedHash = await sha256Hex(await readAllBytes(cached.body));
                needUpdate = cachedHash !== manifestHash;
            } else {
                needUpdate = true;
            }
        } else {
            const serverV = head.headers.get("etag") || head.headers.get("last-modified") || null;
            const cachedV = cached ? (cached.headers.get("etag") || cached.headers.get("last-modified") || null) : null;
            needUpdate = !(cached && serverV && serverV === cachedV);
        }

        if (!needUpdate) return;

        const fresh = await fetch(request.url, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            await cache.put(request, fresh.clone());
        }
    } catch (e) {
        // 网络失败：保留现有缓存，静默忽略，下次打开再校验。
    } finally {
        revalidating.delete(key);
    }
}

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

function isValidResponse(response) {
    return !!response && typeof response.status === "number" &&
        response.status >= 200 && response.status < 600 &&
        response.type !== "opaque" && response.type !== "opaqueredirect";
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