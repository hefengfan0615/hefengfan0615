// Fengfan Xiangqi Service Worker
// 缓存优先加载，刷新后依靠离线资源快速启动；
// 同时为所有响应注入跨源隔离头，保证多线程 WASM 引擎（SharedArrayBuffer）可用。
//
// v9: 引擎文件与前端文件统一采用"逐文件"离线缓存策略：
//   - 每个文件（引擎 pikafish.js/.wasm/.data，以及前端 xiangqiai.html/assets/*）
//     独立缓存；仓库里内容未变化的文件，始终继续引用本地缓存不重新下载；
//     只有内容真正变化的文件，才会被后台无感校验发现并单独更新。
//   - 命中任意缓存先立即返回（秒开），随后后台对每个文件做 ETag/Last-Modified
//     指纹比对（HEAD 请求，零流量）：
//       指纹一致 -> 什么都不做，继续用缓存；
//       指纹变化 -> 只下载该文件并替换本地缓存；
//       文件在仓库被删除/改名(404) -> 清掉对应缓存条目。
//   - 全程不 await 到主响应，绝不阻塞首次加载。
//   - ~50MB 的 pikafish.data 只在运行时首次下载时缓冲提交，绝不放进 install 预缓存，
//     且只有"完整接收 && 未被中断"才写缓存，避免进度卡在 0%。

const APP_CACHE = "fengfan-xiangqi-app-v9";
const ENGINE_CACHE = "fengfan-xiangqi-engine";

// 应用外壳：体积小，安装时预缓存用于离线秒开；版本更新由逐文件校验接管，
// 不再依赖整体版本号强制刷新，只更新实际变化的那几个文件。
// version.json 记录所有被缓存文件的内容哈希（sha256），部署时由 CI 生成：
//   只改前端 -> 只有前端文件的哈希变化 -> 只重下前端文件；
//   只改引擎 -> 只有引擎文件的哈希变化 -> 只重下引擎文件。
const PRECACHE = [
    "/xiangqiai.html",
    "/assets/index.b58f0dd0.js",
    "/assets/index.65062099.css",
    "/version.json"
];

// 引擎文件：体积大（.data 约 50MB），持久缓存；同样按文件校验更新。
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

// 统一分发：引擎与前端走同一套"缓存优先 + 逐文件后台校验"逻辑，
// 唯一差别是引擎文件在命中前还会做完整性校验（防止半截/损坏缓存导致卡 0）。
async function serve(request) {
    const url = new URL(request.url);
    const engine = isEngineRequest(url);
    const cache = await caches.open(engine ? ENGINE_CACHE : APP_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        const rec = await getMetaRecord(url.pathname);
        if (engine && !(rec && rec.verified === true && rec.len > 0)) {
            // 引擎缓存存在但无法确认完整（旧版本/半截）-> 丢弃后重新完整下载。
            try { await cache.delete(request); } catch (e) { /* 忽略 */ }
        } else {
            // 命中缓存：先秒开，再后台对该文件做指纹校验，只更新变化的那一个文件。
            revalidateFile(request, engine);
            return withIsolationHeaders(cached);
        }
    }
    return downloadAndStore(request, cache);
}

// 下载并缓存一个文件：一边把数据流转发给页面，一边在 SW 内缓冲；
// 只有"完整接收 && 未被中断(刷新/关页)"时，才把完整副本和 verified 标记写入缓存。
// 这样刷新中途退出不会留下半截缓存，彻底杜绝进度卡在 0。
async function downloadAndStore(request, cache) {
    const url = new URL(request.url);
    // cache:"reload" 绕过浏览器 HTTP/磁盘缓存，直接回源拉取完整文件。
    // 关键：首次下载若被退出网页打断，浏览器 HTTP 层可能残留一个"响应头是完整
    // Content-Length、body 却是半截"的坏缓存；下次请求若命中它，页面收到的字节
    // 停在某个进度就不再有数据到达(进度卡死)，只有强制 reload 才能彻底绕开，
    // 保证每次都从网络上取得完整文件。
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
                    const fullHash = await sha256Hex(full);
                    await markVerified(url.pathname, received, fullHash);
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

// ---- 缓存"完整校验"元数据 ----
// 每个文件只有完整下载成功后才被标记 verified=true；
// 否则视为不可信（旧版本/半截），引擎文件会被丢弃重新下载。
const META_KEY = "/__xiangqi_cache_meta__";

async function getCacheMeta() {
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

async function saveCacheMeta(meta) {
    try {
        const cache = await caches.open(ENGINE_CACHE);
        await cache.put(META_KEY, new Response(JSON.stringify(meta), {
            headers: { "Content-Type": "application/json" }
        }));
    } catch (e) {
        // 元数据写失败不影响主流程，下次打开会重算
    }
}

async function getMetaRecord(pathname) {
    const meta = await getCacheMeta();
    return meta[pathname] || null;
}

async function markVerified(pathname, len, hash) {
    const meta = await getCacheMeta();
    meta[pathname] = { verified: true, len: len, t: Date.now(), hash: hash || null };
    await saveCacheMeta(meta);
}

// ---- 内容哈希（sha256）----
// 用真实内容哈希判定"文件是否真的变化"，取代 mtime 型 ETag/Last-Modified。
// 这样"只改前端 -> 只重下前端；只改引擎 -> 只重下引擎"，部署刷新 mtime 不会误触发。
async function sha256Hex(data) {
    const buf = (data instanceof Uint8Array) ? data : new Uint8Array(data);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest)).map(function(b) {
        return b.toString(16).padStart(2, "0");
    }).join("");
}

