/**
 * Antigravity Auth Switch - 类型定义
 * 与原 Antigravity Tools 保持兼容
 */

// ==================== 账号相关 ====================

/**
 * Token 数据
 */
export interface TokenData {
    access_token: string;
    refresh_token: string;
    expiry_timestamp: number;
    email?: string;
    project_id?: string;
    session_id?: string;
}

/**
 * 设备指纹
 */
export interface DeviceProfile {
    machine_id: string;
    mac_machine_id: string;
    dev_device_id: string;
    sqm_id: string;
}

/**
 * 设备指纹版本记录
 */
export interface DeviceProfileVersion {
    id: string;
    created_at: number;
    label: string;
    profile: DeviceProfile;
    is_current: boolean;
}

/**
 * 配额模型数据
 */
export interface QuotaModel {
    name: string;
    percentage: number;
    reset_time: string;
}

/**
 * 配额数据
 */
export interface QuotaData {
    models: QuotaModel[];
    last_updated: number;
    is_forbidden?: boolean;
    subscription_tier?: string;
}

/**
 * 账号数据 (与原 Antigravity Tools 兼容)
 */
export interface Account {
    id: string;
    email: string;
    name?: string;
    token: TokenData;
    quota?: QuotaData;
    created_at: number;
    last_used?: number;
    disabled?: boolean;
    disabled_reason?: string;
    disabled_at?: number;
    device_profile?: DeviceProfile;
    device_history: DeviceProfileVersion[];
    proxy_disabled?: boolean;
    proxy_disabled_reason?: string;
    proxy_disabled_at?: number;
}

/**
 * 账号摘要 (索引文件)
 */
export interface AccountSummary {
    id: string;
    email: string;
    name?: string;
    created_at: number;
    last_used?: number;
}

/**
 * 账号索引
 */
export interface AccountIndex {
    accounts: AccountSummary[];
    current_account_id?: string;
}

// ==================== OAuth 相关 ====================

/**
 * OAuth Token 响应
 */
export interface OAuthTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
}

/**
 * Google 用户信息
 */
export interface GoogleUserInfo {
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

// ==================== 配额 API 相关 ====================

/**
 * 配额 API 响应中的模型信息
 */
export interface QuotaModelInfo {
    quotaInfo?: {
        remainingFraction?: number;
        resetTime?: string;
    };
}

/**
 * 配额 API 响应
 */
export interface QuotaApiResponse {
    models: Record<string, QuotaModelInfo>;
}

/**
 * Load Code Assist 响应
 */
export interface LoadCodeAssistResponse {
    cloudaicompanionProject?: string;
    currentTier?: {
        id?: string;
        quotaTier?: string;
        name?: string;
    };
    paidTier?: {
        id?: string;
        quotaTier?: string;
        name?: string;
    };
}

// ==================== 配置相关 ====================

/**
 * 扩展配置
 */
export interface ExtensionConfig {
    quotaThreshold: number;
    autoCheckInterval: number;
    monitoredModels: string[];
    enableAutoSwitch: boolean;
    showStatusBarItem: boolean;
}

// ==================== 事件相关 ====================

/**
 * 配额警告事件
 */
export interface QuotaWarningEvent {
    account: Account;
    model: string;
    percentage: number;
    threshold: number;
}

/**
 * 账号切换事件
 */
export interface AccountSwitchEvent {
    from?: Account;
    to: Account;
    reason: 'manual' | 'auto' | 'quota_low';
}
