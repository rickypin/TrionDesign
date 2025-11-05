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
      { t: "21:21", baseline: 4600, upper: 4850, lower: 4350 },
      { t: "21:22", baseline: 4425, upper: 4675, lower: 4175 },
      { t: "21:23", baseline: 4550, upper: 4800, lower: 4300 },
      { t: "21:24", baseline: 4475, upper: 4725, lower: 4225 },
      { t: "21:25", baseline: 4625, upper: 4875, lower: 4375 },
      { t: "21:26", baseline: 4525, upper: 4775, lower: 4275 },
      { t: "21:27", baseline: 4575, upper: 4825, lower: 4325 },
      { t: "21:28", baseline: 4500, upper: 4750, lower: 4250 },
      { t: "21:29", baseline: 4550, upper: 4800, lower: 4300 },
      { t: "21:30", baseline: 4525, upper: 4775, lower: 4275 },
      { t: "21:31", baseline: 4600, upper: 4850, lower: 4350 },
      { t: "21:32", baseline: 4550, upper: 4800, lower: 4300 },
      { t: "21:33", baseline: 4625, upper: 4875, lower: 4375 },
      { t: "21:34", baseline: 4575, upper: 4825, lower: 4325 },
      { t: "21:35", baseline: 4450, upper: 4700, lower: 4200 },
      { t: "21:36", baseline: 4650, upper: 4900, lower: 4400 },
      { t: "21:37", baseline: 4500, upper: 4750, lower: 4250 },
      { t: "21:38", baseline: 4600, upper: 4850, lower: 4350 },
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
    startDate: "2024-10-29",
    startDateTime: "2024-10-29 21:27"
  },
  lowestPoint: {
    value: 2600,
    time: "21:30",
    unit: "/m"
  },
  status: "recovered",
  recoveryInfo: {
    time: "21:33",
    value: 4750
  },
  contextDescription: "Analyzing dimensional contributors at 21:30 when transaction count dropped to 2600/m"
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
      enabled: true,
      dataEndpoint: '/api/dimensions/return-codes',
      keyField: 'code',
      colorColumn: 'impact'
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

