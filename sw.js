// Fengfan Xiangqi Service Worker
// 缓存优先加载，刷新后依靠离线资源快速启动；
// 同时为所有响应注入跨源隔离头，保证多线程 WASM 引擎（SharedArrayBuffer）可用。
//
// v8: 引擎文件（pikafish.js / .wasm / .data）采用
//   "首次成功缓存 + 缓存优先(秒开) + 后台无感校验更新(stale-while-revalidate)" 策略：
//   - 首次加载成功后写入持久引擎缓存，后续打开直接复用缓存，秒开且可离线；
//   - 命中缓存先立即返回，再后台用 ETag/Last-Modified 做条件请求(304 零流量)自动检测版本，
//     发现引擎更新则无感替换本地缓存，下次打开即用最新版，且绝不阻塞首次加载；
//   - 引擎缓存与应用外壳缓存解耦，升级 sw 不会清掉已缓存的 ~50MB 引擎数据。
//   - ~50MB 的 pikafish.data 只在运行时首次下载时流式缓存，绝不放进 install 预缓存，
//     避免 install 阻塞激活(ready)导致引擎进度卡在 0%。

const APP_CACHE = "fengfan-xiangqi-app-v8";
const ENGINE_CACHE = "fengfan-xiangqi-engine";

// 应用外壳：体积小，随版本号提升强制刷新。
const PRECACHE = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css"
];

// 引擎文件：体积大（.data 约 50MB），持久缓存并后台校验更新。
const ENGINE_FILES = [
    "/wasm/pikafish.js",
    "/wasm/pikafish.wasm",
    "/wasm/pikafish.data"
];

function isEngineRequest(url) {
    return ENGINE_FILES.indexOf(url.pathname) !== -1;
}

// 安装：仅预缓存应用外壳，并立即接管
// （allSettled 保证任一失败也不会阻塞激活，防止隔离迟迟不来、进度卡 0%）。
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(APP_CACHE).then(function(cache) {
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

// 激活：先把旧版本缓存里的引擎文件搬运到持久缓存，再清理旧缓存并接管页面。
self.addEventListener("activate", function(event) {
    event.waitUntil(
        (async function() {
            await migrateEngineCache();
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(function(k) {
                    return k !== APP_CACHE && k !== ENGINE_CACHE;
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
    // 非 GET、跨源请求（如云库 chessdb.cn）不拦截，交给浏览器原生处理。
    if (event.request.method !== "GET") {
        return;
    }
    if (new URL(event.request.url).origin !== location.origin) {
        return;
    }
    event.respondWith(
        serve(event.request).catch(function(e) {
            // 兜底也失败时返回 504，绝不向上抛未捕获的 Promise 拒绝
            return new Response(null, { status: 504, statusText: "Network Unavailable" });
        })
    );
});

async function serve(request) {
    const url = new URL(request.url);
    if (isEngineRequest(url)) {
        return serveEngine(request);
    }

    // 应用外壳：体积小，命中秒开/未命中直接网络。
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(request);
    if (cached) {
        return withIsolationHeaders(cached);
    }
    const response = await fetch(request);
    if (isValidResponse(response) && response.type === "basic") {
        cache.put(request, response.clone()).catch(function(e) {
            console.error("[xiangqi-sw] cache.put failed:", e);
        });
    }
    return withIsolationHeaders(response);
}

// 引擎文件入口：优先命中"已验证"的完整缓存（秒开）；
// 缺失/不可信/半截 的缓存一律丢弃并重新完整下载，绝不返回损坏数据导致卡 0。
async function serveEngine(request) {
    const url = new URL(request.url);
    const cache = await caches.open(ENGINE_CACHE);
    const cached = await cache.match(request);
    if (cached) {
        const meta = await getEngineMeta();
        const rec = meta[url.pathname];
        if (rec && rec.verified === true && rec.len > 0) {
            // 已验证的完整缓存：秒开 + 后台无感版本校验。
            revalidateEngine(request);
            return withIsolationHeaders(cached);
        }
        // 旧版本写入的未验证明细：可能是半截/损坏，丢弃后重新完整下载，避免"卡 0"。
        try {
            await cache.delete(request);
        } catch (e) { /* 忽略删除失败 */ }
    }
    return cacheEngineFromNetwork(request, cache);
}

// 首次下载引擎：一边把数据流转发给页面，一边在 SW 内缓冲；
// 只有"完整接收 && 未被中断(刷新/关页)"时才将完整副本写入缓存。
// 这样刷新中途退出不会留下半截缓存条目，下次刷新仍会重新完整加载，进度不会卡在 0。
async function cacheEngineFromNetwork(request, cache) {
    const url = new URL(request.url);
    const response = await fetch(request);
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
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    received += value.byteLength;
                    chunks.push(value);
                    controller.enqueue(value);
                }
                controller.close();
                // 已完整读完且未被中断 -> 才提交缓存，并标记为已验证。
                if (!aborted && (contentLength === 0 || received === contentLength)) {
                    const full = new Uint8Array(received);
                    let offset = 0;
                    for (const c of chunks) {
                        full.set(c, offset);
                        offset += c.byteLength;
                    }
                    await cache.put(request, new Response(full, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers
                    }));
                    const meta = await getEngineMeta();
                    meta[url.pathname] = { verified: true, len: received, contentLength: contentLength };
                    await saveEngineMeta(meta);
                }
            } catch (e) {
                if (!aborted) {
                    try { controller.error(e); } catch (_) { /* 忽略 */ }
                }
                // 中断/出错：不提交任何缓存，下次刷新重新完整下载。
            }
        },
        cancel() {
            aborted = true;
            if (reader && typeof reader.cancel === "function") {
                reader.cancel().catch(function() { /* 忽略取消错误 */ });
            }
        }
    }), {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });

    return withIsolationHeaders(forwarded);
}

