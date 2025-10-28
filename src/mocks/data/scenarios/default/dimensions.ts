/**
 * Default Scenario - Dimension Analysis Data
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const defaultTransType: TransTypeData[] = [
  { type: "Normal Purchase", cnt: 777, previousCnt: 2, resp: 3.47, time: 49087, succ: 100.0, impact: 93.75, outlierness: 99.7 },
  { type: "Pre-authorization", cnt: 31, previousCnt: 31, resp: 0.05, time: 0, succ: 100.0, impact: 3.38, outlierness: 0.1 },
  { type: "Cash Advance", cnt: 30, previousCnt: 30, resp: 65.33, time: 68132, succ: 100.0, impact: 3.38, outlierness: 0.2 },
  { type: "Pre-auth Completion", cnt: 3, previousCnt: 3, resp: 0.05, time: 0, succ: 0.0, impact: 0.38, outlierness: 0.1 },
  { type: "Merchandise Return", cnt: 5, previousCnt: 5, resp: 40.0, time: 147121, succ: 60.0, impact: 0.38, outlierness: 0.3 },
];

export const defaultClients: ClientData[] = [
  { ip: "10.10.24.204", cnt: 434, resp: 83.83, time: 61.805, succ: 29.07, impact: 51.33, outlierness: 8.7 },
  { ip: "10.10.24.206", cnt: 412, resp: 84.45, time: 67.872, succ: 28.66, impact: 48.67, outlierness: 11.3 },
];

export const defaultServers: ServerData[] = [
  { ip: "10.10.16.30", cnt: 434, resp: 83.83, time: 61.805, succ: 29.07, impact: 51.33, outlierness: 8.7 },
  { ip: "10.10.16.31", cnt: 412, resp: 84.45, time: 67.872, succ: 28.66, impact: 48.67, outlierness: 11.3 },
];

export const defaultChannels: ChannelData[] = [
  { channel: "null", cnt: 846, resp: 4.7, time: 43102, succ: 100, impact: 100 },
];

export const defaultReturnCodes: ReturnCodeData[] = [
  { code: "null (No Resp)", cnt: 846, resp: 0.0, time: 0.0, succ: 0.00, impact: 100 },
];

