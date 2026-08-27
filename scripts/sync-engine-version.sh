#!/usr/bin/env bash
# ====================================================================
# 同步引擎版本号到 Service Worker
#   依据引擎文件内容哈希生成唯一且【稳定】的 ENGINE_VERSION：
#     - 引擎内容不变 -> 版本不变 -> 缓存名不变 -> 用户日常访问命中本地缓存，不再"隔天重下"；
#     - 引擎内容变化 -> 版本变化 -> sw.js 变化 -> 浏览器安装新 SW，激活时清掉旧缓存。
#   区别于"按构建时间戳生成版本"：本脚本只在引擎内容真正变化时才改版本，
#   避免每次部署都整体失效缓存、重复下载 ~50MB 引擎数据。
# ====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DATA="$ROOT/wasm/pikafish.data"
SW="$ROOT/sw.js"

if [ ! -f "$DATA" ]; then
  echo "错误：找不到 $DATA" >&2
  exit 1
fi

# 引擎内容哈希（前 16 位）作为 ENGINE_VERSION，内容不变则版本稳定。
ENGINE_VERSION="$(sha256sum "$DATA" | awk '{print $1}' | cut -c1-16)"

echo "同步引擎版本: $ENGINE_VERSION"

if [ -f "$SW" ]; then
  # 仅替换 sw.js 中 ENGINE_VERSION 的赋值，其余内容保持不动。
  sed -i -E "s/(ENGINE_VERSION[[:space:]]*=[[:space:]]*\")[^\"]*(\";)/\1${ENGINE_VERSION}\2/" "$SW"
  echo "已更新: $SW"
else
  echo "警告：文件不存在 $SW" >&2
fi

echo "完成"