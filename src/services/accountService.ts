/**
 * 账号服务 - 管理账号的增删改查和切换
 */

import * as vscode from 'vscode';
import * as crypto from 'crypto';
import type { Account, TokenData, QuotaData, DeviceProfile } from '../models/types';

// 使用 Node.js 内置的 crypto.randomUUID()
const uuidv4 = () => crypto.randomUUID();
import * as storage from './storageService';
import * as oauth from './oauthService';
import * as quota from './quotaService';

/**
 * 列出所有账号
 */
export function listAccounts(): Account[] {
    return storage.loadAllAccounts();
}

/**
 * 获取当前账号
 */
export function getCurrentAccount(): Account | null {
    const currentId = storage.getCurrentAccountId();
    if (!currentId) {
        return null;
    }
    return storage.loadAccount(currentId);
}

/**
 * 添加新账号
 */
export function addAccount(email: string, token: TokenData, name?: string): Account {
    const index = storage.loadAccountIndex();

    // 检查是否已存在
    const existing = index.accounts.find(s => s.email === email);
    if (existing) {
        // 更新现有账号
        const account = storage.loadAccount(existing.id);
        if (account) {
            account.token = token;
            account.name = name || account.name;
            account.last_used = Date.now();
            storage.saveAccount(account);
            storage.addAccountToIndex(account);
            return account;
        }
    }

    // 创建新账号
    const account: Account = {
        id: uuidv4(),
        email,
        name,
        token,
        created_at: Date.now(),
        last_used: Date.now(),
        device_history: [],
    };

    storage.saveAccount(account);
    storage.addAccountToIndex(account);

    return account;
}

/**
 * 通过 OAuth 登录添加账号
 */
export async function addAccountViaOAuth(): Promise<Account> {
    const tokenData = await oauth.startOAuthLogin();

    if (!tokenData.email) {
        throw new Error('无法获取账号邮箱');
    }

    // 获取用户名
    let name: string | undefined;
    try {
        const userInfo = await oauth.getUserInfo(tokenData.access_token);
        name = userInfo.name || userInfo.given_name;
    } catch {
        // 忽略获取用户名失败
    }

    const account = addAccount(tokenData.email, tokenData, name);

    vscode.window.showInformationMessage(`账号 ${account.email} 添加成功！`);

    return account;
}

/**
 * 删除账号
 */
export function deleteAccount(accountId: string): void {
    const index = storage.loadAccountIndex();

    // 从索引中移除
    index.accounts = index.accounts.filter(s => s.id !== accountId);

    // 如果是当前账号，切换到下一个
    if (index.current_account_id === accountId) {
        index.current_account_id = index.accounts[0]?.id;
    }

    storage.saveAccountIndex(index);
    storage.deleteAccount(accountId);
}

/**
 * 切换账号
 */
export async function switchAccount(accountId: string): Promise<void> {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }

    // 1. 确保 Token 有效
    const freshToken = await oauth.ensureFreshToken(account.token);
    if (freshToken.access_token !== account.token.access_token) {
        account.token = freshToken;
        storage.saveAccount(account);
    }

    // 2. 应用设备指纹
    const profileToApply = account.device_profile
        || storage.loadGlobalOriginalProfile()
        || storage.readDeviceProfile();

    if (profileToApply) {
        storage.writeDeviceProfile(profileToApply);
        console.log(`已应用设备指纹: machineId=${profileToApply.machine_id}`);
    }

    // 3. 尝试直接注入 Token（可能因数据库锁定而失败）
    let injectionSuccess = false;
    try {
        const { getDbPath, backupDb, injectToken, hasSqlite3 } = await import('./dbService.js');
        const dbPath = getDbPath();

        if (dbPath && hasSqlite3()) {
            backupDb(dbPath);
            injectToken(
                dbPath,
                account.token.access_token,
                account.token.refresh_token,
                account.token.expiry_timestamp
            );
            injectionSuccess = true;
            console.log('Token 直接注入成功！');
        }
    } catch (error) {
        console.log('Token 直接注入失败（数据库可能被锁定），将使用待处理切换方式');
        // 保存待处理切换作为备份
        storage.savePendingSwitch({
            accountId: account.id,
            accessToken: account.token.access_token,
            refreshToken: account.token.refresh_token,
            expiryTimestamp: account.token.expiry_timestamp,
            createdAt: Date.now(),
        });
    }

    // 4. 更新当前账号
    storage.setCurrentAccountId(accountId);

    account.last_used = Date.now();
    storage.saveAccount(account);

    // 5. 自动重启 IDE
    const autoRestartAction = '自动重启 IDE';
    const manualAction = '手动关闭';
    const message = injectionSuccess
        ? `✅ 已切换到账号: ${account.email}。`
        : `✅ 已切换到账号: ${account.email}。`;

    const result = await vscode.window.showInformationMessage(
        message,
        autoRestartAction,
        manualAction
    );

    if (result === autoRestartAction) {
        await autoRestartIDE();
    } else if (result === manualAction) {
        vscode.commands.executeCommand('workbench.action.quit');
    }
}
/**
 * 自动重启 IDE - 使用经过验证的计划任务方案
 */
async function autoRestartIDE(): Promise<void> {
    const { execSync } = await import('child_process');
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // 获取当前 Antigravity 运行路径
    const exePath = process.execPath;
    const taskName = 'AntigravityRestart';
    const tempDir = os.tmpdir();
    const batPath = path.join(tempDir, 'antigravity_restart.bat');
    const vbsPath = path.join(tempDir, 'antigravity_restart.vbs');

    try {
        // 1. 创建批处理脚本：等待旧进程彻底退出后再启动新进程
        const batContent = `@echo off
:wait_loop
timeout /t 2 /nobreak > nul 2>&1
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>nul | find /i "Antigravity.exe" > nul
if %errorlevel% == 0 goto wait_loop
timeout /t 2 /nobreak > nul 2>&1
start "" "${exePath}"
schtasks /delete /tn "${taskName}" /f > nul 2>&1
exit
`;
        fs.writeFileSync(batPath, batContent, 'utf8');

        // 2. 创建 VBScript：用于静默运行批处理，避免弹出 CMD 黑色窗口
        const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """${batPath.replace(/\\/g, '\\\\')}""", 0, False
`;
        fs.writeFileSync(vbsPath, vbsContent, 'utf8');

        // 3. 注册并立即触发计划任务
        // 使用 /IT 参数确保新进程以交互模式启动，否则 IDE 窗口会看不见
        try { execSync(`schtasks /delete /tn "${taskName}" /f`, { windowsHide: true, stdio: 'ignore' }); } catch { }

        execSync(`schtasks /create /tn "${taskName}" /tr "wscript.exe \\"${vbsPath}\\"" /sc once /st 00:00:00 /IT /f`, { windowsHide: true });
        execSync(`schtasks /run /tn "${taskName}"`, { windowsHide: true });

        vscode.window.showInformationMessage('IDE 即将自动重启...');

    } catch (error) {
        console.error('创建重启任务失败:', error);
        vscode.window.showErrorMessage('自动重启尝试失败，请手动重新运行。');
    }

    // 给计划任务一点启动时间，然后退出当前窗口
    setTimeout(() => {
        vscode.commands.executeCommand('workbench.action.quit');
    }, 1500);
}


/**
 * 刷新单个账号配额
 */
export async function refreshAccountQuota(accountId: string): Promise<QuotaData> {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }

    const quotaData = await quota.fetchQuotaWithRetry(account.token);

    // 更新账号配额
    account.quota = quotaData;
    storage.saveAccount(account);

    return quotaData;
}

/**
 * 刷新所有账号配额
 */
export async function refreshAllQuotas(): Promise<{ success: number; failed: number }> {
    const accounts = listAccounts();
    let success = 0;
    let failed = 0;

    for (const account of accounts) {
        if (account.disabled || account.quota?.is_forbidden) {
            continue;
        }

        try {
            await refreshAccountQuota(account.id);
            success++;
        } catch (error) {
            console.error(`刷新账号 ${account.email} 配额失败:`, error);
            failed++;
        }
    }

    return { success, failed };
}

/**
 * 获取推荐的最佳账号 (配额最高且重置时间最长)
 */
export function getBestAccount(monitoredModels: string[]): Account | null {
    const accounts = listAccounts().filter(a => !a.disabled && !a.quota?.is_forbidden);

    if (accounts.length === 0) {
        return null;
    }

    let best: Account | null = null;
    let bestScore = -1;

    for (const account of accounts) {
        if (!account.quota?.models || account.quota.models.length === 0) {
            continue;
        }

        // 找到监控模型中配额最低的
        const lowest = quota.getLowestQuotaModel(account.quota, monitoredModels);
        const minQuota = lowest?.percentage ?? 100;

        // 找到最长的重置时间（秒数）
        let maxResetSeconds = 0;
        for (const model of account.quota.models) {
            if (model.reset_time) {
                const resetTime = new Date(model.reset_time).getTime();
                const now = Date.now();
                const remainingSeconds = Math.max(0, (resetTime - now) / 1000);
                maxResetSeconds = Math.max(maxResetSeconds, remainingSeconds);
            }
        }

        // 计算综合评分：配额权重更高，重置时间作为次要因素
        // 配额: 0-100, 重置时间: 归一化到 0-50 (最多24小时 = 86400秒)
        const resetBonus = Math.min(50, (maxResetSeconds / 86400) * 50);
        const score = minQuota * 2 + resetBonus;

        console.log(`账号 ${account.email}: 最低配额=${minQuota}%, 重置时间=${Math.round(maxResetSeconds / 60)}分钟, 评分=${score.toFixed(1)}`);

        if (score > bestScore) {
            bestScore = score;
            best = account;
        }
    }

    if (best) {
        console.log(`最佳账号: ${best.email}, 评分=${bestScore.toFixed(1)}`);
    }

    return best;
}

/**
 * 检查当前账号配额并提示切换
 */
export async function checkQuotaAndPromptSwitch(threshold: number, monitoredModels: string[]): Promise<void> {
    const current = getCurrentAccount();
    if (!current) {
        return;
    }

    const check = quota.isQuotaBelowThreshold(current.quota, threshold, monitoredModels);

    if (check.isBelowThreshold) {
        const best = getBestAccount(monitoredModels);
        const modelName = check.model || '配额';

        // 构建提示信息
        let message = `⚠️ 当前账号 ${current.email.split('@')[0]} 的 ${modelName} 仅剩 ${check.percentage}%`;

        // 添加建议
        const suggestions: string[] = [];

        // 建议切换模型
        suggestions.push('建议使用 /model 命令切换到其他模型');

        // 如果有更好的账号
        if (best && best.id !== current.id) {
            const bestLowest = quota.getLowestQuotaModel(best.quota, monitoredModels);
            const bestQuotaStr = bestLowest ? `${bestLowest.percentage}%` : '未知';
            suggestions.push(`或切换到账号 ${best.email.split('@')[0]} (配额 ${bestQuotaStr})`);
        }

        message += `\n\n💡 ${suggestions.join('\n💡 ')}`;

        // 只显示提示，不执行任何操作
        vscode.window.showWarningMessage(
            `⚠️ 配额不足提醒`,
            { modal: false, detail: message } as any,
            '我知道了'
        );
    }
}


/**
 * 绑定设备指纹
 */
export function bindDeviceProfile(accountId: string, mode: 'capture' | 'generate'): DeviceProfile {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }

    let profile: DeviceProfile;

    if (mode === 'capture') {
        const current = storage.readDeviceProfile();
        if (!current) {
            throw new Error('无法读取当前设备指纹');
        }
        profile = current;
    } else {
        profile = storage.generateDeviceProfile();
    }

    // 保存为全局原始指纹
    storage.saveGlobalOriginalProfile(profile);

    // 绑定到账号
    account.device_profile = profile;

    // 针对旧数据的兼容性处理：若 device_history 不存在则初始化
    if (!account.device_history) {
        account.device_history = [];
    }

    account.device_history.push({
        id: uuidv4(),
        created_at: Date.now(),
        label: mode === 'capture' ? 'captured' : 'generated',
        profile,
        is_current: true,
    });

    // 标记之前的版本为非当前
    for (let i = 0; i < account.device_history.length - 1; i++) {
        account.device_history[i].is_current = false;
    }

    storage.saveAccount(account);

    // 应用到 storage.json
    storage.writeDeviceProfile(profile);

    return profile;
}

/**
 * 应用账号的设备指纹
 */
export function applyDeviceProfile(accountId: string): DeviceProfile {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }

    if (!account.device_profile) {
        throw new Error('该账号尚未绑定设备指纹');
    }

    storage.writeDeviceProfile(account.device_profile);

    return account.device_profile;
}

/**
 * 获取账号详情
 */
export function getAccount(accountId: string): Account | undefined {
    return storage.loadAccount(accountId) || undefined;
}

/**
 * 取消绑定设备指纹
 */
export function unbindDeviceProfile(accountId: string): void {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }

    if (!account.device_profile) {
        return;
    }

    // 针对旧数据的兼容性处理：若 device_history 不存在则初始化
    if (!account.device_history) {
        account.device_history = [];
    }

    // 标记所有历史为非 current
    for (const h of account.device_history) {
        h.is_current = false;
    }

    // 移除绑定
    account.device_profile = undefined;
    storage.saveAccount(account);

    // 如果是当前账号，尝试恢复全局原始指纹
    const currentId = storage.getCurrentAccountId();
    if (currentId === accountId) {
        const original = storage.loadGlobalOriginalProfile();
        if (original) {
            storage.writeDeviceProfile(original);
            console.log('解绑后已恢复全局原始指纹');
        }
    }
}

/**
 * 导出所有账号到 JSON 字符串
 */
export function exportAccountsToJson(): string {
    const accounts = listAccounts();
    // 导出时移除敏感信息的备份（虽然 Token 本身就是敏感的，但我们只导出必要的）
    return JSON.stringify(accounts, null, 2);
}

/**
 * 导出单个账号到 JSON 字符串
 */
export function exportAccountToJson(accountId: string): string {
    const account = storage.loadAccount(accountId);
    if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
    }
    return JSON.stringify(account, null, 2);
}

/**
 * 从 JSON 字符串导入账号
 */
export async function importAccountsFromJson(jsonString: string): Promise<{ success: number; failed: number }> {
    let data: any;
    try {
        data = JSON.parse(jsonString);
    } catch (error) {
        throw new Error('无效的 JSON 格式');
    }

    const accountsToImport: Account[] = Array.isArray(data) ? data : [data];
    let success = 0;
    let failed = 0;

    for (const acc of accountsToImport) {
        try {
            // 基本验证
            if (!acc.email || !acc.token) {
                failed++;
                continue;
            }

            // 如果导入的账号 ID 已存在，我们需要生成新 ID 还是覆盖？
            // 这里遵循原有的 addAccount 逻辑：如果 email 相同则覆盖，ID 保持原有或生成。
            // 为了保证导入后能正常使用，我们统一使用 addAccount 的逻辑。

            // 如果 acc.id 已存在但 email 不同，或者有其他冲突，addAccount 会处理。
            // 我们手动调用 storage 的存储逻辑来保留尽可能多的信息（如指纹）
            const existingIndex = storage.loadAccountIndex().accounts.find(s => s.email === acc.email);

            let finalAccount: Account;
            if (existingIndex) {
                // 覆盖现有账号，但保留 ID
                const existing = storage.loadAccount(existingIndex.id);
                finalAccount = {
                    ...acc,
                    id: existingIndex.id, // 保持本地 ID 不变
                    last_used: Date.now()
                };
            } else {
                // 新账号，如果 ID 冲突则重新生成
                const idExists = storage.loadAccount(acc.id);
                finalAccount = {
                    ...acc,
                    id: idExists ? uuidv4() : acc.id,
                    created_at: acc.created_at || Date.now(),
                    last_used: Date.now()
                };
            }

            storage.saveAccount(finalAccount);
            storage.addAccountToIndex(finalAccount);
            success++;
        } catch (error) {
            console.error('导入单个账号失败:', error);
            failed++;
        }
    }

    return { success, failed };
}
