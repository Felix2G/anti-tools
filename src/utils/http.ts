/**
 * HTTP 工具函数
 */

import * as https from 'https';
import * as http from 'http';

/**
 * 发送 HTTP 请求 (使用原生 Node.js)
 */
export async function request<T>(
    url: string,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<T> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const lib = isHttps ? https : http;

        const requestOptions: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'antigravity-auth-switch/1.0.0',
                ...options.headers,
            },
        };

        const req = lib.request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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
 * 发送带有 Bearer Token 的请求
 */
export async function requestWithAuth<T>(
    url: string,
    accessToken: string,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<T> {
    return request<T>(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

/**
 * POST 请求
 */
export async function post<T>(
    url: string,
    body: unknown,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<T> {
    return request<T>(url, {
        ...options,
        method: 'POST',
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

/**
 * 带认证的 POST 请求
 */
export async function postWithAuth<T>(
    url: string,
    accessToken: string,
    body: unknown,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<T> {
    return requestWithAuth<T>(url, accessToken, {
        ...options,
        method: 'POST',
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

/**
 * 发送 URL 编码的 POST 请求
 */
export async function postForm<T>(
    url: string,
    formData: Record<string, string>,
    options: {
        headers?: Record<string, string>;
    } = {}
): Promise<T> {
    const body = new URLSearchParams(formData).toString();

    return request<T>(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options.headers,
        },
        body,
    });
}
