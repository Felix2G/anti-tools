#!/usr/bin/env bash
# Anti-Tools One-Line Cross-Platform Installer for Antigravity 2.0 (macOS / Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.sh | bash
set -euo pipefail

REPO="${ANTI_TOOLS_REPO:-Felix2G/anti-tools}"
REQ_VER="${ANTI_TOOLS_VERSION:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js 20+ is required. Please install Node.js first: https://nodejs.org/" >&2
  exit 1
fi

NODE_MAJOR="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "❌ Node.js 20+ is required (current: $(node -v))." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "❌ curl is required to download Anti-Tools." >&2
  exit 1
fi

TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t anti-tools-agy2)"
cleanup() { rm -rf "${TMP_DIR}"; }
trap cleanup EXIT

if [ -n "${REQ_VER}" ]; then
  CLEAN_VER="${REQ_VER#v}"
  ZIP_URL="https://github.com/${REPO}/releases/download/v${CLEAN_VER}/anti-tools-agy2-${CLEAN_VER}.zip"
else
  echo "🔎 Checking latest Anti-Tools AGY 2.0 release from ${REPO}..."
  ZIP_URL="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | node -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); const a = (d.assets||[]).find(x => /^anti-tools-agy2-.*\.zip$/i.test(x.name)); if (a && a.browser_download_url) process.stdout.write(a.browser_download_url);")"
fi

if [ -z "${ZIP_URL}" ]; then
  echo "❌ Could not find anti-tools-agy2-*.zip in latest GitHub Release of ${REPO}." >&2
  exit 1
fi

ZIP_PATH="${TMP_DIR}/anti-tools-agy2.zip"
EXTRACT_DIR="${TMP_DIR}/pkg"
mkdir -p "${EXTRACT_DIR}"

echo "⬇️  Downloading ${ZIP_URL}..."
curl -fL --progress-bar "${ZIP_URL}" -o "${ZIP_PATH}"

echo "📦 Extracting package..."
if command -v unzip >/dev/null 2>&1; then
  unzip -q "${ZIP_PATH}" -d "${EXTRACT_DIR}"
elif command -v python3 >/dev/null 2>&1; then
  python3 -m zipfile -e "${ZIP_PATH}" "${EXTRACT_DIR}"
else
  echo "❌ Neither 'unzip' nor 'python3' is available to extract zip archive." >&2
  exit 1
fi

INSTALLER="${EXTRACT_DIR}/scripts/install-agy2.js"
if [ ! -f "${INSTALLER}" ]; then
  echo "❌ Installer script not found inside archive: ${INSTALLER}" >&2
  exit 1
fi

echo "🚀 Running Anti-Tools AGY 2.0 installer..."
if [ -t 0 ]; then
  node "${INSTALLER}" "$@"
else
  node "${INSTALLER}" -y "$@"
fi

