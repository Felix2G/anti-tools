/**
 * 数据库服务 - 注入 Token 到 Antigravity state.vscdb
 * 使用 Node.js 内置功能直接操作 SQLite 文件
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

// ==================== Protobuf 工具函数 ====================

/**
 * Protobuf Varint 编码
 */
function encodeVarint(value: number): Buffer {
    const bytes: number[] = [];
    let v = value >>> 0; // 确保为无符号整数
    while (v >= 0x80) {
        bytes.push((v & 0x7F) | 0x80);
        v >>>= 7;
    }
    bytes.push(v);
    return Buffer.from(bytes);
}

/**
 * 读取 Protobuf Varint
 */
function readVarint(data: Buffer, offset: number): { value: number; newOffset: number } {
    let result = 0;
    let shift = 0;
    let pos = offset;

    while (pos < data.length) {
        const byte = data[pos];
        result |= (byte & 0x7F) << shift;
        pos++;
        if ((byte & 0x80) === 0) {
            break;
        }
        shift += 7;
        if (shift >= 35) {
            throw new Error('Varint 过长');
        }
    }

    return { value: result >>> 0, newOffset: pos };
}

/**
 * 跳过 Protobuf 字段
 */
function skipField(data: Buffer, offset: number, wireType: number): number {
    switch (wireType) {
        case 0: // Varint
            return readVarint(data, offset).newOffset;
        case 1: // 64-bit
            return offset + 8;
        case 2: // Length-delimited
            const { value: length, newOffset: contentOffset } = readVarint(data, offset);
            return contentOffset + length;
        case 5: // 32-bit
            return offset + 4;
        default:
            throw new Error(`未知 wireType: ${wireType}`);
    }
}

/**
 * 移除指定的 Protobuf 字段
 */
function removeField(data: Buffer, fieldNum: number): Buffer {
    const result: Buffer[] = [];
    let offset = 0;

    while (offset < data.length) {
        const startOffset = offset;
        const { value: tag, newOffset } = readVarint(data, offset);
        const wireType = tag & 7;
        const currentField = tag >>> 3;

        if (currentField === fieldNum) {
            // 跳过此字段
            offset = skipField(data, newOffset, wireType);
        } else {
            // 保留其他字段
            const nextOffset = skipField(data, newOffset, wireType);
            result.push(data.subarray(startOffset, nextOffset));
            offset = nextOffset;
        }
    }

    return Buffer.concat(result);
}

/**
 * 创建 OAuthTokenInfo (Field 6)
 */
function createOAuthField(accessToken: string, refreshToken: string, expiry: number): Buffer {
    // Field 1: access_token (string, wire_type = 2)
    const tag1 = (1 << 3) | 2;
    const field1 = Buffer.concat([
        encodeVarint(tag1),
        encodeVarint(accessToken.length),
        Buffer.from(accessToken),
    ]);

    // Field 2: token_type (string, fixed value "Bearer", wire_type = 2)
    const tag2 = (2 << 3) | 2;
    const tokenType = 'Bearer';
    const field2 = Buffer.concat([
        encodeVarint(tag2),
        encodeVarint(tokenType.length),
        Buffer.from(tokenType),
    ]);

    // Field 3: refresh_token (string, wire_type = 2)
    const tag3 = (3 << 3) | 2;
    const field3 = Buffer.concat([
        encodeVarint(tag3),
        encodeVarint(refreshToken.length),
        Buffer.from(refreshToken),
    ]);

    // Field 4: expiry (嵌套的 Timestamp 消息, wire_type = 2)
    const timestampTag = (1 << 3) | 0; // Field 1, varint
    const expirySeconds = Math.floor(expiry / 1000); // 转换为秒
    const timestampMsg = Buffer.concat([
        encodeVarint(timestampTag),
        encodeVarint(expirySeconds),
    ]);

    const tag4 = (4 << 3) | 2; // Field 4, length-delimited
    const field4 = Buffer.concat([
        encodeVarint(tag4),
        encodeVarint(timestampMsg.length),
        timestampMsg,
    ]);

    // 合并所有字段为 OAuthTokenInfo 消息
    const oauthInfo = Buffer.concat([field1, field2, field3, field4]);

    // 包装为 Field 6 (length-delimited)
    const tag6 = (6 << 3) | 2;
    return Buffer.concat([
        encodeVarint(tag6),
        encodeVarint(oauthInfo.length),
        oauthInfo,
    ]);
}

// ==================== 数据库操作 ====================

/**
 * 获取 Antigravity state.vscdb 路径
 */
