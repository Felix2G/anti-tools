# Anti Tools

**Antigravity 账号一站式管理、排程唤醒与全自动执行增强扩展**

Anti Tools 是一个为 Antigravity AI 开发环境量身定制的 VS Code 扩展。它融合了账号切换、实时配额监控、智能排程唤醒、以及基于 CDP 的高性能自动化能力，旨在为您提供零摩擦的 AI 协作体验。

---

## ✨ 核心柱石 (Core Pillars)

### 1. 🔐 智能账号与排程管理
- 🔄 **极速切换**：秒级同步登录态，支持多账号平滑流转。
- 📊 **排程可视化**：独创"后台刷新排程"，根据模型重置时间、预期使用时长、活跃时间窗口，自动生成**配额恢复时间轴**。
- 💡 **自动唤醒 (Wake-up)**：针对重要模型（如 Gemini-3-Flash/Pro）在预测刷新点自动发送极小量请求，提前触发配额重置计时，确保上班即满血。
- 🔑 **风控防护**：内置设备指纹（Device Profile）管理，支持绑定与随机化切换。

### 2. 🤖 高性能全自动执行 (Auto Accept)
- 🧲 **CDP 模式**：通过 Chrome DevTools Protocol 注入脚本，深度穿透 **Shadow DOM** 与 **Iframe (Agent 聊天窗)**，实现**毫秒级**自动点击"Accept changes"、"Retry"、"Accept All"等 UI 按钮。
- 🛡️ **安全哨兵**：内置危险指令黑名单过滤器，若终端内容包含一些高危文本，将自动暂停点击行为。
- 🚀 **一键闭环重启**：自动修复启动快捷方式参数，点击开启即自动完成参数注入、IDE 重启并恢复会话。

### 3. 🛡️ 透明代理加速 (Windows)
- ⚙️ **无感接入**：利用 `version.dll` 注入技术，仅对 Antigravity 核心流量进行定向代理。
- 🔧 **零 VPN 依赖**：直接在插件内配置 SOCKS5/HTTP 协议，规避全局网络波动。

---

## 📦 快速开始