// ---- 引擎缓存"完整校验"元数据 ----
// 只有在引擎文件被完整下载并成功提交后才能被标记为 verified=true。
// 否则（半截/中断/旧版本写入）SW 会视为不可信，重新完整下载，杜绝"卡 0"。
const META_KEY = "/__xiangqi_engine_meta__";

async function getEngineMeta() {
    try {
        const cache = await caches.open(ENGINE_CACHE);
        const r = await cache.match(META_KEY);
        if (!r) {
            return {};
        }
        return await r.json().catch(function() { return {}; });
    } catch (e) {
        return {};
    }
}

async function saveEngineMeta(meta) {
    try {
        const cache = await caches.open(ENGINE_CACHE);
        await cache.put(META_KEY, new Response(JSON.stringify(meta), {
            headers: { "Content-Type": "application/json" }
        }));
    } catch (e) {
        // 元数据写失败不影响主流程，下次打开会重算
    }
}

// 后台无感校验引擎版本（stale-while-revalidate）：
// 命中缓存先秒开；这里用 HEAD 请求（零流量、无 body）拿到服务器当前引擎的
// 版本指纹（ETag/Last-Modified），与本地缓存对比：
//   - 一致 -> 什么都不做，零流量；
//   - 变化（或本地无缓存）-> 后台全量下载新版并更新缓存，下次打开即用新版；
// 全程不 await 到主响应，绝不阻塞首次加载。
const revalidatingEngine = new Set();

function versionFingerprint(response) {
    if (!response) {
        return null;
    }
    return response.headers.get("etag") || response.headers.get("last-modified") || null;
}

async function revalidateEngine(request) {
    const key = request.url;
    if (revalidatingEngine.has(key)) {
        return;
    }
    revalidatingEngine.add(key);
    try {
        const cache = await caches.open(ENGINE_CACHE);
        const cached = await cache.match(request);
        const head = await fetch(request.url, { method: "HEAD", cache: "reload" });
        if (!head.ok) {
            return;
        }
        const serverV = versionFingerprint(head);
        const cachedV = versionFingerprint(cached);
        if (cached && serverV && serverV === cachedV) {
            return; // 版本未变化，无需更新
        }
        const fresh = await fetch(request.url, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            // 后台独立完整下载：缓冲确认完整后提交，并刷新"已验证"标记。
            const bytes = await readAllBytes(fresh.body);
            await cache.put(request, new Response(bytes, { headers: fresh.headers }));
            const url = new URL(request.url);
            const meta = await getEngineMeta();
            meta[url.pathname] = { verified: true, len: bytes.byteLength || bytes.length, contentLength: bytes.byteLength || bytes.length };
            await saveEngineMeta(meta);
        }
    } catch (e) {
        // 网络失败：保留现有缓存，静默忽略，下次打开再校验。
    } finally {
        revalidatingEngine.delete(key);
    }
}

async function readAllBytes(body) {
    const reader = body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        size += value.byteLength;
    }
    const full = new Uint8Array(size);
    let offset = 0;
    for (const c of chunks) {
        full.set(c, offset);
        offset += c.byteLength;
    }
    return full;
}

// 迁移：升级 sw 时把旧缓存里的引擎文件搬运到持久缓存，
// 避免用户升级后重新下载 ~50MB 引擎数据、丧失"秒开"。
// 注意：旧缓存条目无法验证是否完整，故迁移后不被标记 verified，
// 首次打开会重新下载一次并标记，确保绝不会复现"卡 0"的损坏缓存。
async function migrateEngineCache() {
    const engineCache = await caches.open(ENGINE_CACHE);
    const keys = await caches.keys();
    for (const key of keys) {
        if (key === APP_CACHE || key === ENGINE_CACHE) {
            continue;
        }
        let legacyCache;
        try {
            legacyCache = await caches.open(key);
        } catch (e) {
            continue;
        }
        for (const path of ENGINE_FILES) {
            const url = new URL(path, location.origin).href;
            try {
                if (await engineCache.match(url)) {
                    continue;
                }
                const legacy = await legacyCache.match(url);
                if (legacy) {
                    await engineCache.put(url, legacy);
                }
            } catch (e) {
                // 忽略单个文件的迁移失败，不影响整体流程
            }
        }
    }
}

// 判断响应是否可安全重构（状态码为 [200,599] 且非 opaque）
function isValidResponse(response) {
    return !!response && typeof response.status === "number" &&
        response.status >= 200 && response.status < 600 &&
        response.type !== "opaque" && response.type !== "opaqueredirect";
}

// 注入跨源隔离头，保证 COOP/COEP 生效，使多线程引擎可正常运行。
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