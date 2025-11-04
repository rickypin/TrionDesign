/**
 * useAlertData Hook
 * Unified data fetching hook for all alert-related data
 */

import { useState, useEffect, useCallback } from 'react';
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
import {
  fetchAlertMetadata,
  fetchDimensionConfig,
  fetchScenarioStatus
} from '@/api/alertApi';
import {
  fetchResponseRate,
  fetchNetworkHealth,
  fetchTcpHealth
} from '@/api/metricsApi';
import {
  fetchTransactionTypes,
  fetchClients,
  fetchServers,
  fetchChannels,
  fetchReturnCodes
} from '@/api/dimensionsApi';

export interface UseAlertDataReturn {
  // Alert configuration
  alertMetadata: AlertMetadata | null;
  dimensionConfig: DimensionConfig | null;
  scenarioStatus: ScenarioStatus | null;
  
  // Time-series data
  responseRate: ResponseRateData[];
  networkHealth: NetworkHealthData[];
  tcpHealth: TcpHealthData[];

  // Dimension data
  transType: TransTypeData[];
  clients: ClientData[];
  servers: ServerData[];
  channels: ChannelData[];
  returnCodes: ReturnCodeData[];

  // Loading and error states
  loading: boolean;
  error: Error | null;
  
  // Refresh function
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch all alert data from API
 */
export function useAlertData(): UseAlertDataReturn {
  // Alert configuration state
  const [alertMetadata, setAlertMetadata] = useState<AlertMetadata | null>(null);
  const [dimensionConfig, setDimensionConfig] = useState<DimensionConfig | null>(null);
  const [scenarioStatus, setScenarioStatus] = useState<ScenarioStatus | null>(null);
  
  // Time-series data state
  const [responseRate, setResponseRate] = useState<ResponseRateData[]>([]);
  const [networkHealth, setNetworkHealth] = useState<NetworkHealthData[]>([]);
  const [tcpHealth, setTcpHealth] = useState<TcpHealthData[]>([]);
  
  // Dimension data state
  const [transType, setTransType] = useState<TransTypeData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [returnCodes, setReturnCodes] = useState<ReturnCodeData[]>([]);

  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all data - wrapped in useCallback to maintain stable reference
   */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        metadataData,
        configData,
        statusData,
        responseRateData,
        networkHealthData,
        tcpHealthData,
        transTypeData,
        clientsData,
        serversData,
        channelsData,
        returnCodesData,
      ] = await Promise.all([
        fetchAlertMetadata(),
        fetchDimensionConfig(),
        fetchScenarioStatus(),
        fetchResponseRate(),
        fetchNetworkHealth(),
        fetchTcpHealth(),
        fetchTransactionTypes(),
        fetchClients(),
        fetchServers(),
        fetchChannels(),
        fetchReturnCodes(),
      ]);

      // Update state
      setAlertMetadata(metadataData);
      setDimensionConfig(configData);
      setScenarioStatus(statusData);
      setResponseRate(responseRateData);
      setNetworkHealth(networkHealthData);
      setTcpHealth(tcpHealthData);
      setTransType(transTypeData);
      setClients(clientsData);
      setServers(serversData);
      setChannels(channelsData);
      setReturnCodes(returnCodesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      console.error('Error fetching alert data:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - all API functions are stable

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    alertMetadata,
    dimensionConfig,
    scenarioStatus,
    responseRate,
    networkHealth,
    tcpHealth,
    transType,
    clients,
    servers,
    channels,
    returnCodes,
    loading,
    error,
    refresh: fetchAllData,
  };
}

