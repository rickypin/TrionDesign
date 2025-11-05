/**
 * Alert API Service
 * Handles all alert-related API calls
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus, ScenarioId } from '@/types/alert';
import { apiRequest } from './request';

const API_BASE = '/api';

// Safe localStorage wrapper to handle privacy mode and quota errors
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in privacy mode
    }
  }
};

/**
 * Fetch alert metadata
 */
export async function fetchAlertMetadata(): Promise<AlertMetadata> {
  return apiRequest<AlertMetadata>('/alert/metadata');
}

/**
 * Fetch dimension configuration
 */
export async function fetchDimensionConfig(): Promise<DimensionConfig> {
  return apiRequest<DimensionConfig>('/alert/dimensions/config');
}

/**
 * Fetch scenario status
 */
export async function fetchScenarioStatus(): Promise<ScenarioStatus> {
  return apiRequest<ScenarioStatus>('/alert/status');
}

/**
 * Switch to a different scenario
 */
export async function switchScenario(scenarioId: ScenarioId): Promise<void> {
  // Store in localStorage for MSW to read
  safeLocalStorage.setItem('currentScenario', scenarioId);

  // Optionally call an API endpoint (for future real backend)
  const response = await fetch(`${API_BASE}/scenarios/switch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenarioId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to switch scenario: ${response.statusText}`);
  }
}

/**
 * Get current scenario ID
 */
export function getCurrentScenario(): ScenarioId {
  return (safeLocalStorage.getItem('currentScenario') as ScenarioId) || 'app-gc';
}