// ---- 逐文件按"内容哈希清单"后台校验更新（stale-while-revalidate）----
// 命中缓存先秒开；这里对【每一个文件】，引入由 CI 生成的 /version.json：
//   - 清单里该文件有 sha256 -> 与本地缓存记录的内容哈希比对：
//       * 相同 -> 该文件没变，继续用缓存（不重下）；
//       * 不同 -> 只重下这一个文件并替换。
//   - 清单里没有该文件（旧版/未收录）-> 退回 ETag/Last-Modified 判定。
//   - 文件在仓库删除/改名(404/410) -> 清掉对应缓存条目。
// 内容哈希与 mtime 无关：部署刷新时间戳不会误触发下载，
// 真正做到"只改前端 -> 只更新前端缓存；只改引擎 -> 只更新引擎缓存"。
// 全程不 await 到主响应，绝不阻塞首次加载。
const revalidating = new Set();

const MANIFEST_PATH = "/version.json";

// 读取已缓存的版本清单；没有则返回 null（回退 ETag 判定）。
async function getManifest() {
    try {
        const cache = await caches.open(APP_CACHE);
        const r = await cache.match(MANIFEST_PATH);
        if (!r) {
            return null;
        }
        return await r.json().catch(function() { return null; }) || null;
    } catch (e) {
        return null;
    }
}

// 后台刷新版本清单（体积小，零负担）。失败保留现有清单。
async function refreshManifest() {
    try {
        const fresh = await fetch(MANIFEST_PATH, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            const bytes = await readAllBytes(fresh.body);
            const cache = await caches.open(APP_CACHE);
            await cache.put(MANIFEST_PATH, new Response(bytes, { headers: fresh.headers }));
        }
    } catch (e) {
        // 忽略：本次拿不到清单就以现有缓存判定。
    }
}

function versionFingerprint(response) {
    if (!response) {
        return null;
    }
    return response.headers.get("etag") || response.headers.get("last-modified") || null;
}

async function revalidateFile(request, engine) {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (revalidating.has(key)) {
        return;
    }
    revalidating.add(key);
    try {
        const cache = await caches.open(engine ? ENGINE_CACHE : APP_CACHE);
        const cached = await cache.match(request);

        // 先用 HEAD 判断文件是否已被删除（不触发下载）。
        const head = await fetch(request.url, { method: "HEAD", cache: "reload" });
        if (head.status === 404 || head.status === 410) {
            if (cached) {
                try { await cache.delete(request); } catch (e) { /* 忽略 */ }
                try {
                    const meta = await getCacheMeta();
                    delete meta[url.pathname];
                    await saveCacheMeta(meta);
                } catch (e) { /* 忽略 */ }
            }
            return;
        }
        if (!head.ok) {
            return; // 网络/服务器异常：保留现有缓存，下次再校验。
        }

        // 读取清单，尝试用"内容哈希"精确判定这个文件是否真的变了。
        await refreshManifest();
        const manifest = await getManifest();
        const manifestHash = manifest ? (manifest[url.pathname] || null) : null;

        let needUpdate = false;
        if (manifestHash) {
            // 有内容哈希：拿到本地缓存的内容哈希再比对。
            let rec = await getMetaRecord(url.pathname);
            let cachedHash = (rec && rec.hash) || null;
            if (!cachedHash && cached) {
                // 旧版缓存未记录哈希 -> 直接从缓存体算一次（本地，不重新下载），并存下来。
                cachedHash = await sha256Hex(await readAllBytes(cached.body));
                rec = Object.assign({}, rec || {}, {
                    verified: true,
                    len: 0,
                    t: Date.now(),
                    hash: cachedHash
                });
                const meta = await getCacheMeta();
                meta[url.pathname] = rec;
                await saveCacheMeta(meta);
            }
            needUpdate = !cached || cachedHash !== manifestHash;
        } else {
            // 无清单（旧版）：退回 ETag/Last-Modified 判定。
            const serverV = versionFingerprint(head);
            const cachedV = versionFingerprint(cached);
            needUpdate = !(cached && serverV && serverV === cachedV);
        }

        if (!needUpdate) {
            return; // 该文件未变化，继续使用缓存。
        }

        // 该文件内容真的变了（或本地不可用）：只更新这一个文件。
        const fresh = await fetch(request.url, { cache: "reload" });
        if (fresh.ok && fresh.type === "basic") {
            const bytes = await readAllBytes(fresh.body);
            await cache.put(request, new Response(bytes, { headers: fresh.headers }));
            const hash = await sha256Hex(bytes);
            await markVerified(url.pathname, bytes.byteLength || bytes.length, hash);
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
// 引擎首次打开会重新下载一次并标记，确保绝不会复现"卡 0"的损坏缓存。
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