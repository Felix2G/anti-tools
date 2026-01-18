/**
 * 配额概览树视图
 */

import * as vscode from 'vscode';
import * as accountService from '../services/accountService';

/**
 * 配额概览树数据提供者
 */
export class QuotaOverviewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<vscode.TreeItem[]> {
        const accounts = accountService.listAccounts();
        const config = vscode.workspace.getConfiguration('anti-tools');
        const monitoredModels = config.get<string[]>('monitoredModels', []);
        const threshold = config.get<number>('quotaThreshold', 10);

        const items: vscode.TreeItem[] = [];

        // 当前账号
        const current = accountService.getCurrentAccount();
        if (current) {
            const item = new vscode.TreeItem(`当前: ${current.email}`, vscode.TreeItemCollapsibleState.None);
            item.iconPath = new vscode.ThemeIcon('account', new vscode.ThemeColor('charts.green'));
            items.push(item);

            // 设备指纹 (移动到此处)
            const deviceProfile = current.device_profile;
            let deviceItem: vscode.TreeItem;

            if (deviceProfile) {
                const shortId = deviceProfile.machine_id.substring(0, 8);
                deviceItem = new vscode.TreeItem(`设备指纹: 已绑定 (${shortId}...)`, vscode.TreeItemCollapsibleState.None);
                deviceItem.iconPath = new vscode.ThemeIcon('device-mobile', new vscode.ThemeColor('charts.green'));
                deviceItem.tooltip = `已绑定指纹 ID: ${deviceProfile.machine_id}\n点击重新绑定`;
            } else {
                deviceItem = new vscode.TreeItem(`设备指纹: 未绑定`, vscode.TreeItemCollapsibleState.None);
                deviceItem.iconPath = new vscode.ThemeIcon('device-mobile', new vscode.ThemeColor('charts.red'));
                deviceItem.tooltip = `未绑定设备指纹，可能增加风控风险\n点击立即绑定`;
            }

            deviceItem.command = {
                command: 'antigravity.bindDeviceProfile',
                title: '绑定设备指纹',
                arguments: [current.id] // 明确传递当前账号 ID
            };
            items.push(deviceItem);
        }

        // 统计信息
        const activeAccounts = accounts.filter(a => !a.disabled && !a.quota?.is_forbidden);
        const lowQuotaAccounts = activeAccounts.filter(a => {
            if (!a.quota) return false;
            for (const model of a.quota.models) {
                if (monitoredModels.some(m => model.name.includes(m)) && model.percentage < threshold) {
                    return true;
                }
            }
            return false;
        });

        const statsItem = new vscode.TreeItem(`活跃账号: ${activeAccounts.length}`, vscode.TreeItemCollapsibleState.None);
        statsItem.iconPath = new vscode.ThemeIcon('pulse');
        items.push(statsItem);

        if (lowQuotaAccounts.length > 0) {
            const warningItem = new vscode.TreeItem(`低配额账号: ${lowQuotaAccounts.length}`, vscode.TreeItemCollapsibleState.None);
            warningItem.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
            items.push(warningItem);
        }

        // 推荐账号
        const best = accountService.getBestAccount(monitoredModels);
        if (best && (!current || best.id !== current.id)) {
            const bestItem = new vscode.TreeItem(`推荐: ${best.email}`, vscode.TreeItemCollapsibleState.None);
            bestItem.iconPath = new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.blue'));
            bestItem.command = {
                command: 'antigravity.switchAccount',
                title: '切换到推荐账号',
                arguments: [best.id],
            };
            items.push(bestItem);
        }

        return Promise.resolve(items);
    }
}
