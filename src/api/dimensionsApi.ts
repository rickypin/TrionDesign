/**
 * Dimensions API Service
 * Handles dimension analysis data API calls
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';
import { apiRequest } from './request';

/**
 * Fetch transaction type dimension data
 */
export async function fetchTransactionTypes(): Promise<TransTypeData[]> {
  return apiRequest<TransTypeData[]>('/dimensions/transaction-types');
}

/**
 * Fetch client IP dimension data
 */
export async function fetchClients(): Promise<ClientData[]> {
  return apiRequest<ClientData[]>('/dimensions/clients');
}

/**
 * Fetch server IP dimension data
 */
export async function fetchServers(): Promise<ServerData[]> {
  return apiRequest<ServerData[]>('/dimensions/servers');
}

/**
 * Fetch channel dimension data
 */
export async function fetchChannels(): Promise<ChannelData[]> {
  return apiRequest<ChannelData[]>('/dimensions/channels');
}

/**
 * Fetch return code dimension data
 */
export async function fetchReturnCodes(): Promise<ReturnCodeData[]> {
  return apiRequest<ReturnCodeData[]>('/dimensions/return-codes');
}

