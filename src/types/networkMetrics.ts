import type { LucideIcon } from 'lucide-react';

export type MetricKey = 'packetLoss' | 'retransmission' | 'duplicateAck' | 'tcpSetup' | 'tcpRst';

export type MetricStatus = 'normal' | 'warning' | 'critical';

export interface MetricThreshold {
  warning: number;
  critical: number;
  reverse?: boolean; // true for metrics where higher is better (e.g., TCP Setup)
}

export interface MetricInfo {
  key: MetricKey;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  definition: string;
  explanation: string;
  impact: string[];
  threshold: MetricThreshold;
  possibleCauses: string[];
  normalMessage?: string;
}

export interface MetricStatusResult {
  status: MetricStatus;
  value: number;
  threshold: MetricThreshold;
  message: string;
}

