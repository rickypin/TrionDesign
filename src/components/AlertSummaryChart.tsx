/**
 * Alert Summary Chart Component
 * Displays the main metric progression chart with alert markers
 */

import React from 'react';
import { AlertTriangle, Clock, Timer } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
} from 'recharts';
import { Card, CustomReferenceLabel } from '@/components';
import { formatDate } from '@/utils/format';
import { CHART_COLORS } from '@/config/chartColors';
import { getCartesianGridConfig, getTooltipContentStyle } from '@/config/chartConfig';
import type { ResponseRateData } from '@/types';
import type { AlertMetadata } from '@/types/alert';

interface ChartConfig {
  yAxisDomain: [number, number];
  yAxisTickFormatter: (v: number) => string;
  tooltipFormatter: (v: number | string) => string;
  lineName: string;
}

interface AlertSummaryChartProps {
  alertMetadata: AlertMetadata;
  responseRate: ResponseRateData[];
  chartConfig: ChartConfig;
  resolvedTheme: string;
}

export const AlertSummaryChart: React.FC<AlertSummaryChartProps> = ({
  alertMetadata,
  responseRate,
  chartConfig,
  resolvedTheme,
}) => {
  return (
    <Card>
      {/* Alert Header with Time Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 border-b border-neutral-200/70 dark:border-neutral-700">
        <div className="flex items-center gap-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-600 dark:bg-red-600">
            <AlertTriangle className="h-4 w-4 text-white" />
            <span className="text-xs font-bold text-white tracking-wide">CRITICAL</span>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">SPV =</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{alertMetadata.spv}</span>
              <span className="text-neutral-400 dark:text-neutral-500 mx-0.5">·</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Component =</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{alertMetadata.component}</span>
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {alertMetadata.title}
            </span>
          </div>
        </div>

        {/* Time Information */}
        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200/50 dark:border-neutral-600/40">
            <Clock className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
            <span className="text-neutral-600 dark:text-neutral-400">Triggered:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {alertMetadata.duration.startDate && formatDate(alertMetadata.duration.startDate)} {alertMetadata.duration.start}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200/50 dark:border-neutral-600/40">
            <Timer className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
            <span className="text-neutral-600 dark:text-neutral-400">Duration:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{alertMetadata.duration.durationMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Metric Progression Chart */}
      <div className="px-4 pb-3 pt-3">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseRate} margin={{ left: 8, right: 8, top: 32, bottom: 8 }} syncId="timeSeriesSync">
              <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
              <XAxis dataKey="t" />
              <YAxis domain={chartConfig.yAxisDomain} tickFormatter={chartConfig.yAxisTickFormatter} />
              <Tooltip
                formatter={(value: any, name: string, props: any) => {
                  // For baseline range, show the range instead of individual values
                  if (name === 'Baseline Range') {
                    const upper = props.payload.baselineUpper;
                    const lower = props.payload.baselineLower;
                    if (upper && lower) {
                      return [chartConfig.tooltipFormatter(lower) + ' - ' + chartConfig.tooltipFormatter(upper), name];
                    }
                  }
                  // Filter out baselineLower from tooltip (already shown in range)
                  if (name === 'baselineLower') {
                    return null;
                  }
                  return chartConfig.tooltipFormatter(value);
                }}
                contentStyle={getTooltipContentStyle(resolvedTheme)}
                labelStyle={{
                  color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                }}
              />
              <Legend />
              {/* Alert window - from trigger to recovery (or end of data if still active) */}
              <ReferenceArea
                x1={alertMetadata.duration.start}
                x2={alertMetadata.duration.end || (responseRate.length > 0 ? responseRate[responseRate.length - 1].t : alertMetadata.duration.start)}
                fill="red"
                fillOpacity={0.1}
              />

              {/* Static Baseline Line (for response rate) */}
              {alertMetadata.baseline?.type === 'static' && alertMetadata.baseline.value && (
                <>
                  <ReferenceLine
                    y={alertMetadata.baseline.value}
                    stroke={resolvedTheme === 'dark' ? '#a8a29e' : '#78716c'}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    strokeOpacity={0.7}
                    label={{
                      value: 'Baseline',
                      position: 'right',
                      fill: resolvedTheme === 'dark' ? '#a8a29e' : '#78716c',
                      fontSize: 11,
                      fontWeight: 500
                    }}
                  />
                  {/* Invisible line for legend entry */}
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke={resolvedTheme === 'dark' ? '#a8a29e' : '#78716c'}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Baseline"
                    strokeOpacity={0}
                    legendType="line"
                  />
                </>
              )}

              {/* Dynamic Baseline Band (for transaction count) - render BEFORE main line */}
              {alertMetadata.baseline?.type === 'dynamic' && alertMetadata.baseline.data && (
                <>
                  {/* Filled area between upper and lower bounds */}
                  <Area
                    type="monotone"
                    dataKey="baselineUpper"
                    stroke="none"
                    fill={resolvedTheme === 'dark' ? '#78716c' : '#d6d3d1'}
                    fillOpacity={0.4}
                    legendType="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineLower"
                    stroke="none"
                    fill={resolvedTheme === 'dark' ? '#171717' : '#ffffff'}
                    fillOpacity={1}
                    legendType="none"
                  />
                  {/* Upper and lower bound lines */}
                  <Line
                    type="monotone"
                    dataKey="baselineUpper"
                    stroke={resolvedTheme === 'dark' ? '#a8a29e' : '#78716c'}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Baseline Range"
                    strokeOpacity={0.7}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineLower"
                    stroke={resolvedTheme === 'dark' ? '#a8a29e' : '#78716c'}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    legendType="none"
                    strokeOpacity={0.7}
                  />
                </>
              )}

              <Line type="monotone" dataKey="rate" name={chartConfig.lineName} stroke={CHART_COLORS.blue} dot={false} strokeWidth={2} />
              <ReferenceLine
                x={alertMetadata.duration.start}
                stroke={resolvedTheme === 'dark' ? '#f87171' : '#dc2626'}
                strokeWidth={2}
                strokeOpacity={0.7}
                label={<CustomReferenceLabel
                  value="Triggered"
                  icon="line"
                  fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                />}
              />
              <ReferenceLine
                x={alertMetadata.lowestPoint.time}
                stroke="transparent"
                label={<CustomReferenceLabel
                  value="Lowest Point"
                  icon="triangle"
                  fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                  metricValue={alertMetadata.lowestPoint.value}
                  metricUnit={alertMetadata.lowestPoint.unit}
                />}
              />
              {/* Lowest Point Marker on the curve */}
              <ReferenceDot
                x={alertMetadata.lowestPoint.time}
                y={alertMetadata.lowestPoint.value}
                r={6}
                fill={resolvedTheme === 'dark' ? '#dc2626' : '#dc2626'}
                stroke={resolvedTheme === 'dark' ? '#fca5a5' : '#ffffff'}
                strokeWidth={3}
                isFront={true}
              />
              {/* Only show Recovered line if status is recovered */}
              {alertMetadata.status === 'recovered' && alertMetadata.duration.end && (
                <ReferenceLine
                  x={alertMetadata.duration.end}
                  stroke={resolvedTheme === 'dark' ? '#f87171' : '#dc2626'}
                  strokeWidth={2}
                  strokeOpacity={0.7}
                  label={<CustomReferenceLabel
                    value="Recovered"
                    icon="line"
                    fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                  />}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

