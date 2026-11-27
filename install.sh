#!/usr/bin/env bash
# Anti-Tools One-Line Cross-Platform Installer for Antigravity 2.0 (macOS / Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.sh | bash
set -euo pipefail

REPO="${ANTI_TOOLS_REPO:-Felix2G/anti-tools}"
REQ_VER="${ANTI_TOOLS_VERSION:-}"

NODE_BIN=""
check_node_bin() {
  local cand="$1"
  [ -n "${cand}" ] && [ -x "${cand}" ] || return 1
  local major
  major="$("${cand}" -p "parseInt(process.versions.node.split('.')[0], 10)" 2>/dev/null || true)"
  if [ -n "${major}" ] && [ "${major}" -ge 20 ] 2>/dev/null; then
    NODE_BIN="${cand}"
    return 0
  fi
  return 1
}

if command -v node >/dev/null 2>&1; then
  check_node_bin "$(command -v node)" || true
fi

if [ -z "${NODE_BIN}" ]; then
  case "$(uname -s)" in
    Darwin)
      AGY_NODE_CAND="${ANTIGRAVITY_USER_DATA_DIR:-$HOME/Library/Application Support/Antigravity}/bin/agy-node"
      ;;
    *)
      AGY_NODE_CAND="${ANTIGRAVITY_USER_DATA_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/Antigravity}/bin/agy-node"
      ;;
  esac
  check_node_bin "${AGY_NODE_CAND}" || true
fi

if [ -z "${NODE_BIN}" ]; then
  echo "❌ Node.js 20+ or Antigravity built-in agy-node is required." >&2
  echo "   Please launch Antigravity once first, or install Node.js 20+: https://nodejs.org/" >&2
  exit 1
fi

case "${NODE_BIN}" in
  *agy-node*)
    echo "ℹ️  Using Antigravity built-in agy-node: ${NODE_BIN}"
    ;;
esac

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
    | "${NODE_BIN}" -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); const a = (d.assets||[]).find(x => /^anti-tools-agy2-.*\.zip$/i.test(x.name)); if (a && a.browser_download_url) process.stdout.write(a.browser_download_url);")"
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
export ANTI_TOOLS_NODE_BIN="${NODE_BIN}"
if [ -t 0 ]; then
  "${NODE_BIN}" "${INSTALLER}" "$@"
else
  "${NODE_BIN}" "${INSTALLER}" -y "$@"
fi
