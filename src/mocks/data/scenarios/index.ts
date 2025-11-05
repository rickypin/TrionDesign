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

// S1: App GC scenario
import {
  defaultAlertMetadata,
  defaultDimensionConfig,
  defaultScenarioStatus
} from './app-gc/alert';
import {
  defaultResponseRate,
  defaultNetworkHealth,
  defaultTcpHealth
} from './app-gc/metrics';
import {
  defaultTransType,
  defaultClients,
  defaultServers,
  defaultChannels,
  defaultReturnCodes
} from './app-gc/dimensions';

// S2: Session Table Full scenario
import {
  networkIssueAlertMetadata,
  networkIssueDimensionConfig,
  networkIssueScenarioStatus
} from './session-table-full/alert';
import {
  networkIssueResponseRate,
  networkIssueNetworkHealth,
  networkIssueTcpHealth
} from './session-table-full/metrics';
import {
  networkIssueTransType,
  networkIssueClients,
  networkIssueServers,
  networkIssueChannels,
  networkIssueReturnCodes
} from './session-table-full/dimensions';

// S3: PMTUD Black Hole scenario
import {
  placeholderAlertMetadata,
  placeholderDimensionConfig,
  placeholderScenarioStatus
} from './pmtud-black-hole/alert';
import {
  placeholderResponseRate,
  placeholderNetworkHealth,
  placeholderTcpHealth
} from './pmtud-black-hole/metrics';
import {
  placeholderTransType,
  placeholderClients,
  placeholderServers,
  placeholderChannels,
  placeholderReturnCodes
} from './pmtud-black-hole/dimensions';

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
  'app-gc': {
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
  'session-table-full': {
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
  },
  'pmtud-black-hole': {
    alert: {
      metadata: placeholderAlertMetadata,
      dimensionConfig: placeholderDimensionConfig,
      status: placeholderScenarioStatus
    },
    metrics: {
      responseRate: placeholderResponseRate,
      networkHealth: placeholderNetworkHealth,
      tcpHealth: placeholderTcpHealth
    },
    dimensions: {
      transType: placeholderTransType,
      clients: placeholderClients,
      servers: placeholderServers,
      channels: placeholderChannels,
      returnCodes: placeholderReturnCodes
    }
  }
};

/**
 * Get current scenario data based on localStorage
 */
export function getCurrentScenarioData(): ScenarioData {
  const scenarioId = (localStorage.getItem('currentScenario') as ScenarioId) || 'app-gc';
  return scenarios[scenarioId] || scenarios['app-gc'];
}

