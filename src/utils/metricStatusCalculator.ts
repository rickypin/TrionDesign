import type { MetricStatus, MetricThreshold, MetricStatusResult } from '@/types/networkMetrics';

export const calculateMetricStatus = (
  value: number,
  threshold: MetricThreshold
): MetricStatus => {
  const { warning, critical, reverse = false } = threshold;
  
  if (reverse) {
    // For metrics where higher is better (e.g., TCP Setup Success)
    if (value >= warning) return 'normal';
    if (value >= critical) return 'warning';
    return 'critical';
  } else {
    // For metrics where lower is better (e.g., Packet Loss)
    if (value < warning) return 'normal';
    if (value < critical) return 'warning';
    return 'critical';
  }
};

export const getStatusMessage = (
  status: MetricStatus,
  value: number,
  threshold: MetricThreshold,
  metricName: string,
  unit: string = '%'
): string => {
  const { warning, reverse = false } = threshold;

  if (status === 'normal') {
    return `Normal - ${metricName} ${value}${unit} (Normal ${reverse ? '≥' : '<'}${warning}${unit})`;
  } else if (status === 'warning') {
    return `Minor Impact - ${metricName} ${value}${unit} (Normal ${reverse ? '≥' : '<'}${warning}${unit})`;
  } else {
    return `Severe Impact - ${metricName} ${value}${unit} (Normal ${reverse ? '≥' : '<'}${warning}${unit})`;
  }
};

export const getMetricStatusResult = (
  value: number,
  threshold: MetricThreshold,
  metricName: string,
  unit: string = '%'
): MetricStatusResult => {
  const status = calculateMetricStatus(value, threshold);
  const message = getStatusMessage(status, value, threshold, metricName, unit);
  
  return {
    status,
    value,
    threshold,
    message,
  };
};

// Calculate average value from time series data
export const calculateAverageMetric = (
  data: any[],
  dataKey: string,
  startTime?: string,
  endTime?: string
): number => {
  let filteredData = data;
  
  // Filter by time range if provided
  if (startTime || endTime) {
    filteredData = data.filter(d => {
      if (startTime && d.t < startTime) return false;
      if (endTime && d.t > endTime) return false;
      return true;
    });
  }
  
  if (filteredData.length === 0) return 0;
  
  const sum = filteredData.reduce((acc, d) => acc + (d[dataKey] || 0), 0);
  return Number((sum / filteredData.length).toFixed(2));
};

