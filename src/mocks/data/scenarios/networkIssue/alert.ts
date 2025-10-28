/**
 * Network Issue Scenario - Alert Configuration
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const networkIssueAlertMetadata: AlertMetadata = {
  spv: "New Credit Card System",
  component: "Firewall A",
  title: "Transaction count dropped sharply",
  metricType: "transactionCount",
  condition: {
    metric: "Transaction Count",
    operator: "<",
    threshold: 800,
    unit: "/m"
  },
  duration: {
    start: "21:27",
    end: "21:32",
    durationMinutes: 6
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

