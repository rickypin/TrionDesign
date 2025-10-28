/**
 * Metrics API Service
 * Handles time-series metrics data API calls
 */

import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

const API_BASE = '/api';

/**
 * Fetch response rate time-series data
 */
export async function fetchResponseRate(): Promise<ResponseRateData[]> {
  const response = await fetch(`${API_BASE}/metrics/response-rate`);
  if (!response.ok) {
    throw new Error(`Failed to fetch response rate: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch network health time-series data
 */
export async function fetchNetworkHealth(): Promise<NetworkHealthData[]> {
  const response = await fetch(`${API_BASE}/metrics/network-health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch network health: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch TCP health time-series data
 */
export async function fetchTcpHealth(): Promise<TcpHealthData[]> {
  const response = await fetch(`${API_BASE}/metrics/tcp-health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TCP health: ${response.statusText}`);
  }
  return response.json();
}

