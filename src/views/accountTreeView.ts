/**
 * 账号树视图 - 侧边栏显示账号列表
 */

import * as vscode from 'vscode';
import type { Account } from '../models/types';
import * as accountService from '../services/accountService';

/**
 * 账号树节点
 */
export class AccountTreeItem extends vscode.TreeItem {
    constructor(
        public readonly account: Account,
        public readonly isCurrent: boolean,
        public readonly index: number
    ) {
        // 显示纯数字序号，如 "1", "2"
        super(`${index + 1}`, vscode.TreeItemCollapsibleState.Collapsed);

        // 设置 ID (关键：修复 reveal/collapse 操作不生效的问题)
        this.id = account.id;

        // 移除头像图标，保持极简
        this.iconPath = undefined;

        // 设置描述：仅显示配额简报，移除具体的用户名/邮箱显示
        const quotaInfo = this.getQuotaDescription();
        this.description = isCurrent ? `✓ ${quotaInfo}` : quotaInfo;

        // 设置提示
        this.tooltip = this.getTooltip();

        // 设置上下文值用于菜单
        this.contextValue = 'account';

        // 设置命令 (双击切换)
        this.command = {
            command: 'antigravity.switchAccount',
            title: '切换账号',
            arguments: [this.account.id],
        };
    }

    private getQuotaDescription(): string {
        if (!this.account.quota) {
            return '点击刷新配额';
        }

        if (this.account.quota.is_forbidden) {
            return '🚫 已禁用';
        }

        const models = this.account.quota.models;
        if (!models || models.length === 0) {
            return '无配额数据';
        }

        // 获取主要模型的配额
        const modelNames: Record<string, string> = {
            'gemini-3-pro-high': 'Pro',
            'gemini-3-flash': 'Flash',
            'claude-sonnet-4-5-thinking': 'Claude',
            'claude-sonnet-4-5': 'Claude',
        };

        // 收集配额信息并排序
        const quotaInfos: { short: string; percentage: number; color: string }[] = [];

        for (const model of models) {
            for (const [key, short] of Object.entries(modelNames)) {
                if (model.name.includes(key) || key.includes(model.name)) {
                    const color = model.percentage >= 50 ? '🟢' : model.percentage >= 20 ? '🟡' : '🔴';
                    quotaInfos.push({ short, percentage: model.percentage, color });
                    break;
                }
            }
        }

        if (quotaInfos.length === 0) {
            // 显示最低配额
            const lowest = models.reduce((min, m) => m.percentage < min.percentage ? m : min, models[0]);
            return `${lowest.percentage}%`;
        }

        // 按配额从低到高排序
        quotaInfos.sort((a, b) => a.percentage - b.percentage);

        return quotaInfos.map(q => `${q.short}:${q.color}${q.percentage}%`).join(' ');
    }

    private getTooltip(): vscode.MarkdownString {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### ${this.account.name || this.account.email}\n\n`);
        md.appendMarkdown(`**邮箱**: ${this.account.email}\n\n`);

        if (this.account.quota?.subscription_tier) {
            md.appendMarkdown(`**订阅**: ${this.account.quota.subscription_tier}\n\n`);
        }

        if (this.account.quota?.models && this.account.quota.models.length > 0) {
            md.appendMarkdown(`**配额详情**:\n\n`);
            for (const model of this.account.quota.models) {
                const bar = this.getProgressBar(model.percentage);
                md.appendMarkdown(`- ${model.name}: ${bar} ${model.percentage}%\n`);
            }
        }

        if (this.account.device_profile) {
            md.appendMarkdown(`\n**设备指纹**: 已绑定\n`);
        }

        return md;
    }

    private getProgressBar(percentage: number): string {
        const filled = Math.round(percentage / 10);
        const empty = 10 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}

/**
 * 账号详情节点 (子节点)
 */
export class AccountDetailItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly value: string,
        public readonly icon?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = value;
        if (icon) {
            this.iconPath = new vscode.ThemeIcon(icon);
        }
    }
}

/**
 * 账号树数据提供者
 */
