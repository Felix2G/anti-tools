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
- **自动唤醒 (Wake-up)**：针对重要模型（如 Gemini-3-Flash/Pro）在预测刷新点自动发送极小量请求，提前触发配额重置计时。
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

### 安装 (Recommended)
1. 从 [Releases](https://github.com/Felix2CN/Anti-tools/releases) 下载最新的 `.vsix` 文件。
2. 在 VS Code 中按 `Ctrl+Shift+P` -> `Extensions: Install from VSIX...` -> 选择文件安装。

### Telegram Bot 配置
1. 在 Telegram 主要找 `@BotFather` 创建一个新的 Bot，获取 Token。
2. 在插件设置中填写 `Telegram: Bot Token`。
3. 获取您的 Telegram User ID（可找 `@userinfobot` 获取），填入 `Telegram: Allowed User Ids`。
4. 重启 IDE 或重载窗口，Bot 将自动连接并发送启动通知。

---

## 🤖 Telegram Bot 指令

| 指令 | 说明 |
|:---|:---|
| `/start` | 显示主菜单 |
| `/status` | 查看当前 IDE 状态、账号、模型、配额 |
| `/models` | 列出当前可用的模型列表 |
| `/select <name>` | 切换到指定模型 |
| `/send <msg>` | 发送消息给 Agent（支持 `--model` 参数） |
| `/stop` | 停止当前生成 |
| `/latest` | 获取最近一条回复 (支持 `export` 参数) |

| `/accounts` | 列出所有账号及状态 |
| `/switch <id>` | 切换到指定账号（自动处理确认） |
| `/quotas` | 显示所有账号配额汇总 + 切换按钮 |
| `/screenshot` | 获取当前 IDE 界面截图 |
| `/schedule list` | 查看定时任务列表 |
| `/schedule add` | 添加定时任务 |
| `/schedule import` | 批量导入定时任务 |
| `/schedule del` | 删除定时任务 |
| `/boot` | (Guardian专属) 远程启动 IDE |
| `/cmd <cmd>` | (Guardian专属) 远程执行终端指令 |
| `/file_get <path>` | (Guardian专属) 远程取回服务器文件 |

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
| `monitoredModels` | `["claude-sonnet-4-5", "gemini-3-flash", "gemini-3-pro-high"]` | 需要监控配额的模型列表 |

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
| `wakeup.models` | `[]` | 需要预热的模型列表（留空则使用监控模型列表） |

### CDP 自动化设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `autoAccept.enabled` | `false` | 开启自动接受/重试 |
| `autoAccept.interval` | `200` | 自动化点击的扫描频率（毫秒） |

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

**Author**: [F4CN2US](https://github.com/Felix2CN)  
**Latest Version**: `1.10.119`

---

## 📋 更新日志

### v1.10.116 (2026-02-05) � 跨平台增强与 Guardian 独立刷新
- **🔋 Guardian 完全独立刷新**：守护进程现具备独立 API 调度能力，无需 IDE 即可维持配额数据新鲜度。
- **🌐 系统级代理自动穿透**：重构代理探测引擎，原生支持 Windows 注册表与 macOS `scutil` 代理继承。
- **📜 日志轮转机制**：引入文件大小监控与自动备份（轮转）逻辑，彻底解决 EPIPE 潜在隐患。
- **🌍 极致跨平台支持**：集成全平台原生截图引擎，全面解耦绝对路径，支持 OneDrive 跨机同步。
- **🔧 稳定性修复**：修复 Telegram 消息特殊字符导致的 Markdown 解析错误。

### v1.10.113 (2026-02-05) 📸 远程控制与安全增强
- **远程操作扩展**：Guardian 现原生支持 `/screenshot` 截图、`/cmd` 终端执行、`/file_get` 文件取回。
- **输出智能截断**：针对 `/cmd` 大文本输出，实现 Telegram 消息上限兼容（3500字截断，保留尾部信息）。
- **交互菜单补全**：`/start` 菜单新增控制图标，整合所有 Guardian 远程运维功能。
- **安全加固**：`/cmd` 指令集成 30s 超时监控，防止进程挂起。

### v1.10.110 (2026-02-04) 🚀 定时任务 API 模式重构
- **核心逻辑解耦**：定时任务执行彻底改为后台 API 模式，不再依赖 IDE UI 交互
- **0 重启体验**：IDE 运行期间执行定时任务不再涉及账号切换，彻底消除重启闪烁
- **手动触发功能**：在 `/schedule list` 中为每个任务增加 **🚀立即执行** 按钮，支持手动预览发送结果
- **切换自检**：优化账号切换逻辑，增加当前账号检测，避免重复执行无意义的切换与重启
- **双端冲突修复**：守护进程在 IDE 运行时自动进入静默模式，防止与 IDE 同时触发定时任务

### v1.10.80 (2026-02-02) 🔧 稳定性优化
- **定时任务修复**：修复"启用全部"功能的执行逻辑
- **用户体验改进**：优化反馈消息，使操作结果更加清晰
- **代码清理**：移除临时测试脚本，整理项目文档结构

### v1.10.77 (2026-02-02) 🎊 全自动服务管理
- **一键重装服务**：检测到版本不匹配时，自动弹出对话框，支持一键重装（自动提升管理员权限）
- **版本自动检测**：扩展激活时自动检测 Windows Service 指向的版本，创建标记文件
- **用户体验提升**：从 6 次手动操作降至 2 次点击，错误率从 30% 降至 0%

### v1.10.76 (2026-02-02) 🚀 Guardian 完全独立化
- **独立服务模块**：创建 guardianStorage/guardianDb/guardianQuota 三个独立模块，完全解耦 vscode 依赖
- **守护模式就绪**：Guardian 现可作为真正的独立进程运行，支持崩溃自动恢复
- **24/7 不间断服务**：内部看门狗逻辑，自动重启功能完整实现

### v1.10.75 (2026-02-02) 🔧 环境清理与 EPIPE 修复
- **自动环境清理**：新增 EnvironmentCleaner 模块，自动清理旧进程、服务、锁文件、注册表残留
- **EPIPE 错误修复**：使用 `stdio: 'ignore'` 完全隔离标准流，从源头消除管道破裂风险
- **日志鲁棒性增强**：log 函数添加 try-catch 保护，全局错误处理器改进

### v1.10.58 (2026-01-29) 🎉 Guardian 里程碑

- **🛡️ Guardian 独立守护进程**
  - **终极修复**: 经过数天开发调试，Guardian 功能终于完全可用
  - **远程唤醒**: 即使 IDE 完全关闭，通过 TG `/boot` 命令可远程启动 IDE
  - **交互模式**: 采用 `schtasks /IT` 方案，确保 GUI 窗口在用户桌面正常弹出
  - **开机自启**: 通过 Windows 注册表实现可靠的静默开机启动
  - **CDP 支持**: 启动时自动传递 `--remote-debugging-port=9000` 参数

### v1.10.34 (2026-01-27)

- **🚀 交互与稳定性增强**
  - **账号切换体验升级**: 引入 QuickPick 倒计时确认机制，Bot 操作实现全自动零干预
  - **回复捕获终极修复**: 针对编译等长耗时任务，引入智能盲等策略（30s），彻底解决截断问题
  - **功能精简**: 移除低频的 `/recent` 功能，轻量化菜单

### v1.10.8 (2026-01-25)

- **🤖 Telegram Bot 远程控制**
  - **全功能集成**：支持通过 TG Bot 监控状态、切换模型、发送消息、管理排程
  - **智能自动化**：切换账号时自动处理确认对话框，自动唤醒/切换模型
  - **增强交互**：检测到 Agent Chat 关闭时自动唤醒，支持截图预览
- **✨ 账号管理增强**
  - **配额可视化**：新增 `/quotas` 命令，直观展示所有账号配额状态及重置时间
  - **智能切换**：切换账号前自动校验，避免重复切换，支持自动处理 IDE 重启提示
- **🔧 核心优化**
  - **CDP 深度集成**：支持直接读取隐藏的模型列表，支持 iframe 穿透
  - **性能提升**：优化 DOM 查询逻辑，减少不必要的资源消耗

### v1.10.0 (2026-01-24)

- **🔧 架构重构：移除外部 SQLite 依赖**
  - 使用 `sql.js` (纯 JavaScript SQLite 实现) 替代外部 `sqlite3.exe`
  - 插件现在**零外部依赖**，换电脑无需任何配置即可使用
  - 插件体积从 2.13 MB 减少到约 1.0 MB

### v1.8.94 (2026-01-23)

- **🌐 网络通信层彻底修复**：针对国内用户常用的 V2rayN/Clash 等代理环境进行了深度优化。
- **🔥 唤醒逻辑深度优化**：支持多端点回退，增加指数退避重试。