export function getDbPath(): string | null {
    const home = os.homedir();
    let dbPath: string;

    if (process.platform === 'darwin') {
        dbPath = path.join(home, 'Library', 'Application Support', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');
    } else if (process.platform === 'win32') {
        const appdata = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
        dbPath = path.join(appdata, 'Antigravity', 'User', 'globalStorage', 'state.vscdb');
    } else {
        dbPath = path.join(home, '.config', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');
    }

    if (fs.existsSync(dbPath)) {
        return dbPath;
    }

    return null;
}

/**
 * 使用 sqlite3 命令行工具操作数据库（通过临时文件）
 * 这避免了命令行参数长度限制
 */
function executeSqlFile(dbPath: string, sqlContent: string): string {
    // 创建临时 SQL 文件
    const tempDir = os.tmpdir();
    const tempSqlFile = path.join(tempDir, `antigravity_${Date.now()}.sql`);

    try {
        // 写入 SQL 到临时文件
        fs.writeFileSync(tempSqlFile, sqlContent, 'utf-8');

        // 执行 SQL 文件
        const sqlite3Cmd = 'sqlite3';
        const result = execSync(`${sqlite3Cmd} "${dbPath}" < "${tempSqlFile}"`, {
            encoding: 'utf-8',
            timeout: 30000,
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        });
        return result.trim();
    } finally {
        // 清理临时文件
        try {
            if (fs.existsSync(tempSqlFile)) {
                fs.unlinkSync(tempSqlFile);
            }
        } catch {
            // 忽略清理错误
        }
    }
}

/**
 * 读取数据库值
 */
function readDbValue(dbPath: string, key: string): string {
    const tempDir = os.tmpdir();
    const tempSqlFile = path.join(tempDir, `antigravity_read_${Date.now()}.sql`);

    try {
        const sql = `SELECT value FROM ItemTable WHERE key = '${key}';`;
        fs.writeFileSync(tempSqlFile, sql, 'utf-8');

        const sqlite3Cmd = 'sqlite3';
        // 使用 .read 命令或直接从标准输入
        const result = execSync(`${sqlite3Cmd} "${dbPath}" ".read ${tempSqlFile.replace(/\\/g, '/')}"`, {
            encoding: 'utf-8',
            timeout: 10000,
        });
        return result.trim();
    } catch (error) {
        // 备用方案：直接执行
        try {
            const sql = `SELECT value FROM ItemTable WHERE key = '${key}';`;
            const result = execSync(`sqlite3 "${dbPath}" "${sql}"`, {
                encoding: 'utf-8',
                timeout: 10000,
            });
            return result.trim();
        } catch (e2) {
            throw new Error(`读取数据库失败: ${e2 instanceof Error ? e2.message : String(e2)}`);
        }
    } finally {
        try {
            if (fs.existsSync(tempSqlFile)) {
                fs.unlinkSync(tempSqlFile);
            }
        } catch {
            // 忽略
        }
    }
}

/**
 * 检查系统是否有 sqlite3 命令
 */
export function hasSqlite3(): boolean {
    try {
        const cmd = process.platform === 'win32' ? 'where sqlite3' : 'which sqlite3';
        execSync(cmd, { encoding: 'utf-8' });
        return true;
    } catch {
        return false;
    }
}

/**
 * 注入 Token 到数据库
 */
export function injectToken(
    dbPath: string,
    accessToken: string,
    refreshToken: string,
    expiryTimestamp: number
): void {
    // 检查 sqlite3 命令是否可用
    if (!hasSqlite3()) {
        throw new Error('未找到 sqlite3 命令行工具，请安装 SQLite3 或使用原 Antigravity Tools 进行账号切换');
    }

    // 1. 读取当前数据
    const currentData = readDbValue(dbPath, 'jetskiStateSync.agentManagerInitState');

    if (!currentData) {
        throw new Error('未找到 agentManagerInitState 数据，请确保至少登录过一次 Antigravity');
    }

    // 2. Base64 解码
    const blob = Buffer.from(currentData, 'base64');

    // 3. 移除旧 Field 6
    const cleanData = removeField(blob, 6);

    // 4. 创建新 Field 6
    const newField = createOAuthField(accessToken, refreshToken, expiryTimestamp);

    // 5. 合并数据
    const finalData = Buffer.concat([cleanData, newField]);
    const finalB64 = finalData.toString('base64');

    // 6. 创建 SQL 语句并通过临时文件执行
    const escapedValue = finalB64.replace(/'/g, "''");
    const updateSql = `UPDATE ItemTable SET value = '${escapedValue}' WHERE key = 'jetskiStateSync.agentManagerInitState';
INSERT OR REPLACE INTO ItemTable (key, value) VALUES ('antigravityOnboarding', 'true');`;

    // 写入临时文件并执行
    const tempDir = os.tmpdir();
    const tempSqlFile = path.join(tempDir, `antigravity_inject_${Date.now()}.sql`);

    try {
        fs.writeFileSync(tempSqlFile, updateSql, 'utf-8');

        // 使用 .read 命令执行 SQL 文件
        execSync(`sqlite3 "${dbPath}" ".read '${tempSqlFile.replace(/\\/g, '/')}'"`, {
            encoding: 'utf-8',
            timeout: 30000,
        });

        console.log('Token 注入成功！');
    } finally {
        try {
            if (fs.existsSync(tempSqlFile)) {
                fs.unlinkSync(tempSqlFile);
            }
        } catch {
            // 忽略清理错误
        }
    }
}

/**
 * 备份数据库
 */
export function backupDb(dbPath: string): string {
    const backupPath = dbPath + '.backup';
    fs.copyFileSync(dbPath, backupPath);
    return backupPath;
}
