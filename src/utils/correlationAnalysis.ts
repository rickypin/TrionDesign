import type { TransTypeData, ServerData, ClientData } from "@/types";

export interface CorrelationInsight {
  conclusion: string;
  primaryFactor: {
    type: 'transType' | 'server' | 'client' | 'distributed';
    name: string;
    impact: number;
  };
  distribution: {
    servers: 'concentrated' | 'distributed';
    clients: 'concentrated' | 'distributed';
    transTypes: 'concentrated' | 'distributed';
  };
  recommendation: string;
}

/**
 * Analyze correlation data to determine the primary factor and distribution pattern
 */
export function analyzeCorrelation(
  transTypes: TransTypeData[],
  servers: ServerData[],
  clients: ClientData[]
): CorrelationInsight {
  // Calculate distribution patterns
  const serverDistribution = calculateDistribution(servers.map(s => s.impact));
  const clientDistribution = calculateDistribution(clients.map(c => c.impact));
  const transTypeDistribution = calculateDistribution(transTypes.map(t => t.impact));

  // Find the highest impact item in each category
  const topTransType = transTypes.reduce((max, t) => t.impact > max.impact ? t : max, transTypes[0]);
  const topServer = servers.reduce((max, s) => s.impact > max.impact ? s : max, servers[0]);
  const topClient = clients.reduce((max, c) => c.impact > max.impact ? c : max, clients[0]);

  // Determine primary factor based on:
  // 1. Concentration level (if one dimension is concentrated, it's likely the cause)
  // 2. Impact magnitude
  let primaryFactor: CorrelationInsight['primaryFactor'];
  let conclusion: string;
  let recommendation: string;

  // Check if issue is distributed across servers and clients but concentrated in trans type
  if (
    transTypeDistribution === 'concentrated' &&
    serverDistribution === 'distributed' &&
    clientDistribution === 'distributed'
  ) {
    primaryFactor = {
      type: 'transType',
      name: topTransType.type,
      impact: topTransType.impact
    };
    conclusion = `${topTransType.type} accounts for ${topTransType.impact.toFixed(1)}% of timed-out transactions. Issue affects all Servers and Clients uniformly - not infrastructure-related.`;
    recommendation = `Focus on cross-system tracing of "${topTransType.type}" service to identify root cause.`;
  }
  // Check if issue is concentrated in specific server
  else if (serverDistribution === 'concentrated') {
    primaryFactor = {
      type: 'server',
      name: topServer.ip,
      impact: topServer.impact
    };
    conclusion = `Server ${topServer.ip} accounts for ${topServer.impact.toFixed(1)}% of timed-out transactions. Other servers show normal behavior - indicates server-specific issue.`;
    recommendation = `Investigate Server ${topServer.ip} for resource constraints, configuration issues, or service degradation.`;
  }
  // Check if issue is concentrated in specific client
  else if (clientDistribution === 'concentrated') {
    primaryFactor = {
      type: 'client',
      name: topClient.ip,
      impact: topClient.impact
    };
    conclusion = `Client ${topClient.ip} accounts for ${topClient.impact.toFixed(1)}% of timed-out transactions. Other clients show normal behavior - indicates client-specific issue.`;
    recommendation = `Investigate Client ${topClient.ip} for network issues, configuration problems, or client-side bottlenecks.`;
  }
  // Issue is distributed across all dimensions
  else {
    primaryFactor = {
      type: 'distributed',
      name: 'Multiple factors',
      impact: Math.max(topTransType.impact, topServer.impact, topClient.impact)
    };
    conclusion = `Timeouts distributed evenly across all Servers, Clients, and Services. No single dominant factor - suggests systemic issue.`;
    recommendation = `Conduct comprehensive analysis across all dimensions. Check for systemic issues like network infrastructure or shared dependencies.`;
  }

  return {
    conclusion,
    primaryFactor,
    distribution: {
      servers: serverDistribution,
      clients: clientDistribution,
      transTypes: transTypeDistribution
    },
    recommendation
  };
}

/**
 * Determine if impact values are concentrated or distributed
 * Concentrated: one value is significantly higher than others (>60% of total or >2x the next highest)
 * Distributed: values are relatively even
 */
function calculateDistribution(impacts: number[]): 'concentrated' | 'distributed' {
  if (impacts.length <= 1) return 'concentrated';

  const sorted = [...impacts].sort((a, b) => b - a);
  const highest = sorted[0];
  const secondHighest = sorted[1] || 0;
  const total = impacts.reduce((sum, v) => sum + v, 0);

  // If highest is more than 60% of total, it's concentrated
  if (highest / total > 0.6) return 'concentrated';

  // If highest is more than 2x the second highest, it's concentrated
  if (highest > secondHighest * 2) return 'concentrated';

  // If the difference between highest and lowest is less than 8%, it's distributed
  const lowest = sorted[sorted.length - 1];
  if (highest - lowest < 8) return 'distributed';

  return 'distributed';
}

