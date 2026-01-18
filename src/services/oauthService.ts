/**
 * OAuth 服务 - 处理 Google OAuth 登录流程
 */

import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import type { OAuthTokenResponse, GoogleUserInfo, TokenData } from '../models/types';

// Google OAuth 配置 (与原 Antigravity Tools 完全一致)
const GOOGLE_CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// 与原项目保持一致的 Scopes
const SCOPES = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/cclog',
    'https://www.googleapis.com/auth/experimentsandconfigs',
].join(' ');

// OAuth 回调服务器端口范围
const PORT_RANGE_START = 58700;
const PORT_RANGE_END = 58799;

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
            headers: options.headers || {},
        };

        const req = https.request(requestOptions, (res) => {
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
 * 查找可用端口
 */
async function findAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const tryPort = (port: number) => {
            const server = http.createServer();
            server.listen(port, '127.0.0.1', () => {
                server.close(() => resolve(port));
            });
            server.on('error', () => {
                if (port < PORT_RANGE_END) {
                    tryPort(port + 1);
                } else {
                    reject(new Error('无法找到可用端口'));
                }
            });
        };

        tryPort(PORT_RANGE_START);
    });
}

/**
 * 启动 OAuth 登录流程
 */
export async function startOAuthLogin(): Promise<TokenData> {
    const port = await findAvailablePort();
    const redirectUri = `http://127.0.0.1:${port}/callback`;

    // 生成 state 参数用于安全验证
    const state = Math.random().toString(36).substring(2, 15);

    // 构建授权 URL
    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    // 显示授权链接
    const copyAction = '复制链接';
    const openAction = '打开浏览器';

    const result = await vscode.window.showInformationMessage(
        '请在浏览器中完成 Google 账号授权',
        { modal: true, detail: `授权链接已准备就绪，点击下方按钮继续` },
        copyAction,
        openAction
    );

    if (result === copyAction) {
        await vscode.env.clipboard.writeText(authUrl.toString());
        vscode.window.showInformationMessage('授权链接已复制到剪贴板');
    } else if (result === openAction) {
        await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));
    } else {
        throw new Error('用户取消了授权');
    }

    // 启动回调服务器等待授权码
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url || '', true);

            if (parsedUrl.pathname === '/callback') {
                const code = parsedUrl.query.code as string;
                const returnedState = parsedUrl.query.state as string;
                const error = parsedUrl.query.error as string;

                if (error) {
                    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html>
                        <head><title>授权失败</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                            <h1>❌ 授权失败</h1>
                            <p>错误: ${error}</p>
                            <p>请关闭此页面并重试。</p>
                        </body>
                        </html>
                    `);
                    server.close();
                    reject(new Error(`OAuth 错误: ${error}`));
                    return;
                }

                if (returnedState !== state) {
                    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html>
                        <head><title>安全验证失败</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                            <h1>❌ 安全验证失败</h1>
                            <p>State 参数不匹配，可能存在安全风险。</p>
                        </body>
                        </html>
                    `);
                    server.close();
                    reject(new Error('State 参数不匹配'));
                    return;
                }

                if (!code) {
                    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html>
                        <head><title>缺少授权码</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                            <h1>❌ 缺少授权码</h1>
                            <p>未收到有效的授权码。</p>
                        </body>
                        </html>
                    `);
                    server.close();
                    reject(new Error('缺少授权码'));
                    return;
                }

                try {
                    // 交换授权码获取 Token
                    const tokenData = await exchangeCodeForToken(code, redirectUri);

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html>
                        <head><title>授权成功</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                            <h1>✅ 授权成功!</h1>
                            <p>账号已成功添加到 Anti-tools。</p>
                            <p>您可以关闭此页面了。</p>
                        </body>
                        </html>
                    `);
                    server.close();
                    resolve(tokenData);
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html>
                        <head><title>Token 交换失败</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                            <h1>❌ Token 交换失败</h1>
                            <p>${err instanceof Error ? err.message : String(err)}</p>
                        </body>
                        </html>
                    `);
                    server.close();
                    reject(err);
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });

        server.listen(port, '127.0.0.1', () => {
            console.log(`OAuth 回调服务器已启动于端口 ${port}`);
        });

        // 2 分钟超时
        setTimeout(() => {
            server.close();
            reject(new Error('OAuth 授权超时 (2分钟)'));
        }, 120000);
    });
}

/**
 * 交换授权码获取 Token
 */
async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenData> {
    const body = new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    }).toString();

    const tokenResponse = await httpsRequest<OAuthTokenResponse>(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!tokenResponse.refresh_token) {
        throw new Error('未获取到 Refresh Token，请确保使用 access_type=offline 和 prompt=consent');
    }

    // 获取用户信息
    const userInfo = await getUserInfo(tokenResponse.access_token);

    const expiryTimestamp = Date.now() + tokenResponse.expires_in * 1000;

    return {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expiry_timestamp: expiryTimestamp,
        email: userInfo.email,
    };
}

/**
 * 获取用户信息
 */
export async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    return httpsRequest<GoogleUserInfo>(GOOGLE_USERINFO_URL, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
}

/**
 * 刷新 Access Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const body = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    }).toString();

    try {
        return await httpsRequest<OAuthTokenResponse>(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('invalid_grant')) {
            throw new Error('invalid_grant: Refresh Token 已失效，请重新登录');
        }
        throw new Error(`刷新 Token 失败: ${errorMessage}`);
    }
}

/**
 * 确保 Token 有效 (自动刷新)
 */
export async function ensureFreshToken(token: TokenData): Promise<TokenData> {
    // 检查是否需要刷新 (提前 5 分钟刷新)
    const now = Date.now();
    const expiryBuffer = 5 * 60 * 1000; // 5 分钟

    if (token.expiry_timestamp - now > expiryBuffer) {
        // Token 仍然有效
        return token;
    }

    // 刷新 Token
    console.log('Token 即将过期，正在刷新...');
    const newTokenResponse = await refreshAccessToken(token.refresh_token);

    return {
        ...token,
        access_token: newTokenResponse.access_token,
        expiry_timestamp: Date.now() + newTokenResponse.expires_in * 1000,
    };
}
