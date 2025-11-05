/**
 * Default Scenario - Alert Configuration
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const defaultAlertMetadata: AlertMetadata = {
  spv: "New Credit Card System",
  component: "OpenShift A",
  title: "Success rate dropped sharply",
  metricType: "successRate",
  baseline: {
    type: 'static',
    value: 99.2  // 日常基线成功率
  },
  condition: {
    metric: "Success Rate",
    operator: "<",
    threshold: "90",
    unit: "%"
  },
  duration: {
    start: "21:27",
    end: "21:32",
    durationMinutes: 6,
    startDate: "2024-10-29",
    startDateTime: "2024-10-29 21:27"
  },
  lowestPoint: {
    value: 7.8,
    time: "21:30",
    unit: "%"
  },
  status: "recovered",
  recoveryInfo: {
    time: "21:33",
    value: 99.2  // 恢复到基线水平
  },
  contextDescription: "Analyzing dimensional contributors at 21:30 when success rate dropped to 7.8% due to application GC pause"
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
      enabled: true,
      dataEndpoint: '/api/dimensions/return-codes',
      keyField: 'code',
      colorColumn: 'impact'
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

