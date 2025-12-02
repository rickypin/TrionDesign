import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { Minimize2, Maximize2, AlertTriangle } from 'lucide-react';
import { CustomLegendWithInfo } from './CustomLegendWithInfo';
import { NetworkLayerTooltip } from './NetworkLayerTooltip';
import { getCartesianGridConfig, getTooltipContentStyle } from '@/config/chartConfig';
import type { NetworkHealthData, TcpHealthData } from "@/types";
import type { AlertMetadata } from "@/types/alert";

type MetricSummaryId = 'traffic' | 'availability' | 'performance';
type MetricDataset = 'network' | 'tcp';

interface MetricSummaryConfig {
  id: MetricSummaryId;
  label: string;
  subLabel: string;
  dataset: MetricDataset;
  key: string;
  unitSuffix?: string;
  reverse?: boolean;
  statusFrom?: 'availability' | 'performance';
  thresholdPercent?: number;
  thresholdAbsolute?: number;
  formatType?: 'default' | 'compact';
  normalCaption: string;
  alertCaption: string;
}

const METRIC_SUMMARY_CONFIG: MetricSummaryConfig[] = [
  {
    id: 'traffic',
    label: 'Traffic',
    subLabel: 'Throughput',
    dataset: 'network',
    key: 'newConnections',
    formatType: 'compact',
    thresholdPercent: 15,
    thresholdAbsolute: 400,
    normalCaption: 'Alert window traffic is aligned with the baseline.',
    alertCaption: 'Traffic volume dips inside the alert window, mirroring the alert.',
  },
  {
    id: 'availability',
    label: 'Availability',
    subLabel: 'TCP Setup',
    dataset: 'tcp',
    key: 'setup',
    unitSuffix: '%',
    reverse: true,
    statusFrom: 'availability',
    thresholdAbsolute: 1,
    normalCaption: 'Connection success remains within normal variance.',
    alertCaption: 'TCP setup success drops inside the alert window.',
  },
  {
    id: 'performance',
    label: 'Performance',
    subLabel: 'ReTx Rate',
    dataset: 'network',
    key: 'dupAck',
    unitSuffix: '%',
    statusFrom: 'performance',
    thresholdPercent: 80,
    normalCaption: 'Packet delivery order stays consistent with baseline.',
    alertCaption: 'Duplicate ACK bursts align with the alert window.',
  },
];

interface NetworkCorrelationSidebarProps {
  networkHealth: NetworkHealthData[];
  tcpHealth: TcpHealthData[];
  alertMetadata: AlertMetadata;
  hasImpact: boolean;
  details: {
    availability: 'healthy' | 'error';
    performance: 'healthy' | 'error';
  };
  resolvedTheme: string;
  formatNumber: (value: number) => string;
  CHART_COLORS: Record<string, string>;
  getReferenceAreaColor: (type: string) => string;
  getReferenceLineColor: (type: string) => { light: string; dark: string };
  onExpandChange?: (expanded: boolean) => void;
  serverIps?: string[];
}

