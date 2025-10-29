/**
 * Network Issue Scenario - Alert Configuration
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const networkIssueAlertMetadata: AlertMetadata = {
  spv: "New Credit Card System",
  component: "Firewall A",
  title: "Transaction count dropped sharply",
  metricType: "transactionCount",
  baseline: {
    type: 'dynamic',
    data: [
      { t: "21:21", baseline: 920, upper: 970, lower: 870 },
      { t: "21:22", baseline: 885, upper: 935, lower: 835 },
      { t: "21:23", baseline: 910, upper: 960, lower: 860 },
      { t: "21:24", baseline: 895, upper: 945, lower: 845 },
      { t: "21:25", baseline: 925, upper: 975, lower: 875 },
      { t: "21:26", baseline: 905, upper: 955, lower: 855 },
      { t: "21:27", baseline: 915, upper: 965, lower: 865 },
      { t: "21:28", baseline: 900, upper: 950, lower: 850 },
      { t: "21:29", baseline: 910, upper: 960, lower: 860 },
      { t: "21:30", baseline: 905, upper: 955, lower: 855 },
      { t: "21:31", baseline: 920, upper: 970, lower: 870 },
      { t: "21:32", baseline: 910, upper: 960, lower: 860 },
      { t: "21:33", baseline: 925, upper: 975, lower: 875 },
      { t: "21:34", baseline: 915, upper: 965, lower: 865 },
      { t: "21:35", baseline: 890, upper: 940, lower: 840 },
      { t: "21:36", baseline: 930, upper: 980, lower: 880 },
      { t: "21:37", baseline: 900, upper: 950, lower: 850 },
      { t: "21:38", baseline: 920, upper: 970, lower: 870 },
    ]
  },
  condition: {
    metric: "Transaction Count",
    operator: "<",
    threshold: "",
    unit: "Baseline"
  },
  duration: {
    start: "21:27",
    end: "21:32",
    durationMinutes: 6,
    startDate: "2024-01-15",
    startDateTime: "2024-01-15 21:27"
  },
  lowestPoint: {
    value: 520,
    time: "21:30",
    unit: "/m"
  },
  status: "recovered",
  recoveryInfo: {
    time: "21:33",
    value: 950
  },
  contextDescription: "Analyzing dimensional contributors at 21:30 when transaction count dropped to 520/m"
};

export const networkIssueDimensionConfig: DimensionConfig = {
  dimensions: [
    {
      id: 'transType',
      name: 'Trans Type',
      enabled: true,
      dataEndpoint: '/api/dimensions/transaction-types',
      keyField: 'type',
      colorColumn: 'impact'
    },
    {
      id: 'serverIp',
      name: 'Server IP',
      enabled: true,
      dataEndpoint: '/api/dimensions/servers',
      keyField: 'ip',
      colorColumn: 'impact'
    },
    {
      id: 'clientIp',
      name: 'Client IP',
      enabled: true,
      dataEndpoint: '/api/dimensions/clients',
      keyField: 'ip',
      colorColumn: 'impact'
    },
    {
      id: 'channel',
      name: 'Channel',
      enabled: false,
      dataEndpoint: '/api/dimensions/channels',
      keyField: 'channel'
    },
    {
      id: 'returnCode',
      name: 'Return Code',
      enabled: false,
      dataEndpoint: '/api/dimensions/return-codes',
      keyField: 'code'
    }
  ]
};

export const networkIssueScenarioStatus: ScenarioStatus = {
  networkAssessment: {
    hasImpact: true,
    status: 'error',
    details: {
      availability: 'error',
      performance: 'healthy'
    }
  },
  businessInfraBreakdown: {
    status: 'healthy'
    // No primaryFactor - all dimensions are uniformly affected
  }
};

