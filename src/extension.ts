/**
 * Antigravity Auth Switch - VS Code 扩展入口
 */

import * as vscode from 'vscode';
import { AccountTreeDataProvider, AccountTreeItem } from './views/accountTreeView';
import { QuotaOverviewProvider } from './views/quotaTreeView';
import { OperationsProvider } from './views/operationsView'; // Added import
import * as accountService from './services/accountService';
import * as quotaService from './services/quotaService';

// 全局变量
let accountTreeProvider: AccountTreeDataProvider;
let quotaOverviewProvider: QuotaOverviewProvider;
let operationsProvider: OperationsProvider;
let accountTreeView: vscode.TreeView<vscode.TreeItem>; // 新增 TreeView 实例
let statusBarItem: vscode.StatusBarItem;
let quotaCheckInterval: NodeJS.Timeout | undefined;

/**
 * 扩展激活
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Antigravity Auth Switch 扩展已激活');

    // 处理待处理的 Token 注入
    processPendingSwitch();

    // 注册树视图
    accountTreeProvider = new AccountTreeDataProvider();
    quotaOverviewProvider = new QuotaOverviewProvider();
    operationsProvider = new OperationsProvider();

    // 创建 TreeView 实例以便后续控制 (expand/collapse)
    accountTreeView = vscode.window.createTreeView('antigravity.accountsView', {
        treeDataProvider: accountTreeProvider
    });

    context.subscriptions.push(
        accountTreeView,
        vscode.window.registerTreeDataProvider('antigravity.quotaView', quotaOverviewProvider),
        vscode.window.registerTreeDataProvider('antigravity.operationsView', operationsProvider)
    );

    // 注册所有命令
    registerCommands(context);

    // 创建状态栏项
    createStatusBarItem(context);

    // 启动配额检查定时器
    startQuotaCheckTimer(context);

    // 监听配置变更
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('anti-tools')) {
                onConfigurationChanged(context);
            }
        })
    );

    // 初始刷新
    refreshViews();
    updateStatusBar(context);

    // 延迟检查配额
    setTimeout(() => {
        checkQuotaOnStartup(context);
    }, 5000);
}

/**
 * 处理待处理的 Token 注入
 */
async function processPendingSwitch() {
    try {
        const storage = await import('./services/storageService.js');
        const pending = storage.loadPendingSwitch();

        if (!pending) return;

        if (Date.now() - pending.createdAt > 5 * 60 * 1000) {
            storage.clearPendingSwitch();
            return;
        }

        const db = await import('./services/dbService.js');
        const dbPath = db.getDbPath();

        if (dbPath && db.hasSqlite3()) {
            db.backupDb(dbPath);
            db.injectToken(dbPath, pending.accessToken, pending.refreshToken, pending.expiryTimestamp);
            storage.clearPendingSwitch();

            const account = storage.loadAccount(pending.accountId);
            vscode.window.showInformationMessage(`账号 ${account?.email || pending.accountId} 切换成功！`);
        }
    } catch (error) {
        console.error('处理待处理切换失败:', error);
    }
}

/**
 * 注册所有命令
 */
