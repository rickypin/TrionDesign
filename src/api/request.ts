/**
 * Generic API Request Utility
 * Provides a unified way to make API requests with consistent error handling
 */

const API_BASE = '/api';

/**
 * Generic API request function
 * @param endpoint - API endpoint path (e.g., '/alert/metadata')
 * @param options - Optional fetch options
 * @returns Promise with typed response data
 */
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

