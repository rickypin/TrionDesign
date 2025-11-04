/**
 * S2 Scenario - Dimension Analysis Data
 * Channel dimension shows China Merchants Bank as primary factor
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const placeholderChannels: ChannelData[] = [
  { channel: "China Merchants Bank", cnt: 342, previousCnt: 342, resp: 88.3, previousSucc: 99.8, time: 65000, succ: 88.3, impact: 42.5, outlierness: 15.8 },
  { channel: "Industrial and Commercial Bank", cnt: 198, previousCnt: 198, resp: 11.2, previousSucc: 99.8, time: 48000, succ: 100.0, impact: 24.6, outlierness: 2.1 },
  { channel: "Agricultural Bank of China", cnt: 156, previousCnt: 156, resp: 10.8, previousSucc: 99.8, time: 47500, succ: 100.0, impact: 19.4, outlierness: 1.8 },
  { channel: "Bank of China", cnt: 87, previousCnt: 87, resp: 11.5, previousSucc: 99.8, time: 48200, succ: 100.0, impact: 10.8, outlierness: 2.3 },
  { channel: "China Construction Bank", cnt: 22, previousCnt: 22, resp: 12.1, previousSucc: 99.8, time: 49000, succ: 100.0, impact: 2.7, outlierness: 2.5 },
];

export const placeholderTransType: TransTypeData[] = [
  { type: "Normal Purchase", cnt: 520, previousCnt: 520, resp: 11.7, previousSucc: 99.8, time: 52000, succ: 95.2, impact: 64.6, outlierness: 5.2 },
  { type: "Pre-authorization", cnt: 142, previousCnt: 142, resp: 11.3, previousSucc: 99.7, time: 48000, succ: 95.8, impact: 17.6, outlierness: 4.8 },
  { type: "Cash Advance", cnt: 98, previousCnt: 98, resp: 12.1, previousSucc: 99.7, time: 55000, succ: 94.9, impact: 12.2, outlierness: 5.5 },
  { type: "Pre-auth Completion", cnt: 32, previousCnt: 32, resp: 10.8, previousSucc: 99.8, time: 45000, succ: 96.2, impact: 4.0, outlierness: 4.2 },
  { type: "Merchandise Return", cnt: 13, previousCnt: 13, resp: 11.9, previousSucc: 99.75, time: 51000, succ: 95.5, impact: 1.6, outlierness: 5.0 },
];

export const placeholderClients: ClientData[] = [
  { ip: "10.10.24.204", cnt: 402, resp: 11.7, previousSucc: 99.8, time: 52000, succ: 95.2, impact: 50.0, outlierness: 5.2 },
  { ip: "10.10.24.206", cnt: 403, resp: 11.6, previousSucc: 99.8, time: 51800, succ: 95.3, impact: 50.0, outlierness: 5.1 },
];

export const placeholderServers: ServerData[] = [
  { ip: "10.10.16.30", cnt: 402, resp: 11.7, previousSucc: 99.755, time: 52000, succ: 95.2, impact: 50.0, outlierness: 5.2 },
  { ip: "10.10.16.31", cnt: 403, resp: 11.6, previousSucc: 99.8, time: 51800, succ: 95.3, impact: 50.0, outlierness: 5.1 },
];

export const placeholderReturnCodes: ReturnCodeData[] = [
  // S2 场景：招商银行渠道响应率下降
  // 基线: 805 笔交易，99.8% 成功率（803 成功，2 失败）
  // 故障: 805 笔交易，95.2% 成功率（766 成功，39 失败）
  // 主要问题：招商银行渠道响应慢，导致部分无响应（resp 从 100% 降到 88.3%）

  // 00: Approved - 成功交易
  {
    code: "(00) Approved",
    cnt: 766,           // 故障时的成功交易
    previousCnt: 803,   // 基线时的成功交易（805 * 99.8%）
    resp: 100.0,        // 有响应
    previousSucc: 100.0, // 基线时 00 也是 100% 成功
    time: 52000,
    succ: 100.0,        // 00 代码本身就是成功
    impact: 0,          // 不贡献失败
    outlierness: 0
  },

  // 无响应 - 招商银行渠道无响应（主要问题）
  {
    code: "null (No Resp)",
    cnt: 35,            // 故障时的无响应（响应率下降的主要原因）
    previousCnt: 0,     // 基线时无此问题
    resp: 0.0,          // 无响应
    previousSucc: 0.0,  // 无响应就是失败
    time: 0,
    succ: 0.0,          // 无响应是失败
    impact: 94.6,       // 占新增失败的 94.6% (35/37)
    outlierness: 85.5
  },

  // 91: Issuer or switch inoperative - 少量超时
  {
    code: "(91) Issuer or switch inoperative",
    cnt: 1,             // 故障时的超时
    previousCnt: 1,     // 基线时的少量超时
    resp: 0.0,          // 超时无响应
    previousSucc: 0.0,  // 91 代码本身就是失败
    time: 0,
    succ: 0.0,          // 91 是失败代码
    impact: 0,          // 无新增失败
    outlierness: 0
  },

  // 96: System malfunction - 少量系统故障
  {
    code: "(96) System malfunction",
    cnt: 1,             // 故障时的系统故障
    previousCnt: 1,     // 基线时的少量系统故障
    resp: 0.0,          // 系统故障无响应
    previousSucc: 0.0,  // 96 代码本身就是失败
    time: 0,
    succ: 0.0,          // 96 是失败代码
    impact: 0,          // 无新增失败
    outlierness: 0
  },

  // 05: Do not honor - 少量拒绝
  {
    code: "(05) Do not honor",
    cnt: 2,             // 故障时的拒绝交易
    previousCnt: 0,     // 基线时无此错误
    resp: 100.0,        // 有响应但拒绝
    previousSucc: 0.0,  // 05 代码本身就是失败
    time: 58000,
    succ: 0.0,          // 05 是失败代码
    impact: 5.4,        // 占新增失败的 5.4% (2/37)
    outlierness: 12.5
  },
];

