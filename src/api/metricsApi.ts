/**
 * Metrics API Service
 * Handles time-series metrics data API calls
 */

import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';
import { apiRequest } from './request';

/**
 * Fetch response rate time-series data
 */
export async function fetchResponseRate(): Promise<ResponseRateData[]> {
  return apiRequest<ResponseRateData[]>('/metrics/response-rate');
}

/**
 * Fetch network health time-series data
 */
export async function fetchNetworkHealth(): Promise<NetworkHealthData[]> {
  return apiRequest<NetworkHealthData[]>('/metrics/network-health');
}

/**
 * Fetch TCP health time-series data
 */
export async function fetchTcpHealth(): Promise<TcpHealthData[]> {
  return apiRequest<TcpHealthData[]>('/metrics/tcp-health');
}

