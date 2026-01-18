/**
 * 配额服务 - 查询 Google Cloud Code API 配额
 */

import * as https from 'https';
import type { QuotaData, QuotaApiResponse, LoadCodeAssistResponse, TokenData, QuotaModel } from '../models/types';

// API 端点
const QUOTA_API_URL = 'https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels';
const LOAD_CODE_ASSIST_URL = 'https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist';

/**
 * 发送 HTTPS 请求
 */
function httpsRequest<T>(
    urlString: string,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<T> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(urlString);

        const requestOptions: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'antigravity-auth-switch/1.0.0',
                ...options.headers,
            },
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 403) {
                    // 特殊处理 403
                    resolve({ __forbidden: true } as unknown as T);
                } else if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data) as T);
                    } catch {
                        reject(new Error(`JSON 解析失败: ${data}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

/**
 * 获取项目 ID 和订阅类型
 */
async function fetchProjectId(accessToken: string): Promise<{ projectId?: string; subscriptionTier?: string }> {
    try {
        const data = await httpsRequest<LoadCodeAssistResponse>(LOAD_CODE_ASSIST_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'antigravity/windows/amd64',
            },
            body: JSON.stringify({ metadata: { ideType: 'ANTIGRAVITY' } }),
        });

        const projectId = data.cloudaicompanionProject;
        const subscriptionTier = data.paidTier?.id || data.currentTier?.id;
        return { projectId, subscriptionTier };
    } catch (error) {
        console.error('获取项目 ID 失败:', error);
        return {};
    }
}

/**
 * 查询账号配额
 */
export async function fetchQuota(accessToken: string, cachedProjectId?: string): Promise<QuotaData> {
    // 获取或使用缓存的项目 ID
    let projectId = cachedProjectId;
    let subscriptionTier: string | undefined;

    if (!projectId) {
        const result = await fetchProjectId(accessToken);
        projectId = result.projectId;
        subscriptionTier = result.subscriptionTier;
    }

    // 使用默认项目 ID 作为后备
    const finalProjectId = projectId || 'bamboo-precept-lgxtn';

    // 查询配额
    const data = await httpsRequest<QuotaApiResponse & { __forbidden?: boolean }>(QUOTA_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ project: finalProjectId }),
    });

    if ((data as { __forbidden?: boolean }).__forbidden) {
        // 账号被禁止
        return {
            models: [],
            last_updated: Date.now(),
            is_forbidden: true,
            subscription_tier: subscriptionTier,
        };
    }

    const models: QuotaModel[] = [];

    if (data.models) {
        for (const [name, info] of Object.entries(data.models)) {
            if (info.quotaInfo) {
                const percentage = info.quotaInfo.remainingFraction !== undefined
                    ? Math.round(info.quotaInfo.remainingFraction * 100)
                    : 0;
                const resetTime = info.quotaInfo.resetTime || '';

                // 只保存我们关心的模型
                if (name.includes('gemini') || name.includes('claude')) {
                    models.push({ name, percentage, reset_time: resetTime });
                }
            }
        }
    }

    return {
        models,
        last_updated: Date.now(),
        is_forbidden: false,
        subscription_tier: subscriptionTier,
    };
}

/**
 * 获取指定模型的配额百分比
 */
export function getModelQuotaPercentage(quota: QuotaData | undefined, modelName: string): number | undefined {
    if (!quota || !quota.models) {
        return undefined;
    }

    const model = quota.models.find(m => m.name === modelName || m.name.includes(modelName));
    return model?.percentage;
}

/**
 * 获取最低配额的模型
 */
export function getLowestQuotaModel(quota: QuotaData | undefined, monitoredModels: string[]): { name: string; percentage: number } | undefined {
    if (!quota || !quota.models || quota.models.length === 0) {
        return undefined;
    }

    let lowest: { name: string; percentage: number } | undefined;

    for (const model of quota.models) {
        // 检查是否在监控列表中
        const isMonitored = monitoredModels.some(m => model.name.includes(m) || m.includes(model.name));
        if (!isMonitored) {
            continue;
        }

        if (!lowest || model.percentage < lowest.percentage) {
            lowest = { name: model.name, percentage: model.percentage };
        }
    }

    return lowest;
}

/**
 * 检查配额是否低于阈值
 */
export function isQuotaBelowThreshold(quota: QuotaData | undefined, threshold: number, monitoredModels: string[]): { isBelowThreshold: boolean; model?: string; percentage?: number } {
    const lowest = getLowestQuotaModel(quota, monitoredModels);

    if (!lowest) {
        return { isBelowThreshold: false };
    }

    if (lowest.percentage < threshold) {
        return { isBelowThreshold: true, model: lowest.name, percentage: lowest.percentage };
    }

    return { isBelowThreshold: false };
}

/**
 * 带重试的配额查询
 */
export async function fetchQuotaWithRetry(token: TokenData, maxRetries: number = 3): Promise<QuotaData> {
    const { ensureFreshToken } = await import('./oauthService.js');

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // 确保 Token 有效
            const freshToken = await ensureFreshToken(token);

            // 查询配额
            const quota = await fetchQuota(freshToken.access_token, token.project_id);

            return quota;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`配额查询失败 (尝试 ${attempt}/${maxRetries}):`, lastError.message);

            if (attempt < maxRetries) {
                // 等待后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('配额查询失败');
}
