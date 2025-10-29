/**
 * S2 Scenario - Time-Series Metrics Data
 * Response Rate dropped and not recovered, with network performance issues
 */

import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

export const placeholderResponseRate: ResponseRateData[] = [
  { t: "21:21", rate: 100 },
  { t: "21:22", rate: 100 },
  { t: "21:23", rate: 100 },
  { t: "21:24", rate: 100 },
  { t: "21:25", rate: 100 },
  { t: "21:26", rate: 100 },
  { t: "21:27", rate: 100 },
  { t: "21:28", rate: 100 },
  { t: "21:29", rate: 100 },
  { t: "21:30", rate: 95.2 },
  { t: "21:31", rate: 93.8 },
  { t: "21:32", rate: 91.5 },
  { t: "21:33", rate: 90.1 },
  { t: "21:34", rate: 89.2 },
  { t: "21:35", rate: 88.7 },
  { t: "21:36", rate: 88.3 },
  { t: "21:37", rate: 88.5 },
  { t: "21:38", rate: 88.6 },
];

export const placeholderNetworkHealth: NetworkHealthData[] = [
  { t: "21:21", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:22", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:23", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:24", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:25", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:26", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:27", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:28", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:29", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:30", loss: 5, retrans: 12, dupAck: 14 },
  { t: "21:31", loss: 5, retrans: 15, dupAck: 17 },
  { t: "21:32", loss: 5, retrans: 18, dupAck: 20 },
  { t: "21:33", loss: 5, retrans: 21, dupAck: 23 },
  { t: "21:34", loss: 5, retrans: 23, dupAck: 25 },
  { t: "21:35", loss: 5, retrans: 25, dupAck: 27 },
  { t: "21:36", loss: 5, retrans: 26, dupAck: 28 },
  { t: "21:37", loss: 5, retrans: 26, dupAck: 28 },
  { t: "21:38", loss: 5, retrans: 25, dupAck: 27 },
];

export const placeholderTcpHealth: TcpHealthData[] = [
  { t: "21:21", setup: 99.9, rst: 2 },
  { t: "21:22", setup: 99.9, rst: 2 },
  { t: "21:23", setup: 99.9, rst: 2 },
  { t: "21:24", setup: 99.9, rst: 2 },
  { t: "21:25", setup: 99.9, rst: 2 },
  { t: "21:26", setup: 99.9, rst: 2 },
  { t: "21:27", setup: 99.9, rst: 2 },
  { t: "21:28", setup: 99.9, rst: 2 },
  { t: "21:29", setup: 99.9, rst: 2 },
  { t: "21:30", setup: 99.9, rst: 2 },
  { t: "21:31", setup: 99.9, rst: 2 },
  { t: "21:32", setup: 99.9, rst: 2 },
  { t: "21:33", setup: 99.9, rst: 2 },
  { t: "21:34", setup: 99.9, rst: 2 },
  { t: "21:35", setup: 99.9, rst: 2 },
  { t: "21:36", setup: 99.9, rst: 2 },
  { t: "21:37", setup: 99.9, rst: 2 },
  { t: "21:38", setup: 99.9, rst: 2 },
];

