import type { LucideIcon } from "lucide-react";

// --- Data Types ---
export interface ResponseRateData {
  t: string;
  rate: number;
}

export interface NetworkHealthData {
  t: string;
  loss: number;
  retrans: number;
  dupAck: number;
}

export interface TcpHealthData {
  t: string;
  setup: number;
  rst: number;
}

export interface TransTypeData {
  type: string;
  cnt: number;
  previousCnt?: number;
  resp: number;
  previousSucc?: number;  // Previous success rate for baseline comparison
  time: number;
  succ: number;
  impact: number;
  outlierness: number;
}

export interface ClientData {
  ip: string;
  cnt: number;
  previousCnt?: number;
  resp: number;
  previousSucc?: number;  // Previous success rate for baseline comparison
  time: number;
  succ: number;
  impact: number;
  outlierness: number;
}

export interface ChannelData {
  channel: string;
  cnt: number;
  previousCnt?: number;
  resp: number;
  previousSucc?: number;  // Previous success rate for baseline comparison
  time: number;
  succ: number;
  impact: number;
}

export interface ServerData {
  ip: string;
  cnt: number;
  resp: number;
  previousSucc?: number;  // Previous success rate for baseline comparison
  time: number;
  succ: number;
  impact: number;
  outlierness: number;
}

export interface ReturnCodeData {
  code: number | string;
  cnt: number;
  previousCnt?: number;  // Previous transaction count for baseline comparison
  resp: number;
  previousSucc?: number;  // Previous success rate for baseline comparison
  time: number;
  succ: number;
  impact: number;
  outlierness?: number;
}

// --- Component Props Types ---
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string | React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
  iconColor?: 'red' | 'blue' | 'green' | 'neutral';
}

export interface KPIProps {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
  icon?: LucideIcon;
  tooltip?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  colorColumn?: keyof T;
  highlightValue?: string; // Value to highlight as primary factor
}

