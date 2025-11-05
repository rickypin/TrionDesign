/**
 * Default Scenario - Dimension Analysis Data
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const defaultTransType: TransTypeData[] = [
  // Normal Purchase: 主要影响因素，GC 导致成功率从 99.5% 暴跌到 7.5%
  // 客户端重试导致交易量从 2457 翻倍到 4914，占总交易量的 75%
  {
    type: "Normal Purchase",
    cnt: 4914,
    previousCnt: 2457,
    resp: 92.5,           // 失败率 92.5%
    previousSucc: 99.5,   // 基线成功率
    time: 125000,         // GC 导致响应时间暴增
    succ: 7.5,            // 成功率暴跌到 7.5%
    impact: 92.8,         // 占总失败的 92.8%
    outlierness: 98.5     // 异常程度极高
  },
  // Pre-authorization: 成功率从 99.3% 下降到 8.2%，交易量从 420 增加到 720（重试）
  {
    type: "Pre-authorization",
    cnt: 720,
    previousCnt: 420,
    resp: 91.8,
    previousSucc: 99.3,
    time: 118000,
    succ: 8.2,
    impact: 4.8,
    outlierness: 95.2
  },
  // Cash Advance: 成功率从 99.4% 下降到 9.5%，交易量从 280 增加到 485（重试）
  {
    type: "Cash Advance",
    cnt: 485,
    previousCnt: 280,
    resp: 90.5,
    previousSucc: 99.4,
    time: 115000,
    succ: 9.5,
    impact: 1.8,
    outlierness: 92.8
  },
  // Pre-auth Completion: 成功率从 99.2% 下降到 12.0%，交易量从 95 增加到 155（重试）
  {
    type: "Pre-auth Completion",
    cnt: 155,
    previousCnt: 95,
    resp: 88.0,
    previousSucc: 99.2,
    time: 108000,
    succ: 12.0,
    impact: 0.4,
    outlierness: 88.5
  },
  // Merchandise Return: 成功率从 99.1% 下降到 15.5%，交易量从 38 增加到 62（重试）
  {
    type: "Merchandise Return",
    cnt: 62,
    previousCnt: 38,
    resp: 84.5,
    previousSucc: 99.1,
    time: 102000,
    succ: 15.5,
    impact: 0.2,
    outlierness: 85.2
  },
];

export const defaultClients: ClientData[] = [
  // Client 1: 成功率从 99.2% 下降到 7.5%，交易量从 1645 增加到 3168（重试）
  {
    ip: "10.10.24.204",
    cnt: 3168,
    previousCnt: 1645,
    resp: 92.5,
    previousSucc: 99.2,
    time: 122000,
    succ: 7.5,
    impact: 50.5,
    outlierness: 97.8
  },
  // Client 2: 成功率从 99.2% 下降到 8.1%，交易量从 1645 增加到 3168（重试）
  {
    ip: "10.10.24.206",
    cnt: 3168,
    previousCnt: 1645,
    resp: 91.9,
    previousSucc: 99.2,
    time: 120000,
    succ: 8.1,
    impact: 49.5,
    outlierness: 97.2
  },
];

export const defaultServers: ServerData[] = [
  // Server 1: 成功率从 99.2% 下降到 7.2%，交易量从 1645 增加到 3168（重试）
  // 这台服务器的 GC 问题最严重
  {
    ip: "10.10.16.30",
    cnt: 3168,
    previousCnt: 1645,
    resp: 92.8,
    previousSucc: 99.2,
    time: 125000,
    succ: 7.2,
    impact: 51.2,
    outlierness: 98.2
  },
  // Server 2: 成功率从 99.2% 下降到 8.4%，交易量从 1645 增加到 3168（重试）
  {
    ip: "10.10.16.31",
    cnt: 3168,
    previousCnt: 1645,
    resp: 91.6,
    previousSucc: 99.2,
    time: 118000,
    succ: 8.4,
    impact: 48.8,
    outlierness: 97.5
  },
];

export const defaultChannels: ChannelData[] = [
  // 总交易量: 6336，基线: 3290
  {
    channel: "null",
    cnt: 6336,
    previousCnt: 3290,
    resp: 92.2,
    previousSucc: 99.2,
    time: 121000,
    succ: 7.8,
    impact: 100
  },
];

export const defaultReturnCodes: ReturnCodeData[] = [
  // 保留 5 行 Return Code，去掉 null
  // 基线: 3290 笔交易，99.2% 成功率（3264 成功，26 失败）
  // 故障: 6336 笔交易，7.8% 成功率（494 成功，5842 失败）
  // 使用 ISO 8583 协议返回码，格式：(代码) 消息名称

  // 00: Approved - 成功交易
  {
    code: "(00) Approved",
    cnt: 494,           // 故障时的成功交易
    previousCnt: 3264,  // 基线时的成功交易（3290 * 99.2%）
    resp: 100.0,        // 有响应
    previousSucc: 100.0, // 基线时 00 也是 100% 成功
    time: 45000,
    succ: 100.0,        // 00 代码本身就是成功
    impact: 0,          // 不贡献失败
    outlierness: 0
  },

  // 91: Issuer or switch inoperative - 超时 - GC 导致的主要失败原因
  {
    code: "(91) Issuer or switch inoperative",
    cnt: 5680,          // 故障时的超时失败（主要失败原因）
    previousCnt: 15,    // 基线时的少量超时
    resp: 0.0,          // 超时无响应
    previousSucc: 0.0,  // 91 代码本身就是失败
    time: 125000,       // GC 导致超时
    succ: 0.0,          // 91 是失败代码
    impact: 97.2,       // 占新增失败的 97.2%
    outlierness: 98.5
  },

  // 55: Incorrect PIN - 系统错误 - GC 期间少量系统错误
  {
    code: "(55) Incorrect PIN",
    cnt: 98,            // 故障时的系统错误
    previousCnt: 6,     // 基线时的少量系统错误
    resp: 0.0,          // 系统错误无响应
    previousSucc: 0.0,  // 55 代码本身就是失败
    time: 0,
    succ: 0.0,          // 55 是失败代码
    impact: 1.6,        // 占新增失败的 1.6%
    outlierness: 45.2
  },

  // 61: Exceeds withdrawal limit - 资源不足 - GC 导致的资源耗尽
  {
    code: "(61) Exceeds withdrawal limit",
    cnt: 42,            // 故障时的资源不足错误
    previousCnt: 3,     // 基线时的少量资源不足
    resp: 0.0,          // 资源不足无响应
    previousSucc: 0.0,  // 61 代码本身就是失败
    time: 0,
    succ: 0.0,          // 61 是失败代码
    impact: 0.7,        // 占新增失败的 0.7%
    outlierness: 38.5
  },

  // 96: System malfunction - 配置错误 - GC 期间少量配置错误
  {
    code: "(96) System malfunction",
    cnt: 22,            // 故障时的配置错误
    previousCnt: 2,     // 基线时的少量配置错误
    resp: 0.0,          // 配置错误无响应
    previousSucc: 0.0,  // 96 代码本身就是失败
    time: 0,
    succ: 0.0,          // 96 是失败代码
    impact: 0.3,        // 占新增失败的 0.3%
    outlierness: 32.8
  },
];