export class AccountTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    // 缓存节点实例，确保 reveal 操作使用的是同一个对象引用
    private _itemCache: AccountTreeItem[] | undefined;

    refresh(): void {
        this._itemCache = undefined; // 清除缓存
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            // 根节点 - 返回账号列表 (使用缓存)
            if (!this._itemCache) {
                this._itemCache = this.getAccountItems();
            }
            return Promise.resolve(this._itemCache);
        }

        if (element instanceof AccountTreeItem) {
            // 账号节点 - 返回详情
            return Promise.resolve(this.getAccountDetails(element.account));
        }

        return Promise.resolve([]);
    }

    private getAccountItems(): AccountTreeItem[] {
        const accounts = accountService.listAccounts();
        const current = accountService.getCurrentAccount();

        return accounts.map((account, index) =>
            new AccountTreeItem(account, current?.id === account.id, index)
        );
    }

    private getAccountDetails(account: Account): AccountDetailItem[] {
        const items: AccountDetailItem[] = [];

        items.push(new AccountDetailItem('邮箱', account.email, 'mail'));

        if (account.name) {
            items.push(new AccountDetailItem('名称', account.name, 'person'));
        }

        if (account.quota?.subscription_tier) {
            const tier = account.quota.subscription_tier.toLowerCase();
            let tierIcon = 'circle-outline';
            if (tier.includes('ultra')) {
                tierIcon = 'star-full';
            } else if (tier.includes('pro')) {
                tierIcon = 'star-half';
            }
            items.push(new AccountDetailItem('订阅', account.quota.subscription_tier.toUpperCase(), tierIcon));
        }

        // 模型配额详情（按配额从低到高排序）
        if (account.quota?.models && account.quota.models.length > 0) {
            // 定义显示顺序和缩写
            const modelDisplayNames: Record<string, string> = {
                'gemini-3-pro-high': 'G3 Pro',
                'gemini-3-flash': 'G3 Flash',
                'gemini-3-pro-image': 'G3 Image',
                'gemini-2.0-flash-exp': 'G2.0 Flash',
                'gemini-1.5-pro-latest': 'G1.5 Pro',
                'gemini-1.5-flash-latest': 'G1.5 Flash',
                'gemini-1.5-flash-8b-latest': 'G1.5 Flash 8B',
                'claude-sonnet-4-5-thinking': 'Claude 4.5 Think',
                'claude-sonnet-4-5': 'Claude 4.5',
                'claude-3-5-sonnet-latest': 'Claude 3.5 Sonnet',
                'claude-3-5-haiku-latest': 'Claude 3.5 Haiku',
                'claude-3-opus-latest': 'Claude 3 Opus',
            };

            // 按配额从低到高排序
            const sortedModels = [...account.quota.models].sort((a, b) => a.percentage - b.percentage);

            for (const model of sortedModels) {
                const displayName = modelDisplayNames[model.name] || model.name;
                const timeStr = model.reset_time ? this.formatTimeRemaining(model.reset_time) : '';
                const percentage = model.percentage;

                // 确定图标和颜色
                let icon = 'circle-large-filled';
                let colorTag = '';
                if (percentage >= 50) {
                    icon = 'pass-filled';
                    colorTag = '🟢';
                } else if (percentage >= 20) {
                    icon = 'circle-large-outline';
                    colorTag = '🟡';
                } else {
                    icon = 'warning';
                    colorTag = '🔴';
                }

                // 格式化描述: 剩余时间 + 百分比
                const desc = timeStr ? `${colorTag} ${timeStr} ${percentage}%` : `${colorTag} ${percentage}%`;
                items.push(new AccountDetailItem(displayName, desc, icon));
            }
        } else {
            items.push(new AccountDetailItem('配额', '未查询', 'info'));
        }

        // 设备指纹状态


        return items;
    }

    /**
     * 格式化剩余时间
     */
    private formatTimeRemaining(dateStr: string): string {
        const targetDate = new Date(dateStr);
        const now = new Date();
        const diffMs = targetDate.getTime() - now.getTime();

        if (diffMs <= 0) return '0h 0m';

        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs >= 24) {
            const diffDays = Math.floor(diffHrs / 24);
            const remainingHrs = diffHrs % 24;
            return `${diffDays}d ${remainingHrs}h`;
        }

        return `${diffHrs}h ${diffMins}m`;
    }
}
