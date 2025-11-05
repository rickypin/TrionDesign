/**
 * S2 Scenario - Alert Configuration
 * Response Rate dropped with network performance issues
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const placeholderAlertMetadata: AlertMetadata = {
  spv: "New Credit Card System",
  component: "OpenShift A",
  title: "Response rate dropped",
  metricType: "responseRate",
  baseline: {
    type: 'static',
    value: 100
  },
  condition: {
    metric: "Response Rate",
    operator: "<",
    threshold: "",
    unit: "Baseline"
  },
  duration: {
    start: "21:30",
    end: "",
    durationMinutes: 8,
    startDate: "2024-10-29",
    startDateTime: "2024-10-29 21:30"
  },
  lowestPoint: {
    value: 88.3,
    time: "21:36",
    unit: "%"
  },
  status: "active",
  contextDescription: "Analyzing dimensional contributors at 21:36 when response rate dropped to 88.3%"
};

export const placeholderDimensionConfig: DimensionConfig = {
  dimensions: [
    {
      id: 'channel',
      name: 'Channel',
      enabled: true,
      dataEndpoint: '/api/dimensions/channels',
      keyField: 'channel',
      colorColumn: 'impact'
    },
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
      id: 'returnCode',
      name: 'Return Code',
      enabled: true,
      dataEndpoint: '/api/dimensions/return-codes',
      keyField: 'code',
      colorColumn: 'impact'
    }
  ]
};

export const placeholderScenarioStatus: ScenarioStatus = {
  networkAssessment: {
    hasImpact: true,
    status: 'error',
    details: {
      availability: 'healthy',
      performance: 'error'
    }
  },
  businessInfraBreakdown: {
    status: 'error',
    primaryFactor: {
      dimension: 'channel',
      value: 'China Merchants Bank'
    }
  }
};

