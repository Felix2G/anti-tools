# Anti Tools

[🇺🇸 English](#english) | [🇨🇳 简体中文](#中文说明)

## English

![Views](https://komarev.com/ghpvc/?username=Felix2CN&label=Views&color=blue&style=flat)

**Antigravity Account Management, Automation & Remote Control Extension**

Anti Tools is a full-featured toolkit for **Antigravity AI IDE** and **Antigravity 2.0 (AGY 2.0)** across **Windows, macOS, and Linux**, providing multi-account switching, dual-bucket (`5H` + `Weekly`) quota monitoring, scheduled wake-up, CDP automation, AI Chat, multi-channel Bot remote control (Telegram / WeChat / QQ / WeCom / Feishu), Guardian daemon, and full **multi-language support** (English / Chinese).

- 🏪 **OpenVSX**: [open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)
- 📦 **IDE Manual Install**: Download latest `anti-tools-2.3.1.vsix` from [Releases](https://github.com/Felix2G/anti-tools/releases) → `Extensions: Install from VSIX...`
- 🚀 **Pure AGY 2.0 & AGY CLI (`agy`) Install**: Send the one-prompt install message below directly to AGY 2.0, run the one-line installer (`install.ps1` / `install.sh`), or download `anti-tools-agy2-2.3.1.zip` from [Releases](https://github.com/Felix2G/anti-tools/releases) — **zero Node.js setup required** (automatically falls back to Antigravity's built-in `agy-node`)!

> 🤖 **Fastest Install — Copy & Send to Antigravity 2.0 (Zero Manual Setup)**:
>
> `Please install Anti Tools for Antigravity 2.0 from https://github.com/Felix2G/anti-tools (read the README first). Run the official one-line installer for my OS (install.ps1 on Windows or install.sh on macOS/Linux), preferring local Node.js 20+ or automatically falling back to Antigravity's built-in agy-node. Keep my existing accounts, settings, and other plugins untouched, do not force-quit Antigravity, then verify with --status and tell me how to open the Anti Tools panel.`

---


## 🌟 Core Features

### 🔐 Intelligent Account & Schedule Management
- **Direct Switching in IDE**: Instant account switching via database injection with dual-insurance architecture (pre-exit injection + post-startup fallback).
- **Real-time Quota Monitoring**: Sidebar quota panel, low-quota warnings, status bar tooltips.
- **Schedule Visualization**: Automatic quota recovery timelines based on reset times and active windows.
- **Auto Wake-up**: Automated requests at predicted refresh points; fuzzy model matching.
- **Device Fingerprint Management**: Built-in Device Profile binding and randomization.

### 🚀 Antigravity 2.0 (AGY 2.0) Native Control Panel & Standalone Plugin ✨ *2026-11*
- **Native MCP App Control Panel**: Dual entrypoints in AGY 2.0 — right auxiliary side pane (`⋮ → Plugins > Anti Tools`) and left global sidebar (`Plugins → Anti Tools`), with auto light/dark theme sync and EN/ZH toggle.
  - **5-Tab Zero-IDE Console**: Accounts & dual-bucket (`5H` + `Weekly`) quotas (switch with optional auto-restart, manual wakeup, notes, device fingerprint binding, password-gated JSON import/export), **Local Usage & Cache Analytics** (53-week heatmap, cache hit rate & short-gap cache-drop alerts, per-request token speed/TTFT & reference USD cost — read-only via official MCP App with zero UI patching), Bot Center & Cron schedules (5 channels + WeChat QR + test notify + batch toggle), Guardian daemon/logs/CDP injection/workspace cleanup, and local AI Memory search & session viewer.
- **Seamless Dual-Client Coexistence**: Connects natively to Antigravity 2.0 across Windows, macOS, and Linux with zero conflict alongside Antigravity IDE.
- **Dual-Host Window Routing (`💻 IDE` + `🚀 AGY2`)**: When both Antigravity IDE and AGY 2.0 are running, `/send`, `/latest`, `/stop`, `/models`, `/select`, `/export`, and `/status` automatically discover all active workspaces across both hosts and provide inline window selection buttons.
- **Standalone AGY 2.0 Mode (Zero IDE Dependency)**: Guardian hosts the full Telegram & multi-channel Bot stack independently, including `/boot agy` remote startup, `/switch` credential + OS Keyring sync, and live Agent chat forwarding.
- **One-Command Cross-Platform Installer (`install-agy2.js`)**: Deploys the native AGY 2.0 plugin (MCP App control panel, memory & account tools, `/antisw`, `/antibot`, and background keepalive) and configures desktop launchers automatically.

### ⚡ AGY CLI Native Status Line & Seamless Multi-Account Switching ✨ *2026-09-10*
- **Btop-styled Micro Bar Status Line**: CLI native bottom status line rendering active account and live model quotas (Flash / Pro / Claude) with reset countdowns.
- **Cross-Platform Credential Sync**: Synchronizes credentials across IDE and `agy` CLI to OS Credential Managers (Windows Generic Credential / macOS Keychain / Linux Secret Service) — 100% credential sharing.
- **Terminal Fast Switching**: Interactive `/switch` skill and `anti-switch` (or `antisw`) terminal tool for rapid account switching directly from the command line.

### 📱 Bot Center — Multi-channel Remote Control ✨ *2026-03-25*
- **Telegram Bot**: Full-featured remote control — Agent interaction (supports **Group Chats** with dual-auth), tool activity display, model management, IDE notifications, session export, scheduled tasks, and remote terminal.
- **WeChat iLink** ✨: Personal WeChat integration via iLink protocol — zero external dependencies, text/image/voice/file bidirectional messaging, slash commands, and quote-reply support.
- **QQ Bot**: Native QQ Bot API v2 (C2C / Group / Channel), supports text commands.
- **WeCom / Feishu**: Channel-based integration with shared command menu support.
- **Two-Level Model Picker** ✨: Full model & thinking-effort support — pick a model group first, then choose effort tier (`XHigh / High / Medium / Low`), or jump directly via `/select neon xhigh`.
- **Friendly Offline Guidance**: When the IDE is closed, Bot channels provide clear offline guidance and available command menus automatically.
- **12+ Shared Commands** (all non-Telegram channels):
  - `/start` `/help` `/status` `/stop` `/latest` `/screenshot` `/models` `/select`
  - `/sendfile` — Fuzzy file search with paginated results + one-tap send
  - `/export` — Export current Agent session as Markdown
  - `/boot` `/shutdown` `/recent` — Remote IDE control
- **Auto-restart Guardian**: Enabling / disabling / clearing a channel config automatically restarts Guardian — no manual action required.

### 🤖 High-performance Auto-Accept (CDP)
- **Deep CDP Injection**: Penetrates Shadow DOM and Iframes for millisecond-level automated clicking.
- **Queued Messages Auto-Dispatch** ✨: Automatically detects and clicks "Send Now" / "立即发送" to flush queued message cards when Agent is busy.
- **Auto-Open Agent Chat**: Automatically opens Agent Chat if detected as closed.
- **Auto-Model Detection**: Real-time model reading and switching via CDP.
- **Security Guard**: Built-in dangerous command blacklist to prevent high-risk automation.
- **Token Usage Stats**: Status bar real-time `🧠 Token 👣 Files 💾 Storage`, refreshing every 10s.

### 🧠 Enterprise MCP Memory Engine ✨ *100% Local*
- **Standard MCP Architecture**: Decoupled persistent memory layer supporting `search` and `getDetail` (L1-L3) progressive retrieval.
- **Auto-Session Compression**: AI-driven long-term memory dimensionality reduction via Gemini Flash to prevent context bloat.
- **Virtual Document Visualization**: Built-in `💡 16KB` status bar toggle for native VS Code Markdown memory base reading.
- **Privacy & Safety**: `<private>` tags for selective persistence and automatic Token desensitization.
- **Cloud Sync Support**: Cross-device memory synchronization via GitHub / Cloud Drive.

### 💬 AI Chat Assistant
- **12 Preset Templates**: OpenAI, Claude, Gemini, Deepseek, Kimi, Ollama, etc.
- **Agent Mode** ✨: AI-driven tool calling — read/edit/create/delete files, execute terminal commands, with fine-grained auto-approve permissions.
- **Code Context**: One-click submission of current file/selection; copy/insert code blocks.
- **Multimodal Support**: Image upload via selection/paste/drag-and-drop (OpenAI Vision format).

### 📖 Sandbox Preview & Professional Export ✨ *2026-04-15*
- **Isolated HTML Preview**: Safe Sandbox `iframe` preview for workspace HTML files with zero CSS/JS conflict.
- **Headless PDF Export**: Professional Edge/Chrome Headless-level PDF report generation with one-click.
- **Markdown Live Reload**: Real-time rendering with GitHub-themed styles.

### ☁️ Cloud Sync & Token Management
- **Cloud Folder Sync**: OneDrive / Google Drive / Dropbox local sync folder.
- **GitHub Gist Sync**: Private Gist with auto-create and update.
- **GitHub Knowledge Sync** ✨: Push/pull knowledge base, workflows, and skills to a private GitHub repo.
- **AES-256 Encryption**: All synced data encrypted; API keys stored via VS Code SecretStorage.
- **Bot Config Sync**: Telegram Bot token + multi-channel credentials (QQ / WeChat / WeCom / Feishu) are included in the encrypted sync payload.

### 🛡️ Transparent Proxy (Windows)
- **Seamless Integration**: `version.dll` injection — only Antigravity core traffic is proxied.
- **Auto System Proxy & Startup Health Check** ✨: Automatically detects and adapts to your active system proxy, with non-blocking startup alerts if the configured proxy port goes offline.
- **Zero Dependencies**: Configure SOCKS5/HTTP directly in the extension.

### 🔐 Unified Security Password
- **IDE side**: Set via command palette; required for sensitive actions (API key copy, export).
- **Guardian side**: `/unlock`, `/lock`, `/setpwd` remote commands.

### 🛡️ Guardian Daemon
- **Cross-Platform Native Autostart** ✨: Silent background hosting via Windows Startup, macOS LaunchAgent, and Linux `systemd --user`.
- **Heartbeat Monitoring**: Detects frozen or closed IDE processes and takes over Bot control seamlessly.
- **Adaptive Proxy & Failover**: Auto-detects system proxy across Windows / macOS / Linux with automatic failover when an offline proxy port is detected.

### 🖥️ Multi-instance Management ✨ *2026-03-19*
- **Instance Isolation**: Each instance has its own account, workspace, and CDP port.
- **TG Remote Scheduling**: `/use` to switch active instance; `/instances` for global status.

### 🪟 Multi-window Management ✨ *2026-03-27*
- **Smart Window Discovery**: `/shutdown` and `/status` use CDP port scanning to detect all active project windows.
- **Selective Window Close**: Choose which project window to close via inline buttons.
- **Screenshot Focus**: `bringToFront` ensures the target window is captured correctly.

### 📖 Markdown Preview & Export ✨ *2026-03-27*
- **Rich Preview**: One-click GitHub-styled Markdown preview from the editor title bar.
- **HTML Export**: Export rendered Markdown as a standalone HTML file.
- **PDF Export**: Generate PDF via Edge/Chrome headless (cross-platform); falls back to browser print.
- **Live Reload**: Preview auto-refreshes as you edit the source file.

---

## 🌐 Language / 语言

The extension interface and Telegram Bot support **English and Chinese**. Language is auto-detected from your IDE locale, or you can manually set it in the extension settings.

| Setting | Options | Default |
|:---|:---|:---|
| `anti-tools.language` | `auto` / `zh-cn` / `en` | `auto` |
| `anti-tools.telegram.botLanguage` | `auto` / `zh-cn` / `en` | `auto` |

- **IDE UI** — Follows your IDE display language automatically.
- **Bot replies** — Follows `botLanguage` setting; `auto` tracks the IDE language.
- **First-run prompt** — Non-Chinese IDE users receive a one-time prompt to switch to English.

---

## 📋 System Requirements

| Item | Requirements |
|:---|:---|
| **OS** | Windows 10/11, macOS, Linux *(Note: `version.dll` Transparent Proxy is Windows-only)* |
| **Host** | Antigravity AI IDE (VS Code-based), **Antigravity 2.0 (`AGY 2.0`)**, and/or **Antigravity CLI (`agy`)** |
| **Dependencies** | None ✅ (Self-contained bundles; standalone AGY 2.0 / CLI installer uses local Node.js 20+ or automatically falls back to Antigravity's built-in `agy-node`) |

---

## 🛠️ Pure Antigravity 2.0 & AGY CLI (`agy`) Installation (Without IDE)

If you **only** use **Antigravity 2.0** and/or **Antigravity CLI (`agy`)** (both share `~/.gemini/config/plugins/` instead of VS Code `.vsix`), install via any method below on Windows, macOS, or Linux:

1. **One-Line Remote Install (Recommended, zero manual download)**:
   - **Windows (PowerShell)**:
     ```powershell
     irm https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.ps1 | iex
     ```
   - **macOS / Linux**:
     ```bash
     curl -fsSL https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.sh | bash
     ```
2. **From Standalone Release Zip (Zero build dependencies, also drop-in ready)**:
   Download `anti-tools-agy2-2.3.1.zip` from [Releases](https://github.com/Felix2G/anti-tools/releases), unzip it, and run:
   ```bash
   node scripts/install-agy2.js
   ```
   *(Or unzip directly into `~/.gemini/config/plugins/anti-tools/` for instant `${PLUGIN_ROOT}` plug-and-play, or install via `agy plugin install` from branch `agy2-plugin` of `Felix2G/anti-tools`.)*
3. **From Release `.vsix`**:
   ```bash
   unzip anti-tools-2.3.1.vsix -d anti-tools-pkg
   node anti-tools-pkg/extension/scripts/install-agy2.js
   ```
4. **From Source Repository**:
   ```bash
   npm install && npm run compile
   npm run setup:agy2
   ```
- **Opening the Control Panel in AGY 2.0**:
  - After installation, reload MCP servers (or restart AGY 2.0) and open **Anti Tools** from either the right-top menu **`⋮ → Plugins > Anti Tools`** (side pane) or the left sidebar **`Plugins → Anti Tools`** (full page).
- **Using in Antigravity CLI (`agy`)**:
  - **Live Bottom Quota Status Line**: Auto-configured in `~/.gemini/antigravity-cli/settings.json` (`type: "command"`, `stack_with_default: true`) to render dual-bucket (`5H` + `Weekly`) gauges and reset countdowns below the prompt. Use `/statusline off` or `/statusline reset` inside `agy` to toggle anytime.
  - **Slash Commands inside `agy`**:
    - `/antisw` (or `/anti-tools:antisw`): List all accounts & live quotas; pass `<index|email>` to switch with OS Keyring sync, `--add` for browser OAuth onboarding, or `--sync` to import current login.
    - `/antibot` (or `/anti-tools:antibot`): Configure Telegram / WeChat QR / Feishu / WeCom / QQ Bots and manage Guardian daemon.
  - **Direct Terminal Commands (outside `agy`)**:
    - Interactive arrow-key account switcher: `node ~/.antigravity_tools/runtime/cli/switch.js`
    - Bot wizard / WeChat QR / Status: `node ~/.antigravity_tools/runtime/install-agy2.js --config` | `--wechat-login` | `--status`
  - **Built-in MCP Tools**: Local SQLite memory (`memory_*`), cross-channel notifications (`notify_user_channel`), knowledge sync (`sync_knowledge_base`), and workspace cleanup (`clean_workspace_artifacts`) load automatically inside `agy`.
- **Bot Configuration & Management** (anytime after install via `~/.antigravity_tools/runtime/install-agy2.js` or `/antibot` in AGY 2.0 chat):
  - `--config` — Interactive multi-channel menu (Telegram + Proxy / WeChat iLink QR Scan / Feishu / WeCom / QQ)
  - `--wechat-login` — One-command personal WeChat QR scan binding (opens QR page in browser, auto-restarts daemon)
  - `--bot-token=XXX --user-ids=123456 [--proxy=http://127.0.0.1:7890] -y` — Headless Telegram setup
  - `--status` / `--restart` / `--uninstall` — Inspect status, restart daemon, or cleanly uninstall (preserving account/memory data)
- **Zero-State Account Onboarding & Switching** (`/antisw` in AGY 2.0 chat):
  - First run automatically imports your active AGY 2.0 Google account; run `/antisw --add` (or press `a` in interactive table) to bind additional Google accounts directly via browser OAuth.

---

## 🔒 System Operations Disclosure

| Action | Path | Description |
|:---|:---|:---|
| **Config** | `~/.antigravity_tools/` | Account data, fingerprints, `guardian.json`, etc. |
| **Guardian** | `~/.antigravity_tools/guardian/` (or `runtime/guardian/`) | Daemon deployment path |
| **AGY 2.0 Plugin** | `~/.gemini/config/plugins/anti-tools/` | Native AGY 2.0 MCP, `/antisw`, `/antibot` & keepalive hook |
| **Database** | `state.vscdb` & `~/.gemini/antigravity/` + OS Keyring | Login state injection & cross-platform credential sync |
| **CDP** | `argv.json` / `.lnk` / `.app` / `.desktop` | Adds `--remote-debugging-port=9000` (IDE) & `19000` (AGY 2.0) |

---

## 🚀 Telegram Bot Setup Guide

1. **Create Bot & Get Token**
   - Search for **@BotFather** in Telegram.
   - Send `/newbot`, set a name and a username (must end in `bot`).
   - Copy the HTTP API **Token** (e.g., `123456:ABC-DEF...`).
2. **Get Your User ID**
   - Search for **@userinfobot** or **@getmyid_bot**.
   - Send `/start` and copy your numerical **ID** (e.g., `123456789`).
3. **Configure in IDE**
   - Open Settings (`Ctrl + ,`), search for `Anti Tools Telegram`.
   - **Telegram: Enabled**: Check this to enable the bot.
   - **Telegram: Bot Token**: Paste the token from Step 1.
   - **Telegram: Allowed User Ids**: Paste your User ID from Step 2. (Mandatory for security).
   - **Telegram: Enable Guardian**: (Recommended) Check this to allow background daemon processing, auto-start, and IDE remote wake-up.
4. **Apply Settings**
   - **Restart the IDE** (or Reload Window).
   - Go to your Bot in Telegram and send `/start` or `/status` to verify the connection.

---

## 🤖 Telegram Bot Commands

### Basic
| Command | Description |
|:---|:---|
| `/start` | Show main menu |
| `/status` | IDE status, account, model, quota |
| `/help` | Full help |

### Agent
| Command | Description |
|:---|:---|
| `/send <msg>` | Send to Agent (supports `--model` param) |
| `/stop` | Stop current generation |
| `/latest` | Get latest reply (supports `export` param) |
| `/models` | Available model list with quotas |
| `/select <name>` | Switch model |
| `/sendfile <keyword>` | Fuzzy search + send file from workspace |
| `/export` | Export current session as Markdown |

### Account & Quota
| Command | Description |
|:---|:---|
| `/quotas` | All account quota summary + switch buttons |
| `/switch <id>` | Remote account switch |
| `/screenshot` | Capture IDE screenshot |
| `/instances` | List all instances and status |
| `/use <label>` | Switch active control instance |

### Scheduled Tasks
| Command | Description |
|:---|:---|
| `/schedule list` | View and manage Cron tasks |
| `/schedule add` | Add task |
| `/schedule import` | Bulk import tasks |
| `/schedule del` | Delete task |
| `/autoreset` | Toggle Guardian quota-reset auto-wakeup |

### Remote Control (Guardian)
| Command | Description |
|:---|:---|
| `/boot [agy]` | Remote start IDE or Antigravity 2.0 (`/boot agy`) |
| `/shutdown` | Remote close IDE |
| `/recent` | Open recent project |
| `/new_project` | Interactive new project |
| `/cmd <cmd>` | Shell command (requires unlock) |
| `/file_get <path>` | Retrieve file (requires unlock) |
| `/unlock` | 🔐 Unlock sensitive operations |
| `/lock` | 🔐 Manual lock |
| `/setpwd <pwd>` | 🔐 Remote set/change password |

---

## ⌨️ Keybindings

| Keys | Feature |
|:---|:---|
| `Ctrl+Alt+Shift+U` | Toggle Auto-Accept (ON/OFF) |

---

## 📄 Credits

- **Core inspiration**: [Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) by [lbjlaq](https://github.com/lbjlaq)
- **Proxy driver**: [antigravity-proxy](https://github.com/yuaotian/antigravity-proxy) by [yuaotian](https://github.com/yuaotian)
- **CDP inspiration**: [auto-accept-agent](https://github.com/Munkhin/auto-accept-agent) by [Munkhin](https://github.com/Munkhin)
- **UI reference**: [vscode-antigravity-cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit) by [jlcodes99](https://github.com/jlcodes99)

---

## 📜 License

MIT License. For educational and efficiency purposes only. Please comply with platform terms of use.

**Author**: [Felix2CN](https://github.com/Felix2G) | **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## 中文说明

[🇺🇸 English](#english) | [🇨🇳 简体中文](#中文说明)

Anti Tools 是面向 **Antigravity AI IDE** 与 **Antigravity 2.0 (AGY 2.0)** 打造的全平台（**Windows / macOS / Linux**）效率套件，提供多账号极速切换、双周期（`5H` + `周度 W`）实时配额监控、排程唤醒、CDP 自动化、AI Chat、多渠道 Bot 远程控制（Telegram / 微信 / QQ / 企微 / 飞书）、Guardian 守护进程，以及完整的**中英文双语界面**。

- 🏪 **Open VSX**: [open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)
- 📦 **IDE 手动安装**：从 [Releases](https://github.com/Felix2G/anti-tools/releases) 下载 `anti-tools-2.3.1.vsix` → `Extensions: Install from VSIX...`
- 🚀 **纯 AGY 2.0 / AGY CLI (`agy`) 独立安装**：直接复制下方提示词发给 AGY 2.0 自动安装，或执行一行远程命令（`install.ps1` / `install.sh`）——**无需安装 IDE，也无需预先安装 Node.js**（自动回退使用 Antigravity 内置 `agy-node`）！

> 🤖 **最简安装 — 复制下面这段话直接发给 Antigravity 2.0 自动安装（零环境依赖）**：
>
> `请帮我安装 Anti Tools（Antigravity 2.0 版）：https://github.com/Felix2G/anti-tools 。先阅读 README，按当前操作系统执行官方一行安装脚本（Windows 用 install.ps1，macOS/Linux 用 install.sh），优先使用本机 Node.js 20+，若未安装则自动回退使用 Antigravity 自带的 agy-node。保留我现有的账号、设置与其他插件，不要强制关闭当前客户端；安装完成后执行 --status 核对结果并告诉我如何打开 Anti Tools 控制面板。`

---

## 🌟 核心功能

### 🔐 智能账号与排程管理
- **IDE 内直接切换**：通过数据库注入实现极速账号切换，双重保险架构（退出前注入 + 启动后兜底）。
- **实时配额监控**：侧边栏配额面板、低配额警告、状态栏 Tooltip。
- **排程可视化**：根据重置时间和活跃窗口自动规划配额恢复时间线。
- **自动唤醒**：在预测刷新点自动发起请求；支持模糊模型匹配。
- **设备指纹管理**：内置 Device Profile 绑定与随机化。

### 🚀 Antigravity 2.0 (AGY 2.0) 原生控制面板与独立插件支持 ✨ *2026-11*
- **原生 MCP App 交互式控制面板**：原生接入 AGY 2.0 双入口——右侧辅助栏（`⋮ → Plugins > Anti Tools`）与左侧全局导航栏（`Plugins → Anti Tools`），支持明暗双主题自动同步与中/英双语切换。
  - **5 大核心控制台标签页**：账号与双池配额（切号自动重启选项、手动唤醒、备注、设备指纹、安全密码保护下的 JSON 导入导出）、**本地用量与缓存统计**（纯只读解析本地日志、零侵入客户端 UI：53 周使用热力图、综合缓存命中率与短间隔异常掉缓存标红、单次请求流式速度/TTFT 与标准 API 参考费用）、Bot 中心与 Cron 定时任务（5 渠道配置 + 个人微信扫码 + 一键测试推送 + 批量启停）、Guardian 守护/脱敏日志/CDP 注入/工作区清理，以及本地 AI 记忆库检索与历史会话查看。
- **双端零冲突无缝共存**：在 Windows、macOS、Linux 下原生对接 Antigravity 2.0，与 Antigravity IDE 同时运行互不干扰。
- **双宿主多窗口协同路由（`💻 IDE` + `🚀 AGY2`）**：当电脑同时打开 Antigravity IDE 与 AGY 2.0 时，`/send`、`/latest`、`/stop`、`/models`、`/select`、`/export`、`/status` 自动合并枚举双端所有工作区窗口并弹出内联选窗按钮。
- **纯 AGY 2.0 无 IDE 独立运行**：Guardian 独立承载完整 Telegram 与多渠道 Bot 交互，支持 `/boot agy` 远程拉起 AGY 2.0、`/switch` 无缝同步凭据与系统级 Keyring，以及实时 Agent 对话转发与截图。
- **跨平台一键安装引导（`install-agy2.js`）**：一键部署 AGY 2.0 原生插件（含 MCP App 控制面板、本地记忆与切号工具、`/antisw` 与 `/antibot` 技能及后台自动保活），并按系统自动配置桌面启动器。

### ⚡ AGY CLI 原生状态栏与全平台切号协同 ✨ *2026-09-10*
- **Btop 风格微型刻度条状态栏**：CLI 原生底层常驻渲染当前账号与各模型（Flash / Pro / Claude）实时百分比配额及重置倒计时。
- **IDE 与 CLI 双端系统级凭据无缝共享**：切号时自动跨平台同步至系统凭据管理器（Windows Generic Credential `gemini:antigravity` / macOS Keychain / Linux Secret Service），实现 IDE 与 `agy` CLI 凭据 100% 共享。
- **终端交互式极速切号**：提供 `/switch` 技能及全局 `anti-switch` (或 `antisw`) 命令行工具，支持终端上下光标交互选号与即时无缝切号。

### 📱 Bot 中心 — 多渠道远程控制 ✨ *2026-03-25*
- **Telegram Bot**：完整远程控制——Agent 交互（支持**群组协作**与双重鉴权）、工具活动展示、模型管理、IDE 通知、会话导出、定时任务、远程终端。
- **微信 iLink** ✨：个人微信接入（iLink 协议）——零外部依赖，支持文字/图片/语音/文件双向消息、斜杠命令、引用回复。
- **QQ Bot**：原生 QQ Bot API v2（C2C / 群组 / 频道），支持文字命令。
- **企业微信 / 飞书**：渠道接入，共享统一命令菜单。
- **全渠道二级选模菜单** ✨：完整支持最新模型与思考档位——先选基础模型，再调档位（`XHigh / High / Medium / Low`），纯文本渠道亦支持 `/select neon xhigh` 一步直切。
- **IDE 离线友好指引**：IDE 未启动时自动提供清晰离线提示与可用指令清单（内置防刷屏冷却）。
- **12+ 共享命令**（所有非 Telegram 渠道）：
  - `/start` `/help` `/status` `/stop` `/latest` `/screenshot` `/models` `/select`
  - `/sendfile` — 模糊文件搜索 + 分页浏览 + 一键发送
  - `/export` — 导出当前 Agent 会话为 Markdown
  - `/boot` `/shutdown` `/recent` — 远程 IDE 控制
- **渠道配置后自动重启**：启用/禁用/清除渠道配置后自动触发 Guardian 重启，无需手动操作。

### 🤖 高性能自动接受（CDP）
- **深度 CDP 注入**：穿透 Shadow DOM 和 Iframe，毫秒级自动点击。
- **待发排队消息自动出队** ✨：自动探测并即时触发「Send Now / 立即发送」卡片，防止 Agent 忙碌时消息阻塞在排队区。
- **自动打开 Agent Chat**：检测到未打开时自动唤起。
- **自动模型检测**：通过 CDP 实时读取并切换当前模型。
- **安全守卫**：内置危险命令黑名单，防止高风险自动化。
- **Token 用量统计**：状态栏实时显示 `🧠 Token 👣 文件 💾 存储`，每 10 秒刷新。

### 🧠 企业级 MCP 记忆引擎 ✨ *100% 本地*
- **标准 MCP 架构**：解耦的长效记忆持久层，支持 `search` 与 `getDetail` (L1-L3) 渐进式检索。
- **Session 自动压缩**：基于 Gemini Flash 的 AI 驱动降维算法，防止长会话 context 爆裂。
- **原生可视化大盘**：内建 `💡 16KB` 状态栏常驻开关，支持 VS Code 原生级 Markdown 记忆库阅读。
- **隐私与脱敏**：支持 `<private>` 标签选择性持久化及敏感 Token 自动脱敏。
- **云端同步**：支持通过 GitHub 或云盘进行跨设备记忆库无缝同步。

### 💬 AI Chat 助手
- **12 种预设模板**：OpenAI、Claude、Gemini、Deepseek、Kimi、Ollama 等。
- **Agent 模式** ✨：AI 驱动的工具调用——读取/编辑/创建/删除文件、执行终端命令，支持细粒度自动批准权限。
- **代码上下文**：一键提交当前文件/选中内容，复制/插入代码块。
- **多模态支持**：通过选择/粘贴/拖拽上传图片（OpenAI Vision 格式）。

### 📖 沙盒预览与专业导出 ✨ *2026-04-15*
- **隔离 HTML 预览**：针对工作区 HTML 文件的安全 `iframe` 沙盒预览，零样式干扰。
- **Headless PDF 导出**：一键调用 Edge/Chrome Headless 级内核生成专业 PDF 报告。
- **Markdown 实时预览**：支持 GitHub 风格主题的高性能渲染与实时刷新。

### ☁️ 云同步与 Token 管理
- **云盘文件夹同步**：OneDrive / Google Drive / Dropbox 本地同步目录。
- **GitHub Gist 同步**：私有 Gist，自动创建与更新。
- **GitHub 知识库同步** ✨：将知识库、工作流、Skills 推送/拉取到 GitHub 私有仓库。
- **AES-256 加密**：所有同步数据加密；API Key 存储于 VS Code SecretStorage。
- **Bot 配置同步**：Telegram Bot Token 及多渠道凭据（QQ / 微信 / 企微 / 飞书）一并纳入加密同步载荷。

### 🛡️ 透明代理（Windows）
- **无缝接入**：`version.dll` 注入，仅代理 Antigravity 核心流量。
- **自动适配系统代理与启动健康自检** ✨：启用时自动匹配当前系统活跃代理，启动若发现代理端口离线将主动弹出快捷同步或一键停用提示。
- **零依赖**：直接在插件设置中配置 SOCKS5/HTTP。

### 🔐 统一安全密码
- **IDE 端**：通过命令面板设置；敏感操作（复制 API Key、导出文件）需验证。
- **Guardian 端**：`/unlock`、`/lock`、`/setpwd` 远程命令。

### 🛡️ Guardian 守护进程
- **跨平台原生自启动** ✨：支持 Windows 启动项、macOS LaunchAgent 与 Linux `systemd --user` 静默后台托管。
- **心跳监控**：检测 IDE 关闭或假死并无缝接管 Bot 控制权。
- **自适应代理与熔断切换**：跨平台自动探测系统代理，遇失效代理端口自动顺位切换或降级直连。

### 🖥️ 多实例管理 ✨ *2026-03-19*
- **实例隔离**：每个实例绑定独立账号、工作区和 CDP 端口。
- **TG 远程调度**：`/use` 切换操控目标；`/instances` 查看全局状态。

### 🪟 多窗口管理 ✨ *2026-03-27*
- **智能窗口发现**：`/shutdown` 和 `/status` 通过 CDP 端口扫描发现所有活动项目窗口。
- **选择性关闭窗口**：通过内联按钮选择要关闭的项目窗口。
- **截图聚焦**：`bringToFront` 确保目标窗口正确截取。

### 📖 Markdown 预览与导出 ✨ *2026-03-27*
- **富文本预览**：编辑器标题栏一键打开 GitHub 风格 Markdown 预览。
- **HTML 导出**：将渲染后的 Markdown 导出为独立 HTML 文件。
- **PDF 导出**：通过 Edge/Chrome headless 生成 PDF（跨平台）；未找到浏览器时自动降级。
- **实时刷新**：编辑源文件时预览自动同步更新。

---

## 🌐 语言设置

插件界面与 Telegram Bot 回复支持**中英文双语**，自动跟随 IDE 语言，也可手动设置。

| 设置项 | 可选值 | 默认值 |
|:---|:---|:---|
| `anti-tools.language` | `auto` / `zh-cn` / `en` | `auto` |
| `anti-tools.telegram.botLanguage` | `auto` / `zh-cn` / `en` | `auto` |

- **IDE 界面** — 自动跟随 IDE 显示语言。
- **Bot 回复** — 跟随 `botLanguage` 设置；`auto` 时与 IDE 语言联动。
- **首次使用提示** — 非中文 IDE 用户将收到一次切换至英文的提示。

---

## 📋 系统要求

| 项目 | 要求 |
|:---|:---|
| **操作系统** | Windows 10/11、macOS、Linux *(注：`version.dll` 透明进程代理仅限 Windows)* |
| **宿主环境** | Antigravity AI IDE（基于 VS Code）、**Antigravity 2.0（`AGY 2.0`）** 及/或 **Antigravity CLI（`agy`）** |
| **运行依赖** | 无 ✅（单文件自包含打包；纯 AGY 2.0 / CLI 安装脚本优先使用本机 Node.js 20+，未安装时自动回退复用 Antigravity 内置 `agy-node`） |

---

## 🛠️ 纯 Antigravity 2.0 & AGY CLI（`agy`）独立安装指南（未安装 IDE）

如果你的电脑**仅安装了 Antigravity 2.0 和/或 Antigravity CLI（`agy`）**（两者共用 `~/.gemini/config/plugins/` 原生插件体系，不支持直接导入 `.vsix`），在 Windows / macOS / Linux 下任选一种方式即可一键部署全部功能：

1. **方式一：一行命令远程自动安装（推荐，免手动下载解压）**
   - **Windows (PowerShell)**：
     ```powershell
     irm https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.ps1 | iex
     ```
   - **macOS / Linux**：
     ```bash
     curl -fsSL https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.sh | bash
     ```
2. **方式二：下载纯 AGY 2.0 独立压缩包安装（免编译，同时支持即插即用）**
   从 [Releases](https://github.com/Felix2G/anti-tools/releases) 下载 `anti-tools-agy2-2.3.1.zip`，解压后执行：
   ```bash
   node scripts/install-agy2.js
   ```
   *(压缩包本身已内置 `${PLUGIN_ROOT}` 标准插件清单，也可直接解压至 `~/.gemini/config/plugins/anti-tools/` 即插即用，或使用 `agy plugin install` 拉取 `Felix2G/anti-tools` 的 `agy2-plugin` 分支。)*
3. **方式三：从 Release `.vsix` 解压安装**
   ```bash
   unzip anti-tools-2.3.1.vsix -d anti-tools-pkg
   node anti-tools-pkg/extension/scripts/install-agy2.js
   ```
4. **方式四：从源码仓库编译安装**
   ```bash
   npm install && npm run compile
   npm run setup:agy2
   ```
- **在 AGY 2.0 中打开控制面板**：
  - 安装完成并重载 MCP 服务（或重启 AGY 2.0）后，可通过右上角 **`⋮ → Plugins > Anti Tools`**（右侧辅助栏）或左侧边栏 **`Plugins → Anti Tools`**（全屏主控台）直接打开图形化操作面板。
- **在 Antigravity CLI（`agy`）中使用**：
  - **底部实时配额状态栏**：安装时自动写入 `~/.gemini/antigravity-cli/settings.json`（`type: "command"`、`stack_with_default: true`），启动 `agy` 即在底部展示 Btop 风格彩色双池（`5H` + `周度 W`）配额与重置倒计时；在 `agy` 中可随时用 `/statusline off` 关闭或 `/statusline reset` 恢复默认。
  - **`agy` 内斜杠指令**：
    - `/antisw`（或 `/anti-tools:antisw`）：查看全部账号实时配额；加 `<序号|邮箱>` 极速切号并自动同步系统 Keyring；加 `--add` 拉起浏览器 OAuth 绑定新账号；加 `--sync` 导入当前已登录账号。
    - `/antibot`（或 `/anti-tools:antibot`）：引导配置 Telegram / 个人微信扫码 / 飞书 / 企微 / QQ 机器人与管理 Guardian 守护进程。
  - **独立终端命令（不进 `agy` 也能用）**：
    - 方向键交互切号面板：`node ~/.antigravity_tools/runtime/cli/switch.js`
    - 渠道配置 / 微信扫码 / 状态检查：`node ~/.antigravity_tools/runtime/install-agy2.js --config` | `--wechat-login` | `--status`
  - **自动加载的 MCP 能力**：本地 SQLite 记忆库（`memory_*`）、跨渠道消息推送（`notify_user_channel`）、知识库同步（`sync_knowledge_base`）与工作区临时文件清理（`clean_workspace_artifacts`）均在 `agy` 中开箱即用。
- **Bot 渠道配置与日常管理**（安装后脚本会自动常驻保存至 `~/.antigravity_tools/runtime/install-agy2.js`，也可直接在 AGY 2.0 对话框输入 `/antibot` 让 AI 引导配置）：
  - `--config` — 打开全渠道交互配置菜单（Telegram + 代理 / 个人微信 iLink 扫码直连 / 飞书 / 企微 / QQ）
  - `--wechat-login` — 一键拉起个人微信二维码页面扫码绑定并自动热重启生效（无需公网 IP 与开发者认证）
  - `--bot-token=XXX --user-ids=123456 [--proxy=http://127.0.0.1:7890] -y` — 无交互一键配置 Telegram
  - `--status` / `--restart` / `--uninstall` — 查看渠道与进程状态、平滑重启守护进程或干净卸载（完整保留账号与记忆数据库）
- **零状态账号导入与多账号绑定**（直接在 AGY 2.0 对话框输入 `/antisw`）：
  - 首次运行自动导入当前 AGY 2.0 已登录账号；执行 `/antisw --add`（或在交互式表格按 `a`）可直接拉起浏览器完成 Google OAuth 登录绑定多个账号，无需安装旧版 IDE。

---

## 🔒 系统操作说明

| 操作 | 路径 | 说明 |
|:---|:---|:---|
| **配置文件** | `~/.antigravity_tools/` | 账号数据、设备指纹、`guardian.json` 等 |
| **Guardian** | `~/.antigravity_tools/guardian/`（或 `runtime/guardian/`） | 守护进程独立部署路径 |
| **AGY 2.0 插件** | `~/.gemini/config/plugins/anti-tools/` | 原生 AGY 2.0 MCP 服务、`/antisw`、`/antibot` 与保活 Hook |
| **凭据同步** | `state.vscdb`、`~/.gemini/antigravity/` 与系统 Keyring | 账号切换时的多端登录态注入与凭据共享 |
| **CDP 端口** | `argv.json` / `.lnk` / `.app` / `.desktop` | 自动注入 `--remote-debugging-port=9000`（IDE）与 `19000`（AGY 2.0） |

---

## 🚀 Telegram Bot 配置指南

1. **创建 Bot 并获取 Token**
   - 在 Telegram 中搜索 **@BotFather**。
   - 发送 `/newbot`，按提示设置名称和 Username（必须包含 `bot`）。
   - 复制生成的 HTTP API **Token**。
2. **获取你的用户 ID**
   - 搜索并启动 **@userinfobot** 或 **@getmyid_bot**。
   - 发送 `/start` 并复制返回的纯数字 **ID**（例如 `123456789`）。
3. **在 IDE 中配置参数**
   - 打开设置 (`Ctrl + ,` / `Cmd + ,`)，搜索 `Anti Tools Telegram`。
   - **Telegram: Enabled**：勾选启用。
   - **Telegram: Bot Token**：填入步骤 1 的 Token。
   - **Telegram: Allowed User Ids**：填入步骤 2 的用户 ID。（**必填**安全白名单，多个用逗号分隔）。
   - **Telegram: Enable Guardian**：（强烈推荐）勾选开启守护进程，支持后台自启及远程唤醒。
4. **重启生效**
   - **重启编辑器**（或重载窗口）。
   - 向你的 Bot 发送 `/start` 或 `/status`，若弹出操作面板即代表配置成功。

---

## 🤖 Telegram Bot 命令

### 基础
| 命令 | 说明 |
|:---|:---|
| `/start` | 显示主菜单 |
| `/status` | IDE 状态、账号、模型、配额 |
| `/help` | 完整帮助 |

### Agent 交互
| 命令 | 说明 |
|:---|:---|
| `/send <消息>` | 向 Agent 发送消息（支持 `--model` 参数） |
| `/stop` | 中止当前生成 |
| `/continue` | 继续上一轮未完成的生成 |
| `/latest` | 获取最新回复（支持 `export` 参数） |
| `/models` | 可用模型列表及配额 |
| `/select <名称>` | 切换模型 |
| `/sendfile <关键词>` | 模糊搜索 + 发送工作区文件 |
| `/export` | 导出当前会话为 Markdown |

### 账号与配额
| 命令 | 说明 |
|:---|:---|
| `/quotas` | 所有账号配额汇总 + 切换按钮 |
| `/switch <id>` | 远程切换账号 |
| `/screenshot` | 截取 IDE 界面截图 |
| `/instances` | 查看所有实例状态 |
| `/use <标签>` | 切换操控目标实例 |

### 定时任务
| 命令 | 说明 |
|:---|:---|
| `/schedule list` | 查看并管理 Cron 任务 |
| `/schedule add` | 添加任务 |
| `/schedule import` | 批量导入任务 |
| `/schedule del` | 删除任务 |
| `/autoreset` | 切换 Guardian 配额重置自动唤醒 |

### 远程控制（Guardian）
| 命令 | 说明 |
|:---|:---|
| `/boot [agy]` | 远程启动 IDE 或 Antigravity 2.0（`/boot agy`） |
| `/shutdown` | 远程关闭 IDE |
| `/recent` | 打开最近项目 |
| `/new_project` | 交互式新建项目 |
| `/cmd <命令>` | 执行 Shell 命令（需解锁） |
| `/file_get <路径>` | 取回文件（需解锁） |
| `/unlock` | 🔐 解锁敏感操作 |
| `/lock` | 🔐 手动锁定 |
| `/setpwd <密码>` | 🔐 远程设置/修改密码 |

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+Alt+Shift+U` | 切换自动接受（开/关） |

---

## 📄 致谢

- **核心灵感**：[lbjlaq](https://github.com/lbjlaq) 的 [Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)
- **代理驱动**：[yuaotian](https://github.com/yuaotian) 的 [antigravity-proxy](https://github.com/yuaotian/antigravity-proxy)
- **CDP 灵感**：[Munkhin](https://github.com/Munkhin) 的 [auto-accept-agent](https://github.com/Munkhin/auto-accept-agent)
- **UI 参考**：[jlcodes99](https://github.com/jlcodes99) 的 [vscode-antigravity-cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit)

---

## 📜 许可证

MIT License。仅供学习和效率提升使用，请遵守平台使用条款。

**作者**：[Felix2CN](https://github.com/Felix2G) | **更新日志**：[CHANGELOG.md](CHANGELOG.md)
