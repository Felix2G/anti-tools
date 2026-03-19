# Anti Tools

![Views](https://komarev.com/ghpvc/?username=Felix2CN&label=Views&color=blue&style=flat)

**Antigravity 账号管理、自动化增强与远程控制扩展**

Anti Tools 是一个为 Antigravity AI IDE 开发的 VS Code 扩展，提供多账号切换、配额监控、排程唤醒、CDP 自动化、AI Chat、Telegram Bot 远程控制与 Guardian 守护进程等功能。

---

## 🌟 核心功能

### 🔐 智能账号与排程管理
直接在 IDE 内完成账号切换，无需退出登录、无需浏览器操作：
- **IDE 内直接切换**：通过数据库注入实现秒级账号切换，自动处理确认对话框，切换后自动重启生效。双保险架构 — 退出前直接注入 Token + 启动后二次注入兜底，确保切换可靠。
- **配额实时监控**：侧边栏配额概览面板，低额度自动预警，状态栏 Tooltip 显示账号与配额详情。
- **排程可视化**：根据模型重置时间、预期使用时长、活跃时间窗口，自动生成配额恢复时间轴。
- **自动唤醒 (Wake-up)**：在预测的配额刷新点自动发送请求触发重置计时，目标模型支持模糊匹配。
- **设备指纹管理**：内置 Device Profile 管理，支持绑定与随机化切换。

### 📱 Telegram Bot 远程控制
通过 TG Bot 随时随地管理 Antigravity 环境：
- **Agent 交互**：直接在 TG 发送消息给 Agent、查看回复、停止生成
- **工具活动展示**：Agent 回复中实时显示执行的工具操作（命令执行、文件编辑/创建/删除、代码分析），含增删行数等详情
- **模型管理**：列出可用模型、一键切换、配额百分比与色彩指示
- **账号管理**：配额汇总 + 一键切换按钮、远程切换账号
- **远程监控**：接收 IDE 启动通知、获取界面截图、查看运行状态
- **远程启动**：即使 IDE 已关闭，通过 Guardian 执行 `/boot` 远程唤醒
- **定时任务**：添加/导入/管理 Cron 定时任务，支持多模型并发唤醒
- **远程终端**：`/cmd` 执行指令、`/file_get` 取回文件（需解锁）

### 🤖 高性能全自动执行 (Auto Accept)
基于 Chrome DevTools Protocol 的自动化操作：
- **CDP 深度注入**：穿透 Shadow DOM 与 Iframe（Agent 聊天窗），毫秒级自动点击 "Accept changes"、"Retry" 等按钮
- **自动开启 Agent Chat**：检测未开启时自动打开
- **模型自动获取与切换**：通过 CDP 实时读取和切换模型
- **安全哨兵**：内置危险指令黑名单过滤器，防止高危操作自动执行
- **CDP 自动启用**：通过 `argv.json` 自动写入调试端口，首次安装后重启即永久生效，支持 Windows 快捷方式双方案

### 💬 AI Chat 智能对话
内置侧边栏 AI 聊天面板，支持多种第三方大模型 API：
- **12 个预设模板**：OpenAI / Claude / Gemini / Deepseek / 通义千问 / 智谱 / Kimi / MiniMax / 硅基流动 / 豆包 / Ollama 等
- **统一模型选择器**：按供应商分组显示，支持模糊搜索，一键切换
- **流式输出**：实时 SSE 流式响应，支持中断生成，自动跳过思考内容
- **代码上下文**：一键发送当前文件或选中代码，代码块一键复制/插入编辑器
- **多模态消息**：支持图片上传（文件选择/粘贴/拖拽），OpenAI Vision 格式传送
- **历史会话**：自动保存对话历史，支持切换和继续历史对话
- **Token 用量统计**：工具栏实时显示当前会话的输入/输出/总 Token 消耗
- **动态模型获取**：自动从 API 拉取最新模型列表
- **配置导入导出**：一键导出/导入 Provider 配置，API Key 可 AES-256 加密保护
- **安全存储**：API Key 使用 VS Code SecretStorage 加密存储

### ☁️ 云同步与 Token 管理
跨设备同步配置：
- **云盘文件夹同步**：保存到 OneDrive / Google Drive / Dropbox 本地同步目录，云盘自动同步
- **GitHub Gist 同步**：保存到 GitHub Private Gist，支持自动创建/更新
- **AES-256 加密**：所有同步数据加密传输
- **Token 统一管理**：GitHub / OpenVSX 等服务 Token 使用 SecretStorage 加密存储，支持自定义 Token
- **环境变量导入/导出**：批量导入系统环境变量，或导出到用户级环境变量

### 🛡️ 透明代理加速 (Windows)
- **无感接入**：利用 `version.dll` 注入技术，仅对 Antigravity 核心流量定向代理
- **零 VPN 依赖**：直接在插件内配置 SOCKS5/HTTP 协议

### 🔐 统一安全密码
一套密码保护所有敏感操作，IDE 和 Guardian 共享：
- **IDE 端**：命令面板设置密码，复制 API Key 时需验证（会话内缓存）
- **Guardian 端**：`/unlock` 解锁、`/lock` 锁定、`/setpwd` 远程设密码
- **滑动续期**：每次操作自动续期，停止操作超时后才过期
- **防暴力破解**：连续 3 次错误锁定 5 分钟
- **向后兼容**：未设密码时所有操作正常放行

### 🛡️ Guardian 独立守护进程
即使 IDE 完全关闭，也能通过 Telegram 远程控制：
- **原生开机自启**：通过 Windows 启动文件夹与 VBS 实现开机自启，无需管理员权限
- **静默后台运行**：VBS 脚本技术实现无窗口静默运行
- **崩溃自动恢复**：内置看门狗逻辑，崩溃秒级恢复
- **IDE 心跳监控**：监控 IDE 心跳文件，超过 2 分钟无心跳判定假死，自动关闭 IDE 并接管 Bot
- **独立配额刷新**：无需 IDE 参与即可全天候更新账号配额，支持配额重置自动唤醒
- **全平台代理继承**：自动识别 Windows 注册表与 macOS `scutil` 系统代理
- **环境自动清理**：激活时自动清理旧版本进程、锁文件，日志轮转
- **远程全能控制**：`/boot` 唤醒 IDE、`/screenshot` 截图、`/cmd` 执行指令、`/file_get` 取回文件

### 🖥️ 多开实例管理 ✨ *2026-03-19 新增*
在同一台机器上同时运行多个独立的 Antigravity IDE 实例，每个实例使用独立账号、独立工作区、独立 CDP 端口：
- **实例管理面板**：在操作视图中创建、启动、停止、删除子实例
- **独立 CDP 端口**：每个子实例自动分配不冲突的 CDP 调试端口（9001、9002 ...）
- **独立账号绑定**：每个实例绑定独立账号，CDP 自动点击与配额监控均按实例隔离
- **TG Bot 实例切换**：通过 `/use` 命令一键切换当前操控的实例，`/instances` 查看所有实例状态
- **Guardian 多实例调度**：Guardian 守护进程支持多实例各自的心跳检测与任务调度
- **首次启动自动 CDP**：子实例首次启动即自动开启 CDP 自动点击，无需手动设置



---

## 📋 依赖与系统要求

### 运行环境
| 项目 | 要求 |
|:---|:---|
| **操作系统** | Windows 10/11（完整功能支持）、macOS（部分功能支持） |
| **IDE** | Antigravity（基于 VS Code 的 AI IDE） |
| **外部依赖** | 无 ✅（插件自包含所有依赖，无需安装 SQLite、Python 等） |

---

## 🔒 系统操作声明

本插件会对您的系统进行以下操作，请知悉：

### 📁 文件操作

| 操作 | 路径 | 说明 |
|:---|:---|:---|
| **读写配置** | `~/.antigravity_tools/` | 存储账号数据、设备指纹、排程状态等 |
| **Guardian 部署** | `~/.antigravity_tools/guardian/` | 守护进程固定部署目录 |
| **读写数据库** | `%APPDATA%/Antigravity/User/globalStorage/state.vscdb` | 切换账号时修改登录状态（自动备份为 .backup） |
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
| **启动参数** | 自动写入 `argv.json` 或修改快捷方式，添加 `--remote-debugging-port=9000` |
| **网络连接** | 通过 localhost:9000 与 IDE 通信 |
| **权限** | 无系统级权限，仅操作 IDE 界面 |

---

## 📦 快速开始

### 安装

[![Open VSX Version](https://img.shields.io/open-vsx/v/Felix2CN/anti-tools?label=Open%20VSX&color=blueviolet)](https://open-vsx.org/extension/Felix2CN/anti-tools)
[![GitHub Release](https://img.shields.io/github/v/release/Felix2G/Anti-tools?label=GitHub%20Release&color=blue)](https://github.com/Felix2G/anti-tools/releases)

- **🏪 Open VSX 商店（推荐）**：[open-vsx.org/extension/Felix2CN/anti-tools](https://open-vsx.org/extension/Felix2CN/anti-tools)  
  在 IDE 扩展市场搜索 `Anti Tools` 或 `Felix2CN` 即可安装。
- **📦 手动安装**：从 [Releases](https://github.com/Felix2G/anti-tools/releases) 下载最新 `.vsix` 文件，  
  然后 `Ctrl+Shift+P` → `Extensions: Install from VSIX...` → 选择文件安装。

### Telegram Bot 配置
1. 在 Telegram 找 `@BotFather` 创建一个新的 Bot，获取 Token。
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
| `/models` | 列出当前可用的模型列表（含配额百分比与色彩指示） |
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
| `/autoreset` | 切换 Guardian 配额重置自动唤醒开关 |

### 远程控制 (Guardian)

| 指令 | 说明 |
|:---|:---|
| `/boot` | 远程启动 IDE |
| `/shutdown` | 远程关闭 IDE |
| `/recent` | 打开最近项目 |
| `/new_project` | 交互式新建项目并启动 IDE |
| `/cmd <cmd>` | 远程执行终端指令（30s 超时，需解锁） |
| `/file_get <path>` | 远程取回服务器文件（需解锁） |
| `/unlock` | 🔐 解锁敏感操作 |
| `/lock` | 🔐 手动锁定终端 |
| `/setpwd <pwd>` | 🔐 远程设置/修改安全密码 |

### 🛡️ 守护进程 (Guardian)
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
| `quota.autoSchedule` | `fixed` | 排程模式：`none`=关闭，`fixed`=固定间隔，`smart`=智能排程 |
| `quota.useDuration` | `120` | 每个账号预估工作时长（分钟） |
| `quota.activeStart` | `8` | 每日开始使用的时间点（小时，0-23） |
| `quota.activeEnd` | `23` | 每日结束使用的时间点（小时，0-23） |

### 自动唤醒设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `wakeup.enabled` | `true` | 开启排程自动唤醒（IDE 端，IDE 关闭则停止） |
| `wakeup.prompt` | `"hi"` | 自动唤醒时发送的触发对话文本 |
| `wakeup.models` | `["claude"]` | 需要预热的模型列表（支持模糊匹配） |
| `guardian.autoResetTrigger` | `false` | Guardian 配额重置自动唤醒（后台，任务成功后按 reset_time 自动再次触发） |

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

### 云同步设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `sync.cloudFolder` | 空 | 云盘本地同步目录路径（OneDrive / Google Drive 等） |
| `sync.gistId` | 空 | GitHub Gist ID（首次同步自动创建） |

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+Alt+Shift+U` | 开启/关闭自动接受 |

---

## 📄 鸣谢与声明

本项目整合了多项开源社区的实现，在此深表感谢：

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
