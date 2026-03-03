# Anti Tools

![Views](https://komarev.com/ghpvc/?username=Felix2CN&label=Views&color=blue&style=flat)

**Antigravity 账号一站式管理、排程唤醒与全自动执行增强扩展**

Anti Tools 是一个为 Antigravity AI 开发环境量身定制的 VS Code 扩展。它融合了账号切换、实时配额监控、智能排程唤醒、以及基于 CDP 的高性能自动化能力，并集成了 Telegram Bot 远程控制功能，旨在为您提供零摩擦的 AI 协作体验。

---

## 🌟 核心功能

### 📱 Telegram Bot 远程控制
通过 TG Bot 随时随地监控和管理您的 Antigravity 环境：
- **实时监控**：接收 IDE 启动、任务执行状态通知
- **远程操作**：在 TG 上直接发送消息给 Agent、切换模型、切换账号
- **配额查询**：一键查看所有账号的配额剩余情况及重置时间
- **屏幕截图**：远程获取 IDE 界面截图，掌握运行状态
- **远程启动 IDE**：即使 IDE 已关闭，通过 `/boot` 命令远程唤醒

### 🛡️ Guardian 独立守护进程 (v1.10.58+)
**即使 IDE 完全关闭，也能通过 Telegram 远程控制：**
- **原生开机自启** (v1.10.100+)：通过 Windows 启动文件夹与 VBS 实现开机自启，无需管理员权限。
- **静默后台运行**：利用 VBS 脚本技术实现无窗口静默运行，不干扰日常工作。
- **崩溃自动恢复**：内置看门狗逻辑，确保 24/7 不间断服务，崩溃秒级恢复。
- **独立配额刷新**：守护进程拥有独立 API 通讯能力，无需 IDE 参与即可全天候更新账号配额。
- **全平台代理继承**：自动识别 Windows 注册表与 macOS `scutil` 系统代理，无感穿透网络限制。
- **环境自动清理**：扩展激活时自动清理旧版本进程、锁文件，避免冲突并支持日志轮转。
- **远程全能控制**：支持 `/boot` 唤醒 IDE、`/screenshot` 跨平台截图、`/cmd` 执行指令及 `/file_get` 取回文件。

### 🔐 智能账号与排程管理
- **极速切换**：秒级同步登录态，支持多账号平滑流转，自动处理确认对话框。
- **排程可视化**：独创"后台刷新排程"，根据模型重置时间、预期使用时长、活跃时间窗口，自动生成**配额恢复时间轴**。
- **自动唤醒 (Wake-up)**：在预测刷新点自动发送极小量请求，提前触发配额重置计时（目标模型支持模糊匹配配置）。
- **风控防护**：内置设备指纹（Device Profile）管理，支持绑定与随机化切换。

### 🤖 高性能全自动执行 (Auto Accept)
- **CDP 模式**：通过 Chrome DevTools Protocol 注入脚本，深度穿透 **Shadow DOM** 与 **Iframe (Agent 聊天窗)**。
- **智能交互**：
  - 自动打开 Agent Chat（如果未开启）
  - 自动获取和切换模型
  - 毫秒级自动点击 "Accept changes"、"Retry" 等按钮
- **安全哨兵**：内置危险指令黑名单过滤器，防止高危操作。

### 🛡️ 透明代理加速 (Windows)
- **无感接入**：利用 `version.dll` 注入技术，仅对 Antigravity 核心流量进行定向代理。
- **零 VPN 依赖**：直接在插件内配置 SOCKS5/HTTP 协议，规避全局网络波动。

### 💬 AI Chat 智能对话 (v1.11.0+)
内置 AI 聊天面板，支持多种第三方大模型 API：
- **12 个预设模板**：OpenAI / Claude / Gemini / Deepseek / 通义千问 / 智谱 / Kimi / 硅基流动 / 豆包 / Ollama 等
- **统一模型选择器**：按供应商分组显示所有已配置的模型，一键切换
- **流式输出**：实时 SSE 流式响应，支持中断生成
- **代码上下文**：一键发送当前文件或选中代码，代码块一键复制/插入编辑器
- **历史会话**：自动保存对话历史，支持切换和继续历史对话
- **安全存储**：API Key 使用 VS Code SecretStorage 加密存储

---

## 📋 依赖与系统要求

### 运行环境
| 项目 | 要求 |
|:---|:---|
| **操作系统** | Windows 10/11 (完整功能支持) |
| **IDE** | Antigravity (基于 VS Code 的 AI IDE) |
| **Node.js** | 不需要 ✅ (插件自包含所有依赖) |

### 外部依赖
**本插件无需任何外部依赖**。所有功能（包括数据库操作）均使用纯 JavaScript 实现，无需安装 SQLite、Python 或其他工具。

---

## 🔒 系统操作声明

本插件会对您的系统进行以下操作，请知悉：

### 📁 文件操作

| 操作 | 路径 | 说明 |
|:---|:---|:---|
| **读写配置** | `~/.antigravity_tools/` | 存储账号数据、设备指纹、排程状态等 |
| **读写数据库** | `%APPDATA%/Antigravity/User/globalStorage/state.vscdb` | 切换账号时修改登录状态（会自动备份为 .backup） |
| **临时文件** | 系统临时目录 | 操作完成后自动清理 |

### 🔌 透明代理 (仅 Windows)

| 操作 | 说明 |
|:---|:---|
| **复制 DLL** | 将 `version.dll` 复制到 Antigravity 安装目录 |
| **写入配置** | 在 Antigravity 目录创建 `proxy_config.txt` |
| **效果** | 仅代理 Antigravity 的网络请求，不影响系统其他程序 |

### 🤖 CDP 自动化

| 操作 | 说明 |
|:---|:---|
| **启动参数** | 需要 IDE 添加 `--remote-debugging-port=9000` 参数 |
| **网络连接** | 通过 localhost:9000 与 IDE 通信 |
| **权限** | 无系统级权限，仅操作 IDE 界面 |

---

## 📦 快速开始

### 安装

[![Open VSX Version](https://img.shields.io/open-vsx/v/Felix2CN/anti-tools?label=Open%20VSX&color=blueviolet)](https://open-vsx.org/extension/Felix2CN/anti-tools)
[![GitHub Release](https://img.shields.io/github/v/release/Felix2G/Anti-tools?label=GitHub%20Release&color=blue)](https://github.com/Felix2G/anti-tools/releases)

- **🏪 Open VSX 商店 (推荐)**：[open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)  
  在 IDE 扩展市场搜索 `Anti Tools` 或 `Felix2CN` 即可安装。
- **📦 手动安装**：从 [Releases](https://github.com/Felix2G/anti-tools/releases) 下载最新 `.vsix` 文件，  
  然后 `Ctrl+Shift+P` → `Extensions: Install from VSIX...` → 选择文件安装。

### Telegram Bot 配置
1. 在 Telegram 主要找 `@BotFather` 创建一个新的 Bot，获取 Token。
2. 在插件设置中填写 `Telegram: Bot Token`。
3. 获取您的 Telegram User ID（可找 `@userinfobot` 获取），填入 `Telegram: Allowed User Ids`。
4. 重启 IDE 或重载窗口，Bot 将自动连接并发送启动通知。

---

## 🤖 Telegram Bot 指令

### 基础操作

| 指令 | 说明 |
|:---|:---|
| `/start` | 显示主菜单（快捷按钮面板） |
| `/status` | 查看当前 IDE 状态、账号、模型、配额 |
| `/help` | 显示完整帮助信息 |

### Agent 交互

| 指令 | 说明 |
|:---|:---|
| `/send <msg>` | 发送消息给 Agent（支持 `--model` 参数指定模型） |
| `/stop` | 停止当前生成 |
| `/latest` | 获取最近一条回复（别名 `/reply`，支持 `export` 参数） |
| `/models` | 列出当前可用的模型列表 |
| `/select <name>` | 切换到指定模型 |
| `/cdp <文字>` | 查找并点击 IDE 中包含指定文字的元素（穿透 Shadow DOM） |

### 账号与配额

| 指令 | 说明 |
|:---|:---|
| `/quotas` | 显示所有账号配额汇总 + 一键切换按钮 |
| `/switch <id>` | 切换到指定账号（支持序号/邮箱匹配，自动处理确认） |
| `/screenshot` | 获取当前界面截图 |

### 定时任务

| 指令 | 说明 |
|:---|:---|
| `/schedule list` | 查看定时任务列表（含执行历史、一键操作按钮） |
| `/schedule add` | 添加定时任务 |
| `/schedule import` | 批量导入定时任务 |
| `/schedule del` | 删除定时任务 |

### 远程控制 (Guardian)

| 指令 | 说明 |
|:---|:---|
| `/boot` | 远程启动 IDE |
| `/shutdown` | 远程关闭 IDE |
| `/recent` | 打开最近项目 |
| `/new_project` | 交互式新建项目并启动 IDE |
| `/cmd <cmd>` | 远程执行终端指令（30s 超时保护） |
| `/file_get <path>` | 远程取回服务器文件 |

### 🛡️ 独立守护进程 (Guardian)
开启设置 `Telegram > Enable Guardian` 后，插件将自动注册开机自启。
- **实现原理**：向 Windows `Startup` 目录添加 VBS 引导脚本。
- **IDE 关闭时**：Guardian Bot 在线，响应 `/status`、`/boot` 以及执行定时任务。
- **IDE 开启时**：Guardian 进入静默模式，插件主 Bot 接管所有功能。

---

## 🚀 配置指南

在 VS Code 设置中搜索 `anti-tools` 进行调优：

### 配额监控设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `quotaThreshold` | `10` | 配额低于此百分比时提示切换账号 |
| `autoCheckInterval` | `60` | 自动检查配额的间隔时间（秒） |
| `monitoredModels` | `["gemini", "claude", "gpt"]` | 需要监控配额的模型关键字列表（支持模糊匹配） |

### 排程系统设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `quota.autoSchedule` | `fixed` | 排程模式：`none`=关闭，`fixed`=固定间隔（默认），`smart`=智能排程 |
| `quota.useDuration` | `120` | 每个账号预估工作时长（分钟） |
| `quota.activeStart` | `8` | 每日开始使用的时间点（小时，0-23） |
| `quota.activeEnd` | `23` | 每日结束使用的时间点（小时，0-23） |

### 自动唤醒设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `wakeup.enabled` | `true` | **开启排程自动唤醒** |
| `wakeup.prompt` | `"hi"` | 自动唤醒时发送的触发对话文本 |
| `wakeup.models` | `["claude"]` | 需要预热的模型列表（支持模糊匹配，留空则使用监控模型列表） |

### CDP 自动化设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `autoAccept.enabled` | `false` | 开启自动接受/重试 |
| `autoAccept.interval` | `200` | 自动化点击的扫描频率（毫秒） |

### AI Chat 设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `aiChat.enabled` | `false` | 启用 AI Chat 面板（开启后在侧边栏显示） |
| `aiChat.systemPrompt` | `"You are a helpful..."` | AI 对话的系统提示词 |

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+Alt+Shift+U` | 开启/关闭自动接受 |

---

## 📄 鸣谢与声明

本项目通过深度剖析 Electron 运行机制与 CDP 通讯协议，整合了多项开源社区的高性能实现，在此深表感谢：

- **核心灵感**：[Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) (by [lbjlaq](https://github.com/lbjlaq))
- **代理驱动**：[antigravity-proxy](https://github.com/yuaotian/antigravity-proxy) (by [yuaotian](https://github.com/yuaotian))
- **CDP 灵感**：[auto-accept-agent](https://github.com/Munkhin/auto-accept-agent) (by [Munkhin](https://github.com/Munkhin))
- **UI 参考**：[vscode-antigravity-cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit) (by [jlcodes99](https://github.com/jlcodes99))

---

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。

程序仅供学习与提升工作效率使用，请自觉遵守相关平台的使用条款，开发者不承担任何因不当使用导致的账号风险。

---

## 💬 意见反馈

如果您在使用过程中遇到问题或有任何建议，欢迎通过以下渠道反馈：

- **GitHub Issues**：[提交反馈](https://github.com/Felix2G/anti-tools/issues)

---

**Author**: [Felix2CN](https://github.com/Felix2G)  

---

## 📋 更新日志

完整版本更新记录请查看 [CHANGELOG.md](CHANGELOG.md)。