export const NetworkCorrelationSidebar: React.FC<NetworkCorrelationSidebarProps> = ({
  networkHealth,
  tcpHealth,
  alertMetadata,
  hasImpact,
  details,
  resolvedTheme,
  formatNumber,
  CHART_COLORS,
  getReferenceAreaColor,
  getReferenceLineColor,
  onExpandChange,
  serverIps = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<'network' | 'tcp' | 'traffic'>(
    details.performance === 'error'
      ? 'network'
      : details.availability === 'error'
        ? 'tcp'
        : 'traffic'
  );

  const isHealthy = !hasImpact;

  const formatLargeNumber = React.useCallback((value: number) => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) {
      return `${sign}${formatNumber(absValue / 1_000_000)}M`;
    }
    if (absValue >= 1_000) {
      return `${sign}${formatNumber(absValue / 1_000)}k`;
    }
    return `${sign}${formatNumber(absValue)}`;
  }, [formatNumber]);

  const metricSummaries = React.useMemo(() => {
    if (!alertMetadata?.duration?.start) {
      return [];
    }

    const timeToMinutes = (time?: string | null) => {
      if (!time) return null;
      const [hours, minutes] = time.split(':');
      const h = Number(hours);
      const m = Number(minutes);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const alertStartMinutes = timeToMinutes(alertMetadata.duration.start);
    if (alertStartMinutes === null) {
      return [];
    }

    const rawEndMinutes = alertMetadata.duration.end ? timeToMinutes(alertMetadata.duration.end) : null;
    const alertEndMinutes = rawEndMinutes ?? Infinity;

    const splitSeries = <T extends { t: string }>(series: T[]) => {
      const baseline: T[] = [];
      const alertWindow: T[] = [];

      series.forEach((point) => {
        const minutes = timeToMinutes(point.t);
        if (minutes === null) return;
        if (minutes < alertStartMinutes) {
          baseline.push(point);
        } else if (minutes >= alertStartMinutes && minutes <= alertEndMinutes) {
          alertWindow.push(point);
        }
      });

      const fallback = series;

      return {
        baseline: baseline.length ? baseline : fallback,
        alert: alertWindow.length ? alertWindow : fallback,
      };
    };

    const networkSplit = splitSeries(networkHealth);
    const tcpSplit = splitSeries(tcpHealth);

    const calcAverage = <T extends Record<string, unknown>>(points: T[], key: string) => {
      if (!points.length) return 0;
      const total = points.reduce((sum, point) => sum + (Number(point[key]) || 0), 0);
      return total / points.length;
    };

    const formatValue = (value: number, config: MetricSummaryConfig) => {
      if (config.formatType === 'compact') {
        const compact = formatLargeNumber(value);
        return config.unitSuffix ? `${compact}${config.unitSuffix}` : compact;
      }

      const formatted = formatNumber(value);
      return config.unitSuffix ? `${formatted}${config.unitSuffix}` : formatted;
    };

    return METRIC_SUMMARY_CONFIG.map((config) => {
      const split = config.dataset === 'network' ? networkSplit : tcpSplit;
      const baselineAvg = calcAverage(split.baseline, config.key);
      const alertAvg = calcAverage(split.alert, config.key);
      const deltaValue = alertAvg - baselineAvg;
      const percentChange = baselineAvg === 0 ? null : (deltaValue / baselineAvg) * 100;

      const meetsPercent = percentChange !== null && config.thresholdPercent !== undefined
        ? Math.abs(percentChange) >= config.thresholdPercent
        : false;
      const meetsAbsolute = config.thresholdAbsolute !== undefined
        ? Math.abs(deltaValue) >= config.thresholdAbsolute
        : false;

      const changeSignificant = config.reverse
        ? (deltaValue < 0) && (meetsPercent || meetsAbsolute || percentChange === null)
        : (Math.abs(deltaValue) > 0 && (meetsPercent || meetsAbsolute || percentChange === null));

      const statusOverride = config.statusFrom === 'availability'
        ? details.availability === 'error'
        : config.statusFrom === 'performance'
          ? details.performance === 'error'
          : null;

      const isDegraded = statusOverride !== null
        ? statusOverride
        : (changeSignificant && !isHealthy);

      const baseText = `${formatValue(baselineAvg, config)} -> ${formatValue(alertAvg, config)}`;

      let deltaText = 'Delta 0';
      if (deltaValue !== 0) {
        const direction = deltaValue > 0 ? '+' : '-';
        const percentText = percentChange !== null
          ? ` (${deltaValue > 0 ? '+' : '-'}${formatNumber(Math.abs(percentChange))}%)`
          : '';
        deltaText = `Delta ${direction}${formatValue(Math.abs(deltaValue), config)}${percentText}`;
      }

      const statusBadgeClasses = isDegraded
        ? 'bg-amber-100/40 dark:bg-amber-400/10 text-amber-700 dark:text-amber-200'
        : 'bg-emerald-100/30 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-200';

      const hasMovement = isDegraded && Math.abs(deltaValue) > 0;
      const changeDirectionSymbol = hasMovement
        ? (deltaValue > 0 ? '↑' : '↓')
        : '→';

      const percentText = percentChange !== null
        ? `${deltaValue > 0 ? '+' : deltaValue < 0 ? '-' : ''}${formatNumber(Math.abs(percentChange))}%`
        : null;

      const changeSummary = hasMovement
        ? `${formatValue(Math.abs(deltaValue), config)}${percentText ? ` (${percentText})` : ''}`
        : `${formatValue(alertAvg, config)} (Stable band)`;

      const summaryText = isDegraded
        ? 'Alert window variance detected.'
        : 'Baseline aligned.';

      return {
        id: config.id,
        label: config.label,
        subLabel: config.subLabel,
        statusLabel: isDegraded ? 'Degraded' : 'Normal',
        statusBadgeClasses,
        deltaClass: isDegraded
          ? 'text-amber-700 dark:text-amber-200'
          : 'text-emerald-600 dark:text-emerald-200',
        arrowClass: isDegraded
          ? 'text-amber-600 dark:text-amber-200'
          : 'text-emerald-500 dark:text-emerald-200',
        cardClasses: isDegraded
          ? 'border border-amber-500/40 dark:border-amber-400/40 bg-amber-500/10 dark:bg-amber-400/10'
          : 'border border-emerald-500/40 dark:border-emerald-400/40 bg-emerald-500/10 dark:bg-emerald-400/5',
        changeDirectionSymbol,
        changeSummary,
        isStable: !hasMovement,
        metricName: config.subLabel,
        summaryText,
      };
    });
  }, [
    alertMetadata.duration.end,
    alertMetadata.duration.start,
    details.availability,
    details.performance,
    formatNumber,
    formatLargeNumber,
    isHealthy,
    networkHealth,
    tcpHealth,
  ]);

  // Handle expand/collapse and notify parent - wrapped in useCallback for stable reference
  const handleExpandToggle = React.useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange?.(expanded);
  }, [onExpandChange]);

  // Handle ESC key to close expanded view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleExpandToggle(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded, handleExpandToggle]);

  // Get status text
  const getStatusText = () => {
    if (isHealthy) {
      return {
        badge: 'Healthy',
        description: 'Network metrics show no correlation with the alert.',
        availability: 'Normal',
        performance: 'Normal',
      };
    } else {
      const issues = [];
      if (details.availability === 'error') issues.push('Availability degraded');
      if (details.performance === 'error') issues.push('Performance degraded');

      return {
        badge: 'Anomalies Detected',
        description: `Network issues detected and correlated with alert - ${issues.join(', ')}.`,
        availability: details.availability === 'error' ? 'Degraded' : 'Normal',
        performance: details.performance === 'error' ? 'Degraded' : 'Normal',
      };
    }
  };

  const statusInfo = getStatusText();

  // Get interpretation text based on active chart and status
  const getInterpretationText = () => {
    if (activeChart === 'tcp') {
      if (details.availability === 'error') {
        return 'TCP setup success rate dropped ~10 percentage points below normal, closely aligned with transaction volume decline';
      }
      return 'TCP connection establishment is stable with no impact on transaction metrics';
    } else if (activeChart === 'network') {
      if (details.performance === 'error') {
        return 'Retransmission and Duplicate ACK rise in tandem, indicating packet loss on the network path, closely aligned with declining transaction response rate';
      }
      return 'Network performance metrics are healthy with no impact on transaction metrics';
    } else {
      if (!isHealthy && hasImpact) {
        return 'New connection volume and throughput dip inside the alert window, mirroring the degraded business response rate.';
      }
      return 'Network traffic volume is aligned with the baseline window.';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Only show when NOT expanded */}
      {!isExpanded && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Network Correlation
            </h3>
            {/* Expand Button - Icon only */}
            <button
              onClick={() => handleExpandToggle(true)}
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="View Details"
            >
              <Maximize2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
          <div className="px-4 py-3">
            <div
              className={`inline-flex items-center justify-center w-full px-2.5 py-1 rounded-md ${
                isHealthy
                  ? 'bg-green-600 dark:bg-green-600'
                  : 'bg-amber-300 dark:bg-amber-300'
              }`}
            >
              <span className={`text-sm font-semibold ${
                isHealthy
                  ? 'text-white dark:text-white'
                  : 'text-neutral-900 dark:text-neutral-900'
              }`}>
                {statusInfo.badge}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Metric Summaries */}
      {!isExpanded && metricSummaries.length > 0 && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-1 gap-2">
            {metricSummaries.map((metric) => (
              <div
                key={metric.id}
                className={`rounded-lg px-4 py-3 ${metric.cardClasses}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {metric.label}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 ${metric.statusBadgeClasses}`}>
                    {metric.statusLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-xs font-medium text-neutral-700 dark:text-neutral-200">
                  <span>{metric.metricName}</span>
                  <span className={`mx-1.5 text-sm ${metric.arrowClass}`}>
                    {metric.changeDirectionSymbol}
                  </span>
                  <span className={`text-xs font-semibold ${metric.deltaClass}`}>
                    {metric.changeSummary}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {metric.summaryText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header with Title and Controls - Aligned with Alert Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 border-b border-neutral-200/70 dark:border-neutral-700">
            {/* Left: Title and Status Badge */}
            <div className="flex items-center gap-2 flex-1">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Network Correlation
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold ${
                  isHealthy
                    ? 'bg-green-600 dark:bg-green-600 text-white'
                    : 'bg-amber-300 dark:bg-amber-300 text-neutral-900 dark:text-neutral-900'
                }`}
              >
                {statusInfo.badge}
              </span>
            </div>

            {/* Right: Metric Tabs and Close Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveChart('traffic')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  activeChart === 'traffic'
                    ? 'bg-neutral-200 dark:bg-neutral-600 font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-600/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  hasImpact
                    ? 'bg-amber-400'
                    : 'bg-green-500'
                }`} />
                <span className="text-neutral-900 dark:text-neutral-100">
                  Traffic
                </span>
              </button>
              <button
                onClick={() => setActiveChart('tcp')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  activeChart === 'tcp'
                    ? 'bg-neutral-200 dark:bg-neutral-600 font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-600/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  details.availability === 'error'
                    ? 'bg-amber-400'
                    : 'bg-green-500'
                }`} />
                <span className="text-neutral-900 dark:text-neutral-100">
                  Availability
                </span>
              </button>
              <button
                onClick={() => setActiveChart('network')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  activeChart === 'network'
                    ? 'bg-neutral-200 dark:bg-neutral-600 font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-600/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  details.performance === 'error'
                    ? 'bg-amber-400'
                    : 'bg-green-500'
                }`} />
                <span className="text-neutral-900 dark:text-neutral-100">
                  Performance
                </span>
              </button>
              {/* Collapse Button - Icon only, matching expand button style */}
              <button
                onClick={() => handleExpandToggle(false)}
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Collapse Details"
              >
                <Minimize2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Chart Container - Reduced height to make room for interpretation */}
          <div className="px-4 pb-2 pt-3">
            <ResponsiveContainer width="100%" height={280}>
              {activeChart === 'tcp' ? (
                <LineChart data={tcpHealth} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} syncId="timeSeriesSync">
                  <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[95, 100]}
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 30]}
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <Tooltip
                    formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)}
                    contentStyle={getTooltipContentStyle(resolvedTheme)}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
                  />
                  <Legend
                    content={<CustomLegendWithInfo />}
                  />
                  <ReferenceArea
                    yAxisId="left"
                    x1={alertMetadata.duration.start}
                    x2={alertMetadata.duration.end || (tcpHealth.length > 0 ? tcpHealth[tcpHealth.length - 1].t : alertMetadata.duration.start)}
                    fill={getReferenceAreaColor('tcp')}
                    fillOpacity={0.1}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={alertMetadata.duration.start}
                    stroke={resolvedTheme === 'dark' ? getReferenceLineColor('tcp').dark : getReferenceLineColor('tcp').light}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                  />
                  {alertMetadata.duration.end && (
                    <ReferenceLine
                      yAxisId="left"
                      x={alertMetadata.duration.end}
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('tcp').dark : getReferenceLineColor('tcp').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                  )}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="setup"
                    stroke={CHART_COLORS.indigo}
                    strokeWidth={2.5}
                    dot={false}
                    name="TCP Setup Success Rate"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rst"
                    stroke={CHART_COLORS.pink}
                    strokeWidth={2.5}
                    dot={false}
                    name="TCP RST"
                  />
                </LineChart>
              ) : activeChart === 'traffic' ? (
                <LineChart data={networkHealth} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} syncId="timeSeriesSync">
                  <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => formatLargeNumber(v)}
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => formatLargeNumber(v)}
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <Tooltip
                    formatter={(value) => (typeof value === 'number' ? formatLargeNumber(value) : value)}
                    contentStyle={getTooltipContentStyle(resolvedTheme)}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
                  />
                  <Legend
                    content={<CustomLegendWithInfo />}
                  />
                  <ReferenceArea
                    yAxisId="left"
                    x1={alertMetadata.duration.start}
                    x2={alertMetadata.duration.end || (networkHealth.length > 0 ? networkHealth[networkHealth.length - 1].t : alertMetadata.duration.start)}
                    fill={getReferenceAreaColor('traffic')}
                    fillOpacity={0.1}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={alertMetadata.duration.start}
                    stroke={resolvedTheme === 'dark' ? getReferenceLineColor('traffic').dark : getReferenceLineColor('traffic').light}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                  />
                  {alertMetadata.duration.end && (
                    <ReferenceLine
                      yAxisId="left"
                      x={alertMetadata.duration.end}
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('traffic').dark : getReferenceLineColor('traffic').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                  )}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="newConnections"
                    stroke={CHART_COLORS.cyan}
                    strokeWidth={2.5}
                    dot={false}
                    name="New Connections"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="throughput"
                    stroke={CHART_COLORS.purple}
                    strokeWidth={2.5}
                    dot={false}
                    name="Throughput"
                  />
                </LineChart>
              ) : (
                <AreaChart data={networkHealth} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} syncId="timeSeriesSync">
                  <defs>
                    <linearGradient id="g1-expanded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity={0.35} />
                      <stop offset="100%" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <YAxis
                    domain={[0, 30]}
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 13, fill: resolvedTheme === 'dark' ? '#a3a3a3' : '#737373' }}
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#d4d4d4'}
                  />
                  <Tooltip
                    formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)}
                    contentStyle={getTooltipContentStyle(resolvedTheme)}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
                  />
                  <Legend
                    content={<CustomLegendWithInfo />}
                  />
                  <ReferenceArea
                    x1={alertMetadata.duration.start}
                    x2={alertMetadata.duration.end || (networkHealth.length > 0 ? networkHealth[networkHealth.length - 1].t : alertMetadata.duration.start)}
                    fill={getReferenceAreaColor('network')}
                    fillOpacity={0.1}
                  />
                  <ReferenceLine
                    x={alertMetadata.duration.start}
                    stroke={resolvedTheme === 'dark' ? getReferenceLineColor('network').dark : getReferenceLineColor('network').light}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                  />
                  {alertMetadata.duration.end && (
                    <ReferenceLine
                      x={alertMetadata.duration.end}
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('network').dark : getReferenceLineColor('network').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="loss"
                    name="Packet Loss"
                    stroke={CHART_COLORS.purple}
                    fill="url(#g1-expanded)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="retrans"
                    name="Retransmission"
                    stroke={CHART_COLORS.cyan}
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="dupAck"
                    name="Duplicate ACK"
                    stroke={CHART_COLORS.amber}
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Interpretation Section */}
          <div className="px-4 pb-3">
            <div className={`px-3 py-2.5 rounded-lg ${
              (activeChart === 'tcp' && details.availability === 'error') ||
              (activeChart === 'network' && details.performance === 'error')
                ? 'bg-amber-50/60 dark:bg-amber-800/35'
                : 'bg-green-50/60 dark:bg-green-900/25'
            }`}>
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 text-center flex items-center justify-center gap-2 flex-wrap">
                {((activeChart === 'tcp' && details.availability === 'error') ||
                  (activeChart === 'network' && details.performance === 'error')) && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                )}
                <span>{getInterpretationText()}</span>
                {((activeChart === 'tcp' && details.availability === 'error') ||
                  (activeChart === 'network' && details.performance === 'error')) && (
                  <>
                    <span className="text-neutral-500 dark:text-neutral-400">·</span>
                    <NetworkLayerTooltip serverIps={serverIps} componentName={alertMetadata.component}>
                      Investigate in network layer
                    </NetworkLayerTooltip>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

