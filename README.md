# Antigravity Auth Switch

**Antigravity 账号切换与配额监控 VS Code 扩展**

一个轻量级的 VS Code 扩展，用于管理 Antigravity 账号、监控配额，并在配额低于阈值时提示切换账号。

## ✨ 功能特性

- 🔄 **账号切换** - 快速在多个 Antigravity 账号之间切换
- 📊 **配额监控** - 实时查看各模型的配额使用情况
- ⚠️ **低配额提醒** - 当配额低于设定阈值时自动提醒
- 🔐 **OAuth 登录** - 通过 Google OAuth 添加新账号
- 🔑 **设备指纹管理** - 采集本机指纹或生成随机指纹，降低风控风险
- 📤 **导入导出** - 支持批量导出/导入账号数据 (JSON格式)，方便备份与迁移
- 🗑️ **账号管理** - 便捷的账号删除与状态维护
- 📁 **数据共用** - 与 Antigravity Tools 桌面应用共用账号数据

## 📦 安装

### 从 VSIX 安装

1. 下载 `.vsix` 文件
2. 在 VS Code 中按 `Ctrl+Shift+P`
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的 `.vsix` 文件

### 从源码构建

```bash
cd antigravity-auth-switch
npm install
npm run compile
npm run package
```

> ⚠️ **注意**：每次执行打包 (`npm run package`) 前，**必须** 更新 `package.json` 中的 `version` 字段，确保版本号递增。

## 🚀 使用方法

### 侧边栏

点击活动栏中的 Antigravity 图标，打开侧边栏查看：
- **账号列表** - 所有已添加的账号及其配额状态，支持右键快捷操作
- **配额概览** - 当前账号和推荐账号
- **账号操作** - 常用快捷操作入口

### 命令

按 `Ctrl+Shift+P` 打开命令面板，输入 `Anti-tools` 查看所有可用命令：

| 命令 | 说明 |
|------|------|
| `Anti-tools: 切换账号` | 选择并切换到另一个账号 |
| `Anti-tools: 刷新配额` | 刷新当前账号的配额 |
| `Anti-tools: 刷新` | 刷新所有账号的配额 |
| `Anti-tools: 登录` | 通过 Google OAuth 添加新账号 |
| `Anti-tools: 绑定设备指纹` | 绑定当前设备或生成随机指纹 |
| `Anti-tools: 导入` | 导入账号数据 (JSON) |
| `Anti-tools: 导出` | 导出所有账号 (JSON) |
| `Anti-tools: 导出此账号` | 导出当前选中账号 |
| `Anti-tools: 删除账号` | 删除指定账号 |
| `Anti-tools: 设置` | 打开扩展设置页面 |

### 状态栏

状态栏右下角显示当前账号和最低配额百分比，点击可快速切换账号。

## ⚙️ 配置

在 VS Code 设置中搜索 `anti-tools` 进行配置：

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `anti-tools.quotaThreshold` | `10` | 配额低于此百分比时提示切换账号 |
| `anti-tools.autoCheckInterval` | `60` | 自动检查配额的间隔时间（秒），默认60秒 |
| `anti-tools.monitoredModels` | `["claude-sonnet-4-5", "gemini-3-flash", "gemini-3-pro-high"]` | 需要监控配额的模型列表 |
| `anti-tools.enableAutoSwitch` | `false` | 配额低于阈值时是否自动切换到最佳账号 |
| `anti-tools.showStatusBarItem` | `true` | 是否在状态栏显示当前账号和配额 |

## 📂 数据存储

本扩展与 Antigravity Tools 共用账号数据，存储位置：

- **Windows**: `%USERPROFILE%\.antigravity_tools\`
- **macOS**: `~/.antigravity_tools/`
- **Linux**: `~/.antigravity_tools/`

## 🔒 安全说明

- OAuth 客户端凭据与官方 Antigravity 一致
- Token 数据存储在本地，不会上传到任何服务器
- 设备指纹仅用于降低账号关联风险

## 📝 更新日志

### v1.5.8
- 优化代码库结构，迁移至新仓库
- 完善文档与元数据配置

### v1.4.0
- **新增导入导出功能**：支持 JSON 格式的账号批量导入与导出
- **增强指纹管理**：支持“采集本机”与“随机生成”两种指纹绑定模式
- **账号管理优化**：增加账号删除确认、优化侧边栏 UI

### v1.0.0
- 初始版本发布
- 基础账号切换与配额监控

## ❤️ 鸣谢

本扩展的功能实现参考并引用了以下优秀开源项目的代码与设计，在此对原作者表示衷心的感谢：

*   [Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) by [lbjlaq](https://github.com/lbjlaq)
*   [vscode-antigravity-cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit) by [jlcodes99](https://github.com/jlcodes99)

## 📜 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Publisher**: Felix2G
