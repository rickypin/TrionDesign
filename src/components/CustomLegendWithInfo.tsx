import React from 'react';
import { MetricInfoTooltip } from './MetricInfoTooltip';
import { getMetricConfigByDataKey } from '@/config/networkMetricsConfig';

interface CustomLegendWithInfoProps {
  payload?: any[];
}

export const CustomLegendWithInfo: React.FC<CustomLegendWithInfoProps> = ({
  payload,
}) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 pb-2">
      {payload.map((entry, index) => {
        const metricConfig = getMetricConfigByDataKey(entry.dataKey);

        return (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            {/* Color indicator */}
            <div
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            
            {/* Metric name */}
            <span className="text-xs text-neutral-700 dark:text-neutral-300">
              {entry.value}
            </span>
            
            {/* Info icon with tooltip */}
            {metricConfig && (
              <MetricInfoTooltip
                metricKey={metricConfig.key}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

