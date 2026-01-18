/**
 * 存储服务 - 管理账号数据文件和 Antigravity storage.json
 * 与原 Antigravity Tools 共用 ~/.antigravity_tools 目录
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Account, AccountIndex, AccountSummary, DeviceProfile } from '../models/types';

// 数据目录常量 (与原项目一致)
const DATA_DIR = '.antigravity_tools';
const ACCOUNTS_INDEX = 'accounts.json';
const ACCOUNTS_DIR = 'accounts';
const GLOBAL_ORIGINAL_PROFILE = 'global_original_profile.json';

/**
 * 获取数据目录路径
 */
export function getDataDir(): string {
    const home = os.homedir();
    const dataDir = path.join(home, DATA_DIR);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    return dataDir;
}

/**
 * 获取账号目录路径
 */
export function getAccountsDir(): string {
    const dataDir = getDataDir();
    const accountsDir = path.join(dataDir, ACCOUNTS_DIR);

    if (!fs.existsSync(accountsDir)) {
        fs.mkdirSync(accountsDir, { recursive: true });
    }

    return accountsDir;
}

/**
 * 加载账号索引
 */
export function loadAccountIndex(): AccountIndex {
    const dataDir = getDataDir();
    const indexPath = path.join(dataDir, ACCOUNTS_INDEX);

    if (!fs.existsSync(indexPath)) {
        return { accounts: [], current_account_id: undefined };
    }

    try {
        const content = fs.readFileSync(indexPath, 'utf-8');
        return JSON.parse(content) as AccountIndex;
    } catch (error) {
        console.error('加载账号索引失败:', error);
        return { accounts: [], current_account_id: undefined };
    }
}

/**
 * 保存账号索引 (原子写入)
 */
export function saveAccountIndex(index: AccountIndex): void {
    const dataDir = getDataDir();
    const indexPath = path.join(dataDir, ACCOUNTS_INDEX);
    const tempPath = path.join(dataDir, `${ACCOUNTS_INDEX}.tmp`);

    const content = JSON.stringify(index, null, 2);

    // 写入临时文件
    fs.writeFileSync(tempPath, content, 'utf-8');

    // 原子重命名
    fs.renameSync(tempPath, indexPath);
}

/**
 * 加载单个账号数据
 */
export function loadAccount(accountId: string): Account | null {
    const accountsDir = getAccountsDir();
    const accountPath = path.join(accountsDir, `${accountId}.json`);

    if (!fs.existsSync(accountPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(accountPath, 'utf-8');
        return JSON.parse(content) as Account;
    } catch (error) {
        console.error(`加载账号 ${accountId} 失败:`, error);
        return null;
    }
}

/**
 * 保存单个账号数据
 */
export function saveAccount(account: Account): void {
    const accountsDir = getAccountsDir();
    const accountPath = path.join(accountsDir, `${account.id}.json`);

    const content = JSON.stringify(account, null, 2);
    fs.writeFileSync(accountPath, content, 'utf-8');
}

/**
 * 删除账号
 */
export function deleteAccount(accountId: string): void {
    const accountsDir = getAccountsDir();
    const accountPath = path.join(accountsDir, `${accountId}.json`);

    if (fs.existsSync(accountPath)) {
        fs.unlinkSync(accountPath);
    }
}

/**
 * 加载所有账号
 */
export function loadAllAccounts(): Account[] {
    const index = loadAccountIndex();
    const accounts: Account[] = [];

    for (const summary of index.accounts) {
        const account = loadAccount(summary.id);
        if (account) {
            accounts.push(account);
        }
    }

    return accounts;
}

/**
 * 获取当前账号 ID
 */
export function getCurrentAccountId(): string | undefined {
    const index = loadAccountIndex();
    return index.current_account_id;
}

/**
 * 设置当前账号 ID
 */
export function setCurrentAccountId(accountId: string): void {
    const index = loadAccountIndex();
    index.current_account_id = accountId;
    saveAccountIndex(index);
}

/**
 * 添加账号到索引
 */
export function addAccountToIndex(account: Account): void {
    const index = loadAccountIndex();

    // 检查是否已存在
    const existingIndex = index.accounts.findIndex(s => s.email === account.email);

    const summary: AccountSummary = {
        id: account.id,
        email: account.email,
        name: account.name,
        created_at: account.created_at,
        last_used: account.last_used,
    };

    if (existingIndex >= 0) {
        index.accounts[existingIndex] = summary;
    } else {
        index.accounts.push(summary);
    }

    // 如果是第一个账号，设为当前账号
    if (!index.current_account_id) {
        index.current_account_id = account.id;
    }

    saveAccountIndex(index);
}

// ==================== Antigravity storage.json 操作 ====================

/**
 * 获取 Antigravity storage.json 路径
 */
export function getAntigravityStoragePath(): string {
    const home = os.homedir();

    // 根据操作系统选择路径
    if (process.platform === 'darwin') {
        // macOS
        return path.join(home, 'Library', 'Application Support', 'Antigravity', 'User', 'globalStorage', 'storage.json');
    } else if (process.platform === 'win32') {
        // Windows
        return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Antigravity', 'User', 'globalStorage', 'storage.json');
    } else {
        // Linux
        return path.join(home, '.config', 'Antigravity', 'User', 'globalStorage', 'storage.json');
    }
}

/**
 * 读取设备指纹
 */
export function readDeviceProfile(): DeviceProfile | null {
    const storagePath = getAntigravityStoragePath();

    if (!fs.existsSync(storagePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(storagePath, 'utf-8');
        const storage = JSON.parse(content);

        return {
            machine_id: storage['telemetry.machineId'] || '',
            mac_machine_id: storage['telemetry.macMachineId'] || '',
            dev_device_id: storage['telemetry.devDeviceId'] || '',
            sqm_id: storage['telemetry.sqmId'] || '',
        };
    } catch (error) {
        console.error('读取设备指纹失败:', error);
        return null;
    }
}

/**
 * 写入设备指纹
 */
export function writeDeviceProfile(profile: DeviceProfile): void {
    const storagePath = getAntigravityStoragePath();
    const storageDir = path.dirname(storagePath);

    // 确保目录存在
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }

    // 读取现有内容
    let storage: Record<string, unknown> = {};
    if (fs.existsSync(storagePath)) {
        try {
            const content = fs.readFileSync(storagePath, 'utf-8');
            storage = JSON.parse(content);
        } catch {
            // 忽略解析错误，使用空对象
        }
    }

    // 更新设备指纹
    storage['telemetry.machineId'] = profile.machine_id;
    storage['telemetry.macMachineId'] = profile.mac_machine_id;
    storage['telemetry.devDeviceId'] = profile.dev_device_id;
    storage['telemetry.sqmId'] = profile.sqm_id;

    // 写入文件
    const content = JSON.stringify(storage, null, 2);
    fs.writeFileSync(storagePath, content, 'utf-8');
}

/**
 * 加载全局原始设备指纹
 */
export function loadGlobalOriginalProfile(): DeviceProfile | null {
    const dataDir = getDataDir();
    const profilePath = path.join(dataDir, GLOBAL_ORIGINAL_PROFILE);

    if (!fs.existsSync(profilePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(profilePath, 'utf-8');
        return JSON.parse(content) as DeviceProfile;
    } catch (error) {
        console.error('加载全局原始指纹失败:', error);
        return null;
    }
}

/**
 * 保存全局原始设备指纹
 */
export function saveGlobalOriginalProfile(profile: DeviceProfile): void {
    const dataDir = getDataDir();
    const profilePath = path.join(dataDir, GLOBAL_ORIGINAL_PROFILE);

    const content = JSON.stringify(profile, null, 2);
    fs.writeFileSync(profilePath, content, 'utf-8');
}

/**
 * 生成随机设备指纹
 */
export function generateDeviceProfile(): DeviceProfile {
    const crypto = require('crypto');
    const uuidv4 = () => crypto.randomUUID();

    return {
        machine_id: uuidv4().replace(/-/g, ''),
        mac_machine_id: uuidv4().replace(/-/g, ''),
        dev_device_id: uuidv4(),
        sqm_id: `{${uuidv4().toUpperCase()}}`,
    };
}

// ==================== 待处理切换 ====================

const PENDING_SWITCH_FILE = 'pending_switch.json';

/**
 * 待处理切换数据
 */
export interface PendingSwitch {
    accountId: string;
    accessToken: string;
    refreshToken: string;
    expiryTimestamp: number;
    createdAt: number;
}

/**
 * 保存待处理切换
 */
export function savePendingSwitch(data: PendingSwitch): void {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, PENDING_SWITCH_FILE);
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 加载待处理切换
 */
export function loadPendingSwitch(): PendingSwitch | null {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, PENDING_SWITCH_FILE);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as PendingSwitch;
    } catch {
        return null;
    }
}

/**
 * 清除待处理切换
 */
export function clearPendingSwitch(): void {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, PENDING_SWITCH_FILE);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

