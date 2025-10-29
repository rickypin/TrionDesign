/**
 * Default Scenario - Alert Configuration
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const defaultAlertMetadata: AlertMetadata = {
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
    start: "21:27",
    end: "21:32",
    durationMinutes: 6,
    startDate: "2024-01-15",
    startDateTime: "2024-01-15 21:27"
  },
  lowestPoint: {
    value: 77.4,
    time: "21:30",
    unit: "%"
  },
  status: "recovered",
  recoveryInfo: {
    time: "21:33",
    value: 100
  },
  contextDescription: "Analyzing dimensional contributors at 21:30 when response rate dropped to 77.4%"
};

export const defaultDimensionConfig: DimensionConfig = {
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

export const defaultScenarioStatus: ScenarioStatus = {
  networkAssessment: {
    hasImpact: false,
    status: 'healthy',
    details: {
      availability: 'healthy',
      performance: 'healthy'
    }
  },
  businessInfraBreakdown: {
    status: 'error',
    primaryFactor: {
      dimension: 'transType',
      value: 'Normal Purchase'
    }
  }
};

