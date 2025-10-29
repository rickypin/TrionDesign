/**
 * Alert-related type definitions for API-driven data
 */

// ============================================
// Alert Metadata Types
// ============================================

export type MetricType = 'responseRate' | 'transactionCount' | 'avgResponseTime' | 'successRate';

export interface AlertCondition {
  metric: string;           // e.g., "Response Rate"
  operator: '<' | '>' | '=' | '<=' | '>=';
  threshold: number;        // e.g., 85
  unit: '%' | 'ms' | 'count' | '/m' | '';
}

export interface AlertDuration {
  start: string;            // e.g., "21:27"
  end: string;              // e.g., "21:32"
  durationMinutes: number;  // e.g., 6
}

export interface AlertLowestPoint {
  value: number;            // e.g., 77.4
  time: string;             // e.g., "21:30"
  unit: string;             // e.g., "%"
}

export interface AlertRecoveryInfo {
  time: string;             // e.g., "21:33"
  value: number;            // e.g., 100
}

export type AlertStatus = 'active' | 'recovered' | 'acknowledged';

export interface BaselineConfig {
  type: 'static' | 'dynamic';
  value?: number;           // For static baseline (e.g., 100 for response rate)
  data?: Array<{            // For dynamic baseline (e.g., transaction count)
    t: string;              // Time
    baseline: number;       // Baseline value
    upper?: number;         // Upper bound (optional)
    lower?: number;         // Lower bound (optional)
  }>;
}

export interface AlertMetadata {
  // Alert identification
  spv: string;              // e.g., "New Credit Card System"
  component: string;        // e.g., "OpenShift"
  title: string;            // e.g., "Response rate dropped"

  // Alert metric type
  metricType: MetricType;

  // Baseline configuration
  baseline?: BaselineConfig;

  // Alert condition
  condition: AlertCondition;

  // Time information
  duration: AlertDuration;

  // Key metrics
  lowestPoint: AlertLowestPoint;

  // Status
  status: AlertStatus;
  recoveryInfo?: AlertRecoveryInfo;

  // Context description (e.g., "Business & Infrastructure contributors at 21:30...")
  contextDescription?: string;
}

// ============================================
// Dimension Configuration Types
// ============================================

export type DimensionId = 'transType' | 'serverIp' | 'clientIp' | 'channel' | 'returnCode';

export interface DimensionDefinition {
  id: DimensionId;
  name: string;             // Display name, e.g., "Trans Type", "Server IP"
  enabled: boolean;         // Whether this dimension is enabled
  dataEndpoint: string;     // API endpoint for data
  keyField: string;         // Primary key field name
  colorColumn?: string;     // Column used for coloring
}

export interface DimensionConfig {
  dimensions: DimensionDefinition[];
}

// ============================================
// Scenario Status Types
// ============================================

export type HealthStatus = 'healthy' | 'error';

export interface NetworkAssessmentStatus {
  hasImpact: boolean;
  status: HealthStatus;
  details: {
    availability: HealthStatus;
    performance: HealthStatus;
  };
}

export interface BusinessInfraBreakdownStatus {
  status: HealthStatus;
  primaryFactor?: {
    dimension: DimensionId;
    value: string;          // e.g., "Normal Purchase", "10.10.16.30"
  };
}

export interface ScenarioStatus {
  networkAssessment: NetworkAssessmentStatus;
  businessInfraBreakdown: BusinessInfraBreakdownStatus;
}

// ============================================
// Complete Alert Data (aggregated response)
// ============================================

export interface AlertData {
  metadata: AlertMetadata;
  dimensionConfig: DimensionConfig;
  status: ScenarioStatus;
}

// ============================================
// Scenario Types
// ============================================

export type ScenarioId = 'app-gc' | 'session-table-full' | 'pmtud-black-hole';

export interface ScenarioInfo {
  id: ScenarioId;
  name: string;
  description: string;
}

