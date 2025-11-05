/**
 * Network Issue Scenario - Dimension Analysis Data
 * S2: 防火墙会话表满导致交易量下降
 * 关键特征：交易被防火墙丢弃，未到达系统，所以到达的交易质量指标正常
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const networkIssueTransType: TransTypeData[] = [
  // 所有交易类型的交易量都按比例下降（35%），但成功率、响应率、响应时间保持正常
  { type: "Normal Purchase", cnt: 1410, previousCnt: 1610, resp: 100.0, previousSucc: 99.8, time: 52000, succ: 99.8, impact: 35.0, outlierness: 0 },
  { type: "Pre-authorization", cnt: 485, previousCnt: 550, resp: 100.0, previousSucc: 99.7, time: 48000, succ: 99.7, impact: 24.5, outlierness: 0 },
  { type: "Cash Advance", cnt: 385, previousCnt: 440, resp: 100.0, previousSucc: 99.7, time: 55000, succ: 99.7, impact: 22.0, outlierness: 0 },
  { type: "Pre-auth Completion", cnt: 180, previousCnt: 205, resp: 100.0, previousSucc: 99.8, time: 45000, succ: 99.8, impact: 10.0, outlierness: 0 },
  { type: "Merchandise Return", cnt: 140, previousCnt: 160, resp: 100.0, previousSucc: 99.75, time: 51000, succ: 99.75, impact: 8.5, outlierness: 0 },
];

export const networkIssueClients: ClientData[] = [
  // 两个客户端的交易量都下降，但成功率、响应率、响应时间保持正常
  { ip: "10.10.24.204", cnt: 1290, previousCnt: 2005, resp: 100.0, previousSucc: 99.8, time: 52000, succ: 99.8, impact: 48.2, outlierness: 0 },
  { ip: "10.10.24.206", cnt: 1310, previousCnt: 2010, resp: 100.0, previousSucc: 99.8, time: 52000, succ: 99.8, impact: 51.8, outlierness: 0 },
];

export const networkIssueServers: ServerData[] = [
  // 两个服务器的交易量都下降，但成功率、响应率、响应时间保持正常
  { ip: "10.10.16.30", cnt: 1330, previousCnt: 2005, resp: 100.0, previousSucc: 99.8, time: 51000, succ: 99.8, impact: 51.2, outlierness: 0 },
  { ip: "10.10.16.31", cnt: 1270, previousCnt: 2010, resp: 100.0, previousSucc: 99.8, time: 51000, succ: 99.8, impact: 48.8, outlierness: 0 },
];

export const networkIssueChannels: ChannelData[] = [
  // 交易量从 4015 下降到 2600，但成功率、响应率、响应时间保持正常
  { channel: "null", cnt: 2600, previousCnt: 4015, resp: 100.0, previousSucc: 99.8, time: 51000, succ: 99.8, impact: 100 },
];

export const networkIssueReturnCodes: ReturnCodeData[] = [
  // S2 场景：防火墙会话表满导致交易量下降
  // 基线: 4015 笔交易，99.8% 成功率（4007 成功，8 失败）
  // 故障: 2600 笔交易，99.8% 成功率（2595 成功，5 失败）
  // 关键：交易被防火墙丢弃，根本没到达系统，所以到达的交易成功率正常

  // 00: Approved - 成功交易
  {
    code: "(00) Approved",
    cnt: 2595,          // 故障时的成功交易（到达系统的交易正常处理）
    previousCnt: 4007,  // 基线时的成功交易（4015 * 99.8%）
    resp: 100.0,        // 有响应
    previousSucc: 100.0, // 基线时 00 也是 100% 成功
    time: 51000,        // 响应时间正常
    succ: 100.0,        // 00 代码本身就是成功
    impact: 0,          // 不贡献失败
    outlierness: 0
  },

  // 91: Issuer or switch inoperative - 正常的少量超时
  {
    code: "(91) Issuer or switch inoperative",
    cnt: 3,             // 故障时的超时（保持基线水平）
    previousCnt: 4,     // 基线时的少量超时
    resp: 0.0,          // 超时无响应
    previousSucc: 0.0,  // 91 代码本身就是失败
    time: 0,
    succ: 0.0,          // 91 是失败代码
    impact: 0,          // 无新增失败
    outlierness: 0
  },

  // 96: System malfunction - 正常的少量系统故障
  {
    code: "(96) System malfunction",
    cnt: 2,             // 故障时少量系统故障
    previousCnt: 4,     // 基线时的少量系统故障
    resp: 0.0,          // 系统故障无响应
    previousSucc: 0.0,  // 96 代码本身就是失败
    time: 0,
    succ: 0.0,          // 96 是失败代码
    impact: 0,          // 无新增失败
    outlierness: 0
  },
];

