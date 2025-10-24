import type {
  ResponseRateData,
  NetworkHealthData,
  TcpHealthData,
  TransTypeData,
  ClientData,
  ChannelData,
  ServerData,
  ReturnCodeData,
} from "@/types";

export const responseRate: ResponseRateData[] = [
  { t: "21:21", rate: 100 },
  { t: "21:22", rate: 100 },
  { t: "21:23", rate: 100 },
  { t: "21:24", rate: 100 },
  { t: "21:25", rate: 100 },
  { t: "21:26", rate: 100 },
  { t: "21:27", rate: 85.2 },
  { t: "21:28", rate: 82.1 },
  { t: "21:29", rate: 79.8 },
  { t: "21:30", rate: 77.43 },
  { t: "21:31", rate: 78.9 },
  { t: "21:32", rate: 81.4 },
  { t: "21:33", rate: 100 },
  { t: "21:34", rate: 100 },
  { t: "21:35", rate: 100 },
  { t: "21:36", rate: 100 },
  { t: "21:37", rate: 100 },
  { t: "21:38", rate: 100 },
];

export const networkHealth: NetworkHealthData[] = [
  { t: "21:25", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:27", loss: 5.2, retrans: 7.3, dupAck: 9.8 },
  { t: "21:29", loss: 4.6, retrans: 6.8, dupAck: 9.1 },
  { t: "21:31", loss: 5.0, retrans: 7.1, dupAck: 9.5 },
  { t: "21:33", loss: 4.7, retrans: 6.9, dupAck: 9.2 },
  { t: "21:35", loss: 5.1, retrans: 7.4, dupAck: 9.9 },
];

export const tcpHealth: TcpHealthData[] = [
  { t: "21:25", setup: 99.8, rst: 2.0 },
  { t: "21:27", setup: 99.9, rst: 2.1 },
  { t: "21:29", setup: 99.8, rst: 1.9 },
  { t: "21:31", setup: 99.9, rst: 2.0 },
  { t: "21:33", setup: 99.8, rst: 1.8 },
  { t: "21:35", setup: 99.9, rst: 2.2 },
];

export const transType: TransTypeData[] = [
  { type: "Normal Purchase", cnt: 777, resp: 3.47, time: 49087, succ: 100.0, impact: 93.75 },
  { type: "Pre-authorization", cnt: 31, resp: 0.05, time: 0, succ: 100.0, impact: 3.38 },
  { type: "Cash Advance", cnt: 30, resp: 65.33, time: 68132, succ: 100.0, impact: 3.38 },
  { type: "Pre-auth Completion", cnt: 3, resp: 0.05, time: 0, succ: 0.0, impact: 0.38 },
  { type: "Merchandise Return", cnt: 5, resp: 40.0, time: 147121, succ: 60.0, impact: 0.38 },
];

export const clients: ClientData[] = [
  { ip: "10.10.24.204", cnt: 404, resp: 4.7, time: 43102, succ: 100, impact: 61.33 },
  { ip: "10.10.24.206", cnt: 373, resp: 2.14, time: 68186, succ: 100, impact: 48.67 },
];

export const channels: ChannelData[] = [
  { channel: "null", cnt: 404, resp: 4.7, time: 43102, succ: 100, impact: 100 },
];

export const servers: ServerData[] = [
  { ip: "10.10.10.30", cnt: 404, resp: 4.7, time: 43102, succ: 100, impact: 100 },
];

export const returnCodes: ReturnCodeData[] = [
  { code: 325, cnt: 325, resp: 0.0, time: 0, succ: 100, impact: 0.02 },
  { code: 79, cnt: 79, resp: 100.0, time: 43102, succ: 100, impact: 0.01 },
];

