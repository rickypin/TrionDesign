/**
 * Default Scenario - Time-Series Metrics Data
 */

import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

export const defaultResponseRate: ResponseRateData[] = [
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

export const defaultNetworkHealth: NetworkHealthData[] = [
  { t: "21:21", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:22", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:23", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:24", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:25", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:26", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:27", loss: 5, retrans: 9, dupAck: 10 },
  { t: "21:28", loss: 5, retrans: 10, dupAck: 10 },
  { t: "21:29", loss: 5, retrans: 11, dupAck: 9 },
  { t: "21:30", loss: 5, retrans: 11, dupAck: 9 },
  { t: "21:31", loss: 5, retrans: 10, dupAck: 10 },
  { t: "21:32", loss: 5, retrans: 9, dupAck: 9 },
  { t: "21:33", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:34", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:35", loss: 5, retrans: 7, dupAck: 10 },
  { t: "21:36", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:37", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:38", loss: 5, retrans: 7, dupAck: 9 },
];

export const defaultTcpHealth: TcpHealthData[] = [
  { t: "21:21", setup: 99.9, rst: 2 },
  { t: "21:22", setup: 99.8, rst: 2 },
  { t: "21:23", setup: 99.9, rst: 2 },
  { t: "21:24", setup: 99.8, rst: 2 },
  { t: "21:25", setup: 99.8, rst: 2 },
  { t: "21:26", setup: 99.9, rst: 2 },
  { t: "21:27", setup: 99.9, rst: 2 },
  { t: "21:28", setup: 99.8, rst: 2 },
  { t: "21:29", setup: 99.8, rst: 2 },
  { t: "21:30", setup: 99.9, rst: 2 },
  { t: "21:31", setup: 99.9, rst: 2 },
  { t: "21:32", setup: 99.8, rst: 2 },
  { t: "21:33", setup: 99.8, rst: 2 },
  { t: "21:34", setup: 99.9, rst: 2 },
  { t: "21:35", setup: 99.9, rst: 2 },
  { t: "21:36", setup: 99.8, rst: 2 },
  { t: "21:37", setup: 99.9, rst: 2 },
  { t: "21:38", setup: 99.8, rst: 2 },
];

