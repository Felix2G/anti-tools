import * as vscode from 'vscode';

export class OperationsProvider implements vscode.TreeDataProvider<OperationItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<OperationItem | undefined | null | void> = new vscode.EventEmitter<OperationItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<OperationItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: OperationItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: OperationItem): Thenable<OperationItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const items: OperationItem[] = [
            new OperationItem(
                'OAuth 登录添加账号',
                '通过 Google 登录添加新账号',
                new vscode.ThemeIcon('sign-in'),
                {
                    command: 'antigravity.oauthLogin',
                    title: 'OAuth 登录添加账号'
                }
            ),
            new OperationItem(
                '刷新所有账号配额',
                '更新所有账号的配额使用情况',
                new vscode.ThemeIcon('refresh'),
                {
                    command: 'antigravity.refreshAllQuotas',
                    title: '刷新所有账号配额'
                }
            ),
            new OperationItem(
                '导入账号信息',
                '从 JSON 文件导入账号数据',
                new vscode.ThemeIcon('cloud-upload'),
                {
                    command: 'antigravity.importAccounts',
                    title: '导入账号信息'
                }
            ),
            new OperationItem(
                '导出所有账号',
                '将所有账号导出为 JSON 文件',
                new vscode.ThemeIcon('cloud-download'),
                {
                    command: 'antigravity.exportAllAccounts',
                    title: '导出所有账号'
                }
            ),
            new OperationItem(
                '扩展设置',
                '配置配额阈值和监控模型',
                new vscode.ThemeIcon('settings-gear'),
                {
                    command: 'antigravity.openSettings',
                    title: '打开设置'
                }
            )
        ];

        return Promise.resolve(items);
    }
}

class OperationItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly iconPath: vscode.ThemeIcon,
        public readonly command: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${label}\n${description}`;
    }
}
