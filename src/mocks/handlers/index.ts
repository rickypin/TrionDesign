/**
 * MSW Request Handlers
 * Intercepts API calls and returns mock data based on current scenario
 */

import { http, HttpResponse } from 'msw';
import { getCurrentScenarioData } from '../data/scenarios';
import type { ScenarioId } from '@/types/alert';

const API_BASE = '/api';

export const handlers = [
  // ============================================
  // Alert Configuration Endpoints
  // ============================================
  
  // GET /api/alert/metadata
  http.get(`${API_BASE}/alert/metadata`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.alert.metadata);
  }),

  // GET /api/alert/dimensions/config
  http.get(`${API_BASE}/alert/dimensions/config`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.alert.dimensionConfig);
  }),

  // GET /api/alert/status
  http.get(`${API_BASE}/alert/status`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.alert.status);
  }),

  // ============================================
  // Metrics Endpoints
  // ============================================
  
  // GET /api/metrics/response-rate
  http.get(`${API_BASE}/metrics/response-rate`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.metrics.responseRate);
  }),

  // GET /api/metrics/network-health
  http.get(`${API_BASE}/metrics/network-health`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.metrics.networkHealth);
  }),

  // GET /api/metrics/tcp-health
  http.get(`${API_BASE}/metrics/tcp-health`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.metrics.tcpHealth);
  }),

  // ============================================
  // Dimensions Endpoints
  // ============================================
  
  // GET /api/dimensions/transaction-types
  http.get(`${API_BASE}/dimensions/transaction-types`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.dimensions.transType);
  }),

  // GET /api/dimensions/clients
  http.get(`${API_BASE}/dimensions/clients`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.dimensions.clients);
  }),

  // GET /api/dimensions/servers
  http.get(`${API_BASE}/dimensions/servers`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.dimensions.servers);
  }),

  // GET /api/dimensions/channels
  http.get(`${API_BASE}/dimensions/channels`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.dimensions.channels);
  }),

  // GET /api/dimensions/return-codes
  http.get(`${API_BASE}/dimensions/return-codes`, () => {
    const data = getCurrentScenarioData();
    return HttpResponse.json(data.dimensions.returnCodes);
  }),

  // ============================================
  // Scenario Management Endpoints
  // ============================================
  
  // POST /api/scenarios/switch
  http.post(`${API_BASE}/scenarios/switch`, async ({ request }) => {
    const body = await request.json() as { scenarioId: ScenarioId };
    // The actual switching is handled by localStorage in the client
    // This endpoint just confirms the switch
    return HttpResponse.json({ success: true, scenarioId: body.scenarioId });
  }),
];

