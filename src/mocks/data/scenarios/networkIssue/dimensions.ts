/**
 * Network Issue Scenario - Dimension Analysis Data
 * All dimensions are uniformly affected - no single primary factor
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const networkIssueTransType: TransTypeData[] = [
  { type: "Normal Purchase", cnt: 282, previousCnt: 322, resp: 5.2, previousSucc: 99.8, time: 52000, succ: 98.5, impact: 35.0, outlierness: 12.3 },
  { type: "Pre-authorization", cnt: 97, previousCnt: 110, resp: 4.8, previousSucc: 99.7, time: 48000, succ: 99.0, impact: 24.5, outlierness: 11.8 },
  { type: "Cash Advance", cnt: 77, previousCnt: 88, resp: 6.1, previousSucc: 99.7, time: 55000, succ: 97.8, impact: 22.0, outlierness: 12.5 },
  { type: "Pre-auth Completion", cnt: 36, previousCnt: 41, resp: 4.5, previousSucc: 99.8, time: 45000, succ: 98.2, impact: 10.0, outlierness: 11.2 },
  { type: "Merchandise Return", cnt: 28, previousCnt: 32, resp: 5.5, previousSucc: 99.75, time: 51000, succ: 98.0, impact: 8.5, outlierness: 12.8 },
];

export const networkIssueClients: ClientData[] = [
  { ip: "10.10.24.204", cnt: 258, resp: 52.3, previousSucc: 99.8, time: 58000, succ: 48.5, impact: 48.2, outlierness: 11.5 },
  { ip: "10.10.24.206", cnt: 262, resp: 53.1, previousSucc: 99.8, time: 59500, succ: 47.8, impact: 51.8, outlierness: 12.2 },
];

export const networkIssueServers: ServerData[] = [
  { ip: "10.10.16.30", cnt: 266, resp: 88.5, previousSucc: 99.755, time: 72000, succ: 18.2, impact: 51.2, outlierness: 11.8 },
  { ip: "10.10.16.31", cnt: 254, resp: 85.2, previousSucc: 99.8, time: 70000, succ: 20.5, impact: 48.8, outlierness: 12.0 },
];

export const networkIssueChannels: ChannelData[] = [
  { channel: "null", cnt: 803, previousCnt: 803, resp: 6.2, previousSucc: 99.8, time: 51000, succ: 98.2, impact: 100 },
];

export const networkIssueReturnCodes: ReturnCodeData[] = [
  { code: "null (No Resp)", cnt: 803, resp: 0.0, time: 0.0, succ: 0.00, impact: 100 },
];

