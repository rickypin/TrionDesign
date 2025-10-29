/**
 * Alert API Service
 * Handles all alert-related API calls
 */

import type { AlertMetadata, DimensionConfig, ScenarioStatus, ScenarioId } from '@/types/alert';

const API_BASE = '/api';

/**
 * Fetch alert metadata
 */
export async function fetchAlertMetadata(): Promise<AlertMetadata> {
  const response = await fetch(`${API_BASE}/alert/metadata`);
  if (!response.ok) {
    throw new Error(`Failed to fetch alert metadata: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch dimension configuration
 */
export async function fetchDimensionConfig(): Promise<DimensionConfig> {
  const response = await fetch(`${API_BASE}/alert/dimensions/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dimension config: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch scenario status
 */
export async function fetchScenarioStatus(): Promise<ScenarioStatus> {
  const response = await fetch(`${API_BASE}/alert/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scenario status: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Switch to a different scenario
 */
export async function switchScenario(scenarioId: ScenarioId): Promise<void> {
  // Store in localStorage for MSW to read
  localStorage.setItem('currentScenario', scenarioId);
  
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
  return (localStorage.getItem('currentScenario') as ScenarioId) || 'app-gc';
}

