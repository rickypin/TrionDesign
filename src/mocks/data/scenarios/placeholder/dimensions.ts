/**
 * S2 Scenario - Dimension Analysis Data
 * Channel dimension shows China Merchants Bank as primary factor
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const placeholderChannels: ChannelData[] = [
  { channel: "China Merchants Bank", cnt: 342, resp: 88.3, time: 65000, succ: 88.3, impact: 42.5, outlierness: 15.8 },
  { channel: "Industrial and Commercial Bank", cnt: 198, resp: 11.2, time: 48000, succ: 100.0, impact: 24.6, outlierness: 2.1 },
  { channel: "Agricultural Bank of China", cnt: 156, resp: 10.8, time: 47500, succ: 100.0, impact: 19.4, outlierness: 1.8 },
  { channel: "Bank of China", cnt: 87, resp: 11.5, time: 48200, succ: 100.0, impact: 10.8, outlierness: 2.3 },
  { channel: "China Construction Bank", cnt: 22, resp: 12.1, time: 49000, succ: 100.0, impact: 2.7, outlierness: 2.5 },
];

export const placeholderTransType: TransTypeData[] = [
  { type: "Normal Purchase", cnt: 520, previousCnt: 520, resp: 11.7, time: 52000, succ: 95.2, impact: 64.6, outlierness: 5.2 },
  { type: "Pre-authorization", cnt: 142, previousCnt: 142, resp: 11.3, time: 48000, succ: 95.8, impact: 17.6, outlierness: 4.8 },
  { type: "Cash Advance", cnt: 98, previousCnt: 98, resp: 12.1, time: 55000, succ: 94.9, impact: 12.2, outlierness: 5.5 },
  { type: "Pre-auth Completion", cnt: 32, previousCnt: 32, resp: 10.8, time: 45000, succ: 96.2, impact: 4.0, outlierness: 4.2 },
  { type: "Merchandise Return", cnt: 13, previousCnt: 13, resp: 11.9, time: 51000, succ: 95.5, impact: 1.6, outlierness: 5.0 },
];

export const placeholderClients: ClientData[] = [
  { ip: "10.10.24.204", cnt: 402, resp: 11.7, time: 52000, succ: 95.2, impact: 50.0, outlierness: 5.2 },
  { ip: "10.10.24.206", cnt: 403, resp: 11.6, time: 51800, succ: 95.3, impact: 50.0, outlierness: 5.1 },
];

export const placeholderServers: ServerData[] = [
  { ip: "10.10.16.30", cnt: 402, resp: 11.7, time: 52000, succ: 95.2, impact: 50.0, outlierness: 5.2 },
  { ip: "10.10.16.31", cnt: 403, resp: 11.6, time: 51800, succ: 95.3, impact: 50.0, outlierness: 5.1 },
];

export const placeholderReturnCodes: ReturnCodeData[] = [
  { code: "null (No Resp)", cnt: 805, resp: 0.0, time: 0.0, succ: 0.00, impact: 100 },
];