function registerCommands(context: vscode.ExtensionContext) {
    // 1. 切换账号
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.switchAccount', async (arg?: any) => {
            let accountId = typeof arg === 'string' ? arg : arg?.id || arg?.accountId;
            if (!accountId) {
                const accounts = accountService.listAccounts();
                const items = accounts.map(a => ({ label: a.name || a.email, description: a.email, accountId: a.id }));
                const selected = await vscode.window.showQuickPick(items, { placeHolder: '选择要切换的账号' });
                if (!selected) return;
                accountId = selected.accountId;
            }
            await accountService.switchAccount(accountId);
            refreshViews();
            updateStatusBar(context);
        })
    );

    // 2. 刷新配额
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.refreshQuota', async (arg?: any) => {
            let accountId: string | undefined;

            if (typeof arg === 'string') {
                accountId = arg;
            } else if (arg && typeof arg === 'object' && 'account' in arg) {
                // 处理 TreeItem
                accountId = arg.account.id;
            }

            // 如果没传参或是无法识别的参数，尝试使用当前账号
            const id = accountId || accountService.getCurrentAccount()?.id;

            if (!id) {
                vscode.window.showErrorMessage('无法确定要刷新的账号');
                return;
            }

            try {
                await accountService.refreshAccountQuota(id);
                refreshViews();
                updateStatusBar(context);
            } catch (error) {
                vscode.window.showErrorMessage(`刷新失败: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );

    // 3. 刷新所有配额
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.refreshAllQuotas', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "正在刷新所有账号配额...",
                cancellable: false
            }, async () => {
                const result = await accountService.refreshAllQuotas();
                refreshViews();
                updateStatusBar(context);
                checkQuotaThreshold(context);

                // 只有在有失败的情况下才弹窗，或者显示简短的状态栏消息
                if (result.failed > 0) {
                    vscode.window.showWarningMessage(`刷新完成: 成功 ${result.success}, 失败 ${result.failed}`);
                } else {
                    vscode.window.setStatusBarMessage(`所有账号配额刷新成功 (${result.success})`, 3000);
                }
            });
        })
    );

    // 4. 设置特定的状态栏显示模型 (关键交互逻辑)
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.setStatusModel', (modelName: string) => {
            context.globalState.update('statusDisplayModel', modelName);
            updateStatusBar(context);
            const label = modelName === 'auto' ? '自动智能显示' : modelName.split('/').pop();
            vscode.window.setStatusBarMessage(`状态栏已切换至: ${label}`, 3000);
        })
    );

    // 5. 循环切换命令 (点击状态栏触发)
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.cycleStatusModel', () => {
            cycleStatusModel(context);
        })
    );

    // 其他原有命令...
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'anti-tools');
        }),
        vscode.commands.registerCommand('antigravity.oauthLogin', async () => {
            await accountService.addAccountViaOAuth();
            refreshViews();
            updateStatusBar(context);
        }),
        // 绑定/解绑 设备指纹
        vscode.commands.registerCommand('antigravity.bindDeviceProfile', async (item?: AccountTreeItem | string) => {
            const accountId = typeof item === 'string' ? item : item?.account.id || accountService.getCurrentAccount()?.id;
            if (!accountId) return;

            const account = accountService.getAccount(accountId);
            const isBound = !!account?.device_profile;

            const items = [
                { label: '采集当前设备指纹', detail: '从 Antigravity 默认存储读取当前指纹并保存到此账号', value: 'capture' },
                { label: '生成全新随机指纹', detail: '为此账号生成一套全新的随机设备标识', value: 'generate' }
            ];

            if (isBound) {
                items.push({ label: '🚫 取消绑定', detail: '移除此账号绑定的设备指纹，恢复默认策略', value: 'unbind' });
            }

            const selection = await vscode.window.showQuickPick(items, {
                placeHolder: `管理设备指纹 (当前: ${isBound ? '已绑定' : '未绑定'})`
            });

            if (selection) {
                try {
                    if (selection.value === 'unbind') {
                        accountService.unbindDeviceProfile(accountId);
                        vscode.window.showInformationMessage('设备指纹已成功解除绑定');
                    } else {
                        accountService.bindDeviceProfile(accountId, selection.value as any);
                        vscode.window.showInformationMessage(`指纹绑定成功 (${selection.label})`);
                    }
                    refreshViews();
                } catch (error) {
                    vscode.window.showErrorMessage(`操作失败: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }),
        // 导出选中的账号
        vscode.commands.registerCommand('antigravity.exportAccount', async (item?: AccountTreeItem) => {
            if (!item?.account) {
                vscode.window.showErrorMessage('请先选择一个账号');
                return;
            }
            const json = accountService.exportAccountToJson(item.account.id);
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`account_${item.account.email.split('@')[0]}.json`),
                filters: { 'JSON': ['json'] },
                title: '导出账号信息'
            });
            if (uri) {
                const fs = await import('fs');
                fs.writeFileSync(uri.fsPath, json, 'utf8');
                vscode.window.showInformationMessage('账号导出成功！');
            }
        }),
        // 导出所有账号
        vscode.commands.registerCommand('antigravity.exportAllAccounts', async () => {
            const json = accountService.exportAccountsToJson();
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`all_accounts_${new Date().toISOString().split('T')[0]}.json`),
                filters: { 'JSON': ['json'] },
                title: '导出所有账号信息'
            });
            if (uri) {
                const fs = await import('fs');
                fs.writeFileSync(uri.fsPath, json, 'utf8');
                vscode.window.showInformationMessage('所有账号导出成功！');
            }
        }),
        // 导入账号
        vscode.commands.registerCommand('antigravity.importAccounts', async () => {
            const uris = await vscode.window.showOpenDialog({
                canSelectMany: false,
                filters: { 'JSON': ['json'] },
                title: '导入账号信息'
            });
            if (uris && uris[0]) {
                const fs = await import('fs');
                const content = fs.readFileSync(uris[0].fsPath, 'utf8');
                try {
                    const result = await accountService.importAccountsFromJson(content);
                    vscode.window.showInformationMessage(`导入完成！成功: ${result.success}, 失败: ${result.failed}`);
                    refreshViews();
                } catch (error) {
                    vscode.window.showErrorMessage(`导入失败: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }),
        // 删除账号
        vscode.commands.registerCommand('antigravity.deleteAccount', async (item?: AccountTreeItem) => {
            if (!item?.account) return;
            const confirm = await vscode.window.showWarningMessage(
                `确定要删除账号 ${item.account.email} 吗？`,
                { modal: true },
                '确定删除'
            );
            if (confirm === '确定删除') {
                accountService.deleteAccount(item.account.id);
                refreshViews();
                updateStatusBar(context);
                vscode.window.showInformationMessage('账号已删除');
            }
        })
    );
}

/**
 * 循环切换逻辑
 */
function cycleStatusModel(context: vscode.ExtensionContext) {
    const current = accountService.getCurrentAccount();
    if (!current?.quota?.models) return;

    const monitoredModels = vscode.workspace.getConfiguration('anti-tools').get<string[]>('monitoredModels', []);
    const availableModels = current.quota.models
        .filter(m => monitoredModels.some(pattern => m.name.includes(pattern)))
        .map(m => m.name);

    const options = ['auto', ...availableModels];
    let currentSelection = context.globalState.get<string>('statusDisplayModel', 'auto');
    let nextIndex = (options.indexOf(currentSelection) + 1) % options.length;

    context.globalState.update('statusDisplayModel', options[nextIndex]);
    updateStatusBar(context);
}

/**
 * 创建状态栏项
 */
function createStatusBarItem(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'antigravity.cycleStatusModel';
    context.subscriptions.push(statusBarItem);
    statusBarItem.show();
}

/**
 * 更新状态栏
 */
/**
 * 更新状态栏
 */
function updateStatusBar(context: vscode.ExtensionContext) {
    const current = accountService.getCurrentAccount();
    if (!current) {
        statusBarItem.text = '$(account) 无账号';
        return;
    }

    // 获取账号序号
    const accounts = accountService.listAccounts();
    const index = accounts.findIndex(a => a.id === current.id);
    const accountLabel = index >= 0 ? `#${index + 1}` : '';

    const selectedModelName = context.globalState.get<string>('statusDisplayModel', 'auto');
    const monitoredModels = vscode.workspace.getConfiguration('anti-tools').get<string[]>('monitoredModels', []);
    let targetModel: any;

    if (current.quota?.models) {
        if (selectedModelName !== 'auto') {
            targetModel = current.quota.models.find(m => m.name === selectedModelName);
        }

        if (!targetModel) {
            const priorityPatterns = ['claude-sonnet-4-5', 'gemini-3-pro-high', 'gemini-3-flash'];
            for (const pattern of priorityPatterns) {
                const found = current.quota.models.find(m => m.name.includes(pattern));
                if (found && monitoredModels.some(m => found.name.includes(m))) {
                    targetModel = found;
                    break;
                }
            }
        }
    }

    if (targetModel) {
        const color = targetModel.percentage >= 50 ? '🟢' : targetModel.percentage >= 20 ? '🟡' : '🔴';
        const prefix = selectedModelName !== 'auto' ? '📌 ' : '';

        // 显示完整模型名称（或者稍微缩短但不像之前那么短）
        // 用户要求"默认模型显示全"，我们直接显示 name，VS Code 状态栏可能会很长，但先满足用户
        let label = targetModel.name;

        // 计算剩余时间
        let timeStr = '';
        if (targetModel.reset_time) {
            const target = new Date(targetModel.reset_time);
            const now = new Date();
            const diffMs = target.getTime() - now.getTime();
            if (diffMs > 0) {
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                timeStr = ` ${diffHrs}h ${diffMins}m`;
            }
        }

        statusBarItem.text = `$(account) ${accountLabel} | ${prefix}${label}: ${color}${targetModel.percentage}%${timeStr}`;
    } else {
        statusBarItem.text = `$(account) ${accountLabel} | $(sync)`;
    }

    updateTooltip(context, current);
}

/**
 * 生成交互式 Tooltip
 */
function updateTooltip(context: vscode.ExtensionContext, current: any) {
    const lines = [
        `**账号**: ${current.email}`,
        `**同步时间**: ${current.quota?.last_updated ? new Date(current.quota.last_updated).toLocaleTimeString() : '未刷新'}`,
        `[$(refresh) 刷新配额](command:antigravity.refreshQuota)`,
        '',
        '**点击模型切换状态栏显示**:',
    ];

    if (current.quota?.models) {
        const sorted = [...current.quota.models].sort((a, b) => a.percentage - b.percentage);
        for (const m of sorted) {
            const color = m.percentage >= 50 ? '🟢' : m.percentage >= 20 ? '🟡' : '🔴';
            const cmd = `command:antigravity.setStatusModel?${encodeURIComponent(JSON.stringify([m.name]))}`;

            // 格式化重置时间
            let timeStr = '';
            if (m.reset_time) {
                const target = new Date(m.reset_time);
                const now = new Date();
                const diffMs = target.getTime() - now.getTime();
                if (diffMs > 0) {
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    timeStr = `(⏳ ${diffHrs}h ${diffMins}m)`;
                }
            }

            lines.push(`- [${m.name}](${cmd}): ${color} ${m.percentage}% ${timeStr}`);
        }
        lines.push('', `[🔄 恢复智能显示](command:antigravity.setStatusModel?${encodeURIComponent(JSON.stringify(['auto']))})`);
    }

    const md = new vscode.MarkdownString(lines.join('\n'));
    md.isTrusted = true;
    md.supportThemeIcons = true;
    statusBarItem.tooltip = md;
}

function refreshViews() {
    accountTreeProvider.refresh();
    quotaOverviewProvider.refresh();
}

function startQuotaCheckTimer(context: vscode.ExtensionContext) {
    if (quotaCheckInterval) clearInterval(quotaCheckInterval);
    const interval = vscode.workspace.getConfiguration('anti-tools').get<number>('autoCheckInterval', 60) * 1000;
    quotaCheckInterval = setInterval(async () => {
        await accountService.refreshAllQuotas();
        refreshViews();
        updateStatusBar(context);
        checkQuotaThreshold(context);
    }, interval);
}

async function checkQuotaThreshold(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('anti-tools');
    const threshold = config.get<number>('quotaThreshold', 10);
    const monitoredModels = config.get<string[]>('monitoredModels', []);
    const current = accountService.getCurrentAccount();
    if (!current) return;

    const check = quotaService.isQuotaBelowThreshold(current.quota, threshold, monitoredModels);
    if (check.isBelowThreshold) {
        const best = accountService.getBestAccount(monitoredModels);
        if (best && best.id !== current.id) {
            const result = await vscode.window.showWarningMessage(`配额不足, 推荐切换到 ${best.email}`, '切换账号');
            if (result === '切换账号') {
                await accountService.switchAccount(best.id);
                refreshViews();
                updateStatusBar(context);
            }
        }
    }
}

async function checkQuotaOnStartup(context: vscode.ExtensionContext) {
    const current = accountService.getCurrentAccount();
    if (current) {
        await accountService.refreshAccountQuota(current.id);
        refreshViews();
        updateStatusBar(context);
        checkQuotaThreshold(context);
    }
}

function onConfigurationChanged(context: vscode.ExtensionContext) {
    startQuotaCheckTimer(context);
    refreshViews();
    updateStatusBar(context);
}

export function deactivate() {
    if (quotaCheckInterval) clearInterval(quotaCheckInterval);
}
