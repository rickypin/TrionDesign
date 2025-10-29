/**
 * Network Issue Scenario - Time-Series Metrics Data
 * Shows transaction count drop with network layer issues
 */

import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

export const networkIssueResponseRate: ResponseRateData[] = [
  { t: "21:21", rate: 920 },
  { t: "21:22", rate: 885 },
  { t: "21:23", rate: 910 },
  { t: "21:24", rate: 895 },
  { t: "21:25", rate: 925 },
  { t: "21:26", rate: 905 },
  { t: "21:27", rate: 740 },
  { t: "21:28", rate: 650 },
  { t: "21:29", rate: 580 },
  { t: "21:30", rate: 520 },
  { t: "21:31", rate: 610 },
  { t: "21:32", rate: 720 },
  { t: "21:33", rate: 950 },
  { t: "21:34", rate: 915 },
  { t: "21:35", rate: 890 },
  { t: "21:36", rate: 930 },
  { t: "21:37", rate: 900 },
  { t: "21:38", rate: 920 },
];

export const networkIssueNetworkHealth: NetworkHealthData[] = [
  { t: "21:21", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:22", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:23", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:24", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:25", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:26", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:27", loss: 5, retrans: 12, dupAck: 9 },
  { t: "21:28", loss: 5, retrans: 15, dupAck: 9 },
  { t: "21:29", loss: 5, retrans: 17, dupAck: 9 },
  { t: "21:30", loss: 5, retrans: 19, dupAck: 9 },
  { t: "21:31", loss: 5, retrans: 15, dupAck: 9 },
  { t: "21:32", loss: 5, retrans: 13, dupAck: 9 },
  { t: "21:33", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:34", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:35", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:36", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:37", loss: 5, retrans: 7, dupAck: 9 },
  { t: "21:38", loss: 5, retrans: 7, dupAck: 9 },
];

export const networkIssueTcpHealth: TcpHealthData[] = [
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

