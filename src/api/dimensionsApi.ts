/**
 * Dimensions API Service
 * Handles dimension analysis data API calls
 */

import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

const API_BASE = '/api';

/**
 * Fetch transaction type dimension data
 */
export async function fetchTransactionTypes(): Promise<TransTypeData[]> {
  const response = await fetch(`${API_BASE}/dimensions/transaction-types`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction types: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch client IP dimension data
 */
export async function fetchClients(): Promise<ClientData[]> {
  const response = await fetch(`${API_BASE}/dimensions/clients`);
  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch server IP dimension data
 */
export async function fetchServers(): Promise<ServerData[]> {
  const response = await fetch(`${API_BASE}/dimensions/servers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch servers: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch channel dimension data
 */
export async function fetchChannels(): Promise<ChannelData[]> {
  const response = await fetch(`${API_BASE}/dimensions/channels`);
  if (!response.ok) {
    throw new Error(`Failed to fetch channels: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch return code dimension data
 */
export async function fetchReturnCodes(): Promise<ReturnCodeData[]> {
  const response = await fetch(`${API_BASE}/dimensions/return-codes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch return codes: ${response.statusText}`);
  }
  return response.json();
}

