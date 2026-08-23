// Fengfan Xiangqi Service Worker
// 缓存优先加载，刷新后依靠离线资源快速启动；
// 同时为所有响应注入跨源隔离头，保证多线程 WASM 引擎（SharedArrayBuffer）可用。
// v7: 不再在 install 预缓存 ~50MB 的引擎数据文件 pikafish.data。
// 之前它会在 install 阶段阻塞激活(ready)，导致跨源隔离的自动刷新迟迟不触发、
// 引擎进度长时间卡在 0%；改为运行时首次下载时流式缓存并实时上报进度。
// 缓存版本提升以强制清理旧缓存并换新 HTML/JS。

const CACHE = "fengfan-xiangqi-v7";

// 预缓存应用外壳与小型引擎脚本（.js/.wasm 只有 ~1MB），
// 大型 pikafish.data 走运行时缓存（见 serve()），避免阻塞 install。
const PRECACHE = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css",
    "/wasm/pikafish.js",
    "/wasm/pikafish.wasm"
];

// 安装：预缓存全部资源并立即接管（allSettled 保证任一失败也不会阻塞激活）
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return Promise.allSettled(
                PRECACHE.map(function(url) {
                    return cache.add(url);
                })
            );
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// 激活：清理旧缓存并接管所有页面。
// claim() 只允许"激活中或已激活"的 worker 调用，否则抛 InvalidStateError；
// 升级竞态时可能走到该边界，必须捕获，避免变成未处理的 Promise 拒绝。
self.addEventListener("activate", function(event) {
    event.waitUntil(
        (async function() {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(function(k) {
                    return k !== CACHE;
                }).map(function(k) {
                    return caches.delete(k);
                })
            );
            try {
                await self.clients.claim();
            } catch (e) {
                // 非致命：控制权在后续导航中会被 SW 正常接管，这里不能向上抛。
                console.warn("[xiangqi-sw] claim skipped:", e);
            }
        })()
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
        return;
    }
    event.respondWith(
        serve(event.request).catch(function(e) {
            // 任何处理异常都回退到普通网络请求，绝不因 SW 异常拖垮资源加载
            console.error(e);
            return fetch(event.request);
        })
    );
});

async function serve(request) {
    if (request.method !== "GET") {
        return withIsolationHeaders(await fetch(request));
    }

    const url = new URL(request.url);
    const sameOrigin = url.origin === location.origin;

    // 浏览器直接检索同名同源缓存，避免重复下载，保证刷新时快速、可离线
    if (sameOrigin) {
        const cached = await caches.match(request);
        if (cached) {
            return withIsolationHeaders(cached);
        }
    }

    const response = await fetch(request);
    if (isValidResponse(response)) {
        // 缓存同源响应；跨源（如云库 chessdb.cn）不缓存
        if (sameOrigin && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then(function(cache) {
                return cache.put(request, copy);
            }).catch(function(e) {
                console.error(e);
            });
        }
    }
    return withIsolationHeaders(response);
}

// 判断响应是否可安全重构（状态码为 [200,599] 且非 opaque）
function isValidResponse(response) {
    return !!response && typeof response.status === "number" &&
        response.status >= 200 && response.status < 600 &&
        response.type !== "opaque" && response.type !== "opaqueredirect";
}

// 注入跨源隔离头，保证 COOP/COEP 生效，使多线程引擎可正常运行。
// 对 opaque / 状态码不在合法范围的响应无法（也无需）重构，直接透传，
// 避免构造 Response 时抛 RangeError。
function withIsolationHeaders(response) {
    if (!response) {
        return response;
    }
    const status = response.status;
    if (status < 200 || status > 599 || response.type === "opaque" || response.type === "opaqueredirect") {
        return response;
    }
    try {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, {
            status: status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (e) {
        return response;
    }
}