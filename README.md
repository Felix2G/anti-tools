# Anti Tools

![Views](https://komarev.com/ghpvc/?username=Felix2CN&label=Views&color=blue&style=flat)

**Antigravity Account Management, Automation & Remote Control Extension**

Anti Tools is a VS Code extension developed for Antigravity AI IDE, providing multi-account switching, quota monitoring, scheduled wake-up, CDP automation, AI Chat, multi-channel Bot remote control (Telegram / QQ / WeCom / Feishu), Guardian daemon, and full **multi-language support** (English / Chinese).

- 🏪 **OpenVSX**: [open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)
- 📦 **Manual**: Download latest `.vsix` from [Releases](https://github.com/Felix2G/anti-tools/releases) → `Extensions: Install from VSIX...`

---

## 🌟 Core Features

### 🔐 Intelligent Account & Schedule Management
- **Direct Switching in IDE**: Instant account switching via database injection with dual-insurance architecture (pre-exit injection + post-startup fallback).
- **Real-time Quota Monitoring**: Sidebar quota panel, low-quota warnings, status bar tooltips.
- **Schedule Visualization**: Automatic quota recovery timelines based on reset times and active windows.
- **Auto Wake-up**: Automated requests at predicted refresh points; fuzzy model matching.
- **Device Fingerprint Management**: Built-in Device Profile binding and randomization.

### 📱 Bot Center — Multi-channel Remote Control ✨ *2026-03-23*
- **Telegram Bot**: Full-featured remote control — Agent interaction, tool activity display, model management, IDE notifications, session export, scheduled tasks, and remote terminal.
- **QQ Bot**: Native QQ Bot API v2 (C2C / Group / Channel), supports text commands `/start` `/status` `/stop`.
- **WeCom / Feishu**: Channel-based integration with shared command menu support.
- **Unified Command Menu** (QQ / WeCom / Feishu):
  - `/start` / `/help` / `帮助` — Show available commands
  - `/status` / `状态` — View Guardian / IDE / Agent real-time status
  - `/stop` / `停止` — Stop ongoing Agent generation
- **Auto-restart Guardian**: Enabling / disabling / clearing a channel config automatically restarts Guardian — no manual action required.

### 🤖 High-performance Auto-Accept (CDP)
- **Deep CDP Injection**: Penetrates Shadow DOM and Iframes for millisecond-level automated clicking.
- **Auto-Open Agent Chat**: Automatically opens Agent Chat if detected as closed.
- **Auto-Model Detection**: Real-time model reading and switching via CDP.
- **Security Guard**: Built-in dangerous command blacklist to prevent high-risk automation.
- **Token Usage Stats**: Status bar real-time `🧠 Token 👣 Files 💾 Storage`, refreshing every 10s.

### 💬 AI Chat Assistant
- **12 Preset Templates**: OpenAI, Claude, Gemini, Deepseek, Kimi, Ollama, etc.
- **Code Context**: One-click submission of current file/selection; copy/insert code blocks.
- **Multimodal Support**: Image upload via selection/paste/drag-and-drop (OpenAI Vision format).

### ☁️ Cloud Sync & Token Management
- **Cloud Folder Sync**: OneDrive / Google Drive / Dropbox local sync folder.
- **GitHub Gist Sync**: Private Gist with auto-create and update.
- **AES-256 Encryption**: All synced data encrypted; API keys stored via VS Code SecretStorage.
- **Bot Config Sync**: Telegram Bot token + multi-channel credentials (QQ / WeCom / Feishu) are included in the encrypted sync payload.

### 🛡️ Transparent Proxy (Windows)
- **Seamless Integration**: `version.dll` injection — only Antigravity core traffic is proxied.
- **Zero Dependencies**: Configure SOCKS5/HTTP directly in the extension.

### 🔐 Unified Security Password
- **IDE side**: Set via command palette; required for sensitive actions (API key copy, export).
- **Guardian side**: `/unlock`, `/lock`, `/setpwd` remote commands.

### 🛡️ Guardian Daemon
- **Native Autostart**: Windows Startup folder, silent background operation.
- **Heartbeat Monitoring**: Detects frozen IDE processes and takes over Bot control.
- **Proxy Inheritance**: Auto-detects system proxy (Registry / scutil).

### 🖥️ Multi-instance Management ✨ *2026-03-19*
- **Instance Isolation**: Each instance has its own account, workspace, and CDP port.
- **TG Remote Scheduling**: `/use` to switch active instance; `/instances` for global status.

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
| **OS** | Windows 10/11 (Full), macOS (Partial) |
| **IDE** | Antigravity AI IDE (VS Code-based) |
| **Dependencies** | None ✅ (Self-contained) |

---

## 🔒 System Operations Disclosure

| Action | Path | Description |
|:---|:---|:---|
| **Config** | `~/.antigravity_tools/` | Account data, fingerprints, etc. |
| **Guardian** | `~/.antigravity_tools/guardian/` | Daemon deployment path |
| **Database** | `%APPDATA%/Antigravity/User/globalStorage/state.vscdb` | Login state injection for account switching |
| **CDP** | `argv.json` / Shortcut | Adds `--remote-debugging-port=9000` |

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

### Account & Quota
| Command | Description |
|:---|:---|
| `/quotas` | All account quota summary + switch buttons |
| `/switch <id>` | Remote account switch |
| `/screenshot` | Capture IDE screenshot |

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
| `/boot` | Remote start IDE |
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

Anti Tools 是一个为 Antigravity AI IDE 开发的 VS Code 扩展，提供多账号切换、配额监控、排程唤醒、CDP 自动化、AI Chat、多渠道 Bot 远程控制（Telegram / QQ / 企微 / 飞书）、Guardian 守护进程，以及完整的**中英文双语界面**。

- 🏪 **Open VSX**: [open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)
- 📦 **手动安装**：从 [Releases](https://github.com/Felix2G/anti-tools/releases) 下载 `.vsix` → `Extensions: Install from VSIX...`

---

## 🌟 核心功能

### 🔐 智能账号与排程管理
- **IDE 内直接切换**：通过数据库注入实现极速账号切换，双重保险架构（退出前注入 + 启动后兜底）。
- **实时配额监控**：侧边栏配额面板、低配额警告、状态栏 Tooltip。
- **排程可视化**：根据重置时间和活跃窗口自动规划配额恢复时间线。
- **自动唤醒**：在预测刷新点自动发起请求；支持模糊模型匹配。
- **设备指纹管理**：内置 Device Profile 绑定与随机化。

### 📱 Bot 中心 — 多渠道远程控制 ✨ *2026-03-23*
- **Telegram Bot**：完整远程控制——Agent 交互、工具活动展示、模型管理、IDE 通知、会话导出、定时任务、远程终端。
- **QQ Bot**：原生 QQ Bot API v2（C2C / 群组 / 频道），支持文字命令菜单。
- **企业微信 / 飞书**：渠道接入，共享统一命令菜单。
- **统一命令菜单**（QQ / 企微 / 飞书）：
  - `/start` / `/help` / `帮助` — 显示可用命令列表
  - `/status` / `状态` — 实时查看 Guardian / IDE / Agent 状态及当前模型
  - `/stop` / `停止` — 停止正在进行的 Agent 生成
- **渠道配置后自动重启**：启用/禁用/清除渠道配置后自动触发 Guardian 重启，无需手动操作。

### 🤖 高性能自动接受（CDP）
- **深度 CDP 注入**：穿透 Shadow DOM 和 Iframe，毫秒级自动点击。
- **自动打开 Agent Chat**：检测到未打开时自动唤起。
- **自动模型检测**：通过 CDP 实时读取并切换当前模型。
- **安全守卫**：内置危险命令黑名单，防止高风险自动化。
- **Token 用量统计**：状态栏实时显示 `🧠 Token 👣 文件 💾 存储`，每 10 秒刷新。

### 💬 AI Chat 助手
- **12 种预设模板**：OpenAI、Claude、Gemini、Deepseek、Kimi、Ollama 等。
- **代码上下文**：一键提交当前文件/选中内容，复制/插入代码块。
- **多模态支持**：通过选择/粘贴/拖拽上传图片（OpenAI Vision 格式）。

### ☁️ 云同步与 Token 管理
- **云盘文件夹同步**：OneDrive / Google Drive / Dropbox 本地同步目录。
- **GitHub Gist 同步**：私有 Gist，自动创建与更新。
- **AES-256 加密**：所有同步数据加密；API Key 存储于 VS Code SecretStorage。
- **Bot 配置同步**：Telegram Bot Token 及多渠道凭据（QQ / 企微 / 飞书）一并纳入加密同步载荷。

### 🛡️ 透明代理（Windows）
- **无缝接入**：`version.dll` 注入，仅代理 Antigravity 核心流量。
- **零依赖**：直接在插件设置中配置 SOCKS5/HTTP。

### 🔐 统一安全密码
- **IDE 端**：通过命令面板设置；敏感操作（复制 API Key、导出文件）需验证。
- **Guardian 端**：`/unlock`、`/lock`、`/setpwd` 远程命令。

### 🛡️ Guardian 守护进程
- **原生自启动**：Windows 启动文件夹，静默后台运行。
- **心跳监控**：检测 IDE 假死并接管 Bot 控制权。
- **代理继承**：自动探测系统代理（注册表 / scutil）。

### 🖥️ 多实例管理 ✨ *2026-03-19*
- **实例隔离**：每个实例绑定独立账号、工作区和 CDP 端口。
- **TG 远程调度**：`/use` 切换操控目标；`/instances` 查看全局状态。

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
| **操作系统** | Windows 10/11（完整功能），macOS（部分功能） |
| **IDE** | Antigravity AI IDE（基于 VS Code） |
| **依赖** | 无 ✅（独立运行） |

---

## 🔒 系统操作说明

| 操作 | 路径 | 说明 |
|:---|:---|:---|
| **配置文件** | `~/.antigravity_tools/` | 账号数据、设备指纹等 |
| **Guardian** | `~/.antigravity_tools/guardian/` | 守护进程部署路径 |
| **数据库** | `%APPDATA%/Antigravity/User/globalStorage/state.vscdb` | 账号切换时的登录态注入 |
| **CDP** | `argv.json` / 快捷方式 | 写入 `--remote-debugging-port=9000` |

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

### 账号与配额
| 命令 | 说明 |
|:---|:---|
| `/quotas` | 所有账号配额汇总 + 切换按钮 |
| `/switch <id>` | 远程切换账号 |
| `/screenshot` | 截取 IDE 界面截图 |

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
| `/boot` | 远程启动 IDE |
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
