/**
 * Scenario Data Index
 * Exports all scenario data for MSW handlers
 */

import type { ScenarioId } from '@/types/alert';
import type { 
  ResponseRateData, 
  NetworkHealthData, 
  TcpHealthData,
  TransTypeData,
  ClientData,
  ServerData,
  ChannelData,
  ReturnCodeData
} from '@/types';
import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

// Default scenario
import { 
  defaultAlertMetadata, 
  defaultDimensionConfig, 
  defaultScenarioStatus 
} from './default/alert';
import { 
  defaultResponseRate, 
  defaultNetworkHealth, 
  defaultTcpHealth 
} from './default/metrics';
import { 
  defaultTransType, 
  defaultClients, 
  defaultServers, 
  defaultChannels, 
  defaultReturnCodes 
} from './default/dimensions';

// Network Issue scenario
import { 
  networkIssueAlertMetadata, 
  networkIssueDimensionConfig, 
  networkIssueScenarioStatus 
} from './networkIssue/alert';
import { 
  networkIssueResponseRate, 
  networkIssueNetworkHealth, 
  networkIssueTcpHealth 
} from './networkIssue/metrics';
import { 
  networkIssueTransType, 
  networkIssueClients, 
  networkIssueServers, 
  networkIssueChannels, 
  networkIssueReturnCodes 
} from './networkIssue/dimensions';

// Scenario data structure
export interface ScenarioData {
  alert: {
    metadata: AlertMetadata;
    dimensionConfig: DimensionConfig;
    status: ScenarioStatus;
  };
  metrics: {
    responseRate: ResponseRateData[];
    networkHealth: NetworkHealthData[];
    tcpHealth: TcpHealthData[];
  };
  dimensions: {
    transType: TransTypeData[];
    clients: ClientData[];
    servers: ServerData[];
    channels: ChannelData[];
    returnCodes: ReturnCodeData[];
  };
}

// Scenario registry
export const scenarios: Record<ScenarioId, ScenarioData> = {
  default: {
    alert: {
      metadata: defaultAlertMetadata,
      dimensionConfig: defaultDimensionConfig,
      status: defaultScenarioStatus
    },
    metrics: {
      responseRate: defaultResponseRate,
      networkHealth: defaultNetworkHealth,
      tcpHealth: defaultTcpHealth
    },
    dimensions: {
      transType: defaultTransType,
      clients: defaultClients,
      servers: defaultServers,
      channels: defaultChannels,
      returnCodes: defaultReturnCodes
    }
  },
  networkIssue: {
    alert: {
      metadata: networkIssueAlertMetadata,
      dimensionConfig: networkIssueDimensionConfig,
      status: networkIssueScenarioStatus
    },
    metrics: {
      responseRate: networkIssueResponseRate,
      networkHealth: networkIssueNetworkHealth,
      tcpHealth: networkIssueTcpHealth
    },
    dimensions: {
      transType: networkIssueTransType,
      clients: networkIssueClients,
      servers: networkIssueServers,
      channels: networkIssueChannels,
      returnCodes: networkIssueReturnCodes
    }
  }
};

/**
 * Get current scenario data based on localStorage
 */
export function getCurrentScenarioData(): ScenarioData {
  const scenarioId = (localStorage.getItem('currentScenario') as ScenarioId) || 'default';
  return scenarios[scenarioId] || scenarios.default;
}