### 安装 (Recommended)
1. 从 [Releases](https://github.com/Felix2CN/Anti-tools/releases) 下载最新的 `.vsix` 文件。
2. 在 VS Code 中按 `Ctrl+Shift+P` -> `Extensions: Install from VSIX...` -> 选择文件安装。

### 源码构建
```bash
git clone https://github.com/Felix2CN/Anti-tools.git
cd Anti-tools
npm install
npm run package # 生成可用 VSIX
```

---

## 🎛️ 界面功能说明

### 账号列表
显示所有已添加的账号及其各模型配额状态：
- 🟢 配额充足 (>50%)
- 🟡 配额偏低 (10%-50%)  
- 🔴 配额告急 (<10%)
- ⭐ 当前激活账号标记

### 配额概览
- **当前账号**：显示当前正在使用的账号及序号
- **设备指纹**：显示当前账号的设备指纹绑定状态（点击可重新绑定）
- **活跃账号**：统计当前可用账号数量
- **后台刷新排程**：显示智能排程时间轴
  - 🔥 唤醒：账号已消耗配额，显示预计配额恢复时间
  - 🚀 激活：账号等待激活，显示计划激活时间
  - ⏳ 配额重置时间

### 账号操作
| 操作 | 说明 |
|:---|:---|
| 🌐 **启用透明代理** | 一键部署透明代理到 Antigravity，仅代理 IDE 流量 |
| ⚙️ **代理参数设置** | 配置代理的端口、协议和 Host |
| 🔴/🟢 **CDP 自动点击** | 开启/停止 CDP 自动点击功能（需要 IDE 带 CDP 参数启动） |
| 🔑 **OAuth 登录添加账号** | 通过 Google 登录添加新账号 |
| 🔄 **刷新所有账号配额** | 批量更新所有账号的配额状态 |
| 📅 **后台自动排程** | 开启/关闭智能排程系统 |
| 📥 **导入账号信息** | 从 JSON 文件导入账号数据 |
| 📤 **导出所有账号** | 将所有账号导出为 JSON 文件 |
| ⚙️ **扩展设置** | 打开 Anti Tools 配置面板 |

---

## 🚀 配置指南

在 VS Code 设置中搜索 `anti-tools` 进行调优：

### 配额监控设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `quotaThreshold` | `10` | 配额低于此百分比时提示切换账号 |
| `autoCheckInterval` | `60` | 自动检查配额的间隔时间（秒） |
| `monitoredModels` | `["claude-sonnet-4-5", "gemini-3-flash", "gemini-3-pro-high"]` | 需要监控配额的模型列表 |
| `enableAutoSwitch` | `false` | 配额低于阈值时是否自动切换到最佳账号 |
| `showStatusBarItem` | `true` | 是否在状态栏显示当前账号和配额 |

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
| `wakeup.resetTimeThreshold` | `5` | 额度更新时间阈值（小时）。当账号配额 100% 且剩余重置时间达到此阈值时，自动触发唤醒 |

### 自动点击设置 (CDP)

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `autoAccept.interval` | `200` | 自动化点击的扫描频率（毫秒） |
| `autoAccept.denylist` | `["rm -rf", "format c:", ...]` | 危险指令黑名单，匹配时将暂停自动点击 |

### 透明代理设置

| 设置项 | 默认值 | 功能说明 |
|:---|:---|:---|
| `proxy.host` | `"127.0.0.1"` | 透明代理服务器地址 |
| `proxy.port` | `10808` | 透明代理服务器端口 |
| `proxy.type` | `"socks5"` | 透明代理协议类型（socks5 / http） |

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+Alt+Shift+U` | 开启/关闭自动接受 |

---

## 📄 鸣谢与声明

本项目通过深度剖析 Electron 运行机制与 CDP 通讯协议，整合了多项开源社区的高性能实现，在此深表感谢：

- **核心灵感**：[Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) (by [lbjlaq](https://github.com/lbjlaq)) - 账号管理逻辑的先驱方案。
- **代理驱动**：[antigravity-proxy](https://github.com/yuaotian/antigravity-proxy) (by [yuaotian](https://github.com/yuaotian)) - 透明代理注入技术的核心支撑。
- **统计与 CDP 灵感**：[auto-accept-agent](https://github.com/Munkhin/auto-accept-agent) (by [Munkhin](https://github.com/Munkhin)) - 自动化统计提示与 CDP 高级点击逻辑参考。
- **UI 与架构参考**：[vscode-antigravity-cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit) (by [jlcodes99](https://github.com/jlcodes99)) - VS Code 扩展架构与界面设计参考。

---

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。

程序仅供学习与提升工作效率使用，请自觉遵守相关平台的使用条款，开发者不承担任何因不当使用导致的账号风险。

---

**Author**: [F4CN2US](https://github.com/Felix2CN)  
**Latest Version**: `1.8.94`

---

## 📋 更新日志

### v1.8.94 (2026-01-23)

- **🌐 网络通信层彻底修复**：针对国内用户常用的 V2rayN/Clash 等代理环境进行了深度优化。
  - **Fetch API 重构**：弃用传统的 `https.request`，改用原生 `fetch` API，解决 Electron 环境下的代理拦截问题。
  - **环境变量隔离**：在发送请求时临时清除 `HTTP_PROXY` 等系统环境变量，确保在未开启透明代理时能够真正“直连” Google API。
- **🔥 唤醒逻辑深度优化**：
  - **多端点回退**：对齐 Cockpit 实现，支持主端点与备用端点（sandbox）自动切换。
  - **指数退避重试**：增加请求失败后的自动重试机制，大幅提升在高波动网络下的成功率。
  - **批次间隔控制**：在唤醒多个模型时引入 5 秒冷却时间，有效避免瞬时请求过快导致的 `429 RESOURCE_EXHAUSTED` 错误。
  - **默认模型预设**：在扩展设置中预设了 4 个代表性模型及其唤醒配置。
- **📝 ID 协议对齐**：修正了 `sessionId` 和 `requestId` 的生成格式，完全兼容 Google Cloud Code 的原生协议要求。

### v1.8.79 (2026-01-22)

- **🔧 唤醒状态持久化**：修复扩展重启后唤醒时间过于集中的问题
  - `lastWakeupTime` 和已唤醒账号列表现持久化到 `~/.antigravity_tools/wakeup_state.json`
  - 扩展重启后正确保持唤醒时间间隔（默认 120 分钟）
  - 每日 00:00 UTC 自动重置唤醒状态
- **📝 日志增强**：唤醒成功后显示下一个账号的预计唤醒时间

### v1.8.77 (2026-01-22)

- **🧠 Smart 排程算法优化**：
  - 按 reset_time 升序排序，恢复最早的账号优先安排
  - 唤醒时间必须 > reset_time，确保配额完全恢复后再唤醒
  - 充分利用时间资源，避免空闲时段浪费
- **🎛️ 排程模式下拉框**：`quota.autoSchedule` 支持 `none`/`fixed`/`smart` 三种模式
- **👤 显示名称修复**：当前账号和推荐账号优先显示用户名
- **🔥 手动唤醒功能**：排程列表中点击账号可手动触发唤醒
- **🔄 配额概览刷新按钮**：标题栏添加刷新按钮

### v1.8.70 (2026-01-21)

- **🎯 智能状态栏模型显示**：状态栏现在可以实时反映 Agent 窗口中选择的模型，自动优先显示当前使用模型的配额信息。
- **🔍 独立模型检测循环**：新增独立的模型检测定时器，无需开启 CDP 自动接受功能即可实时监测模型切换。
- **🗺️ UI 模型名称映射**：添加精确的模型名称映射表，将 UI 显示名称（如 "Gemini 3 Pro (High)"）准确映射到配额 API 模型名（如 "gemini-3-pro-high"）。
- **⚡ CDP 检测优化**：使用精确的 CSS 选择器定位 Agent 聊天窗口中的模型显示元素，支持 iframe 穿透。

### v1.8.67

- **CDP 重启参数修复**：修复所有 IDE 重启操作（账号切换、代理启用/停用）未带 `--remote-debugging-port=9000` 参数的问题，确保 CDP 自动点击功能在重启后仍可用。
- **智能唤醒优化**：针对 100% 配额账号，当距离重置时间小于阈值（默认5小时）时自动触发唤醒，提前启动配额重置周期。
- **排程显示优化**：后台刷新排程统一只显示时间不显示日期，用户可通过时间判断是否为次日排程。
- **文档完善**：补充完整的功能说明和配置参数文档。

