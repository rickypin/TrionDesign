import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { Minimize2, Maximize2 } from 'lucide-react';
import { CustomLegendWithInfo } from './CustomLegendWithInfo';
import type { NetworkHealthData, TcpHealthData } from "@/types";
import type { AlertMetadata } from "@/types/alert";

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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<'network' | 'tcp'>(
    details.performance === 'error' ? 'network' : 'tcp'
  );

  const isHealthy = !hasImpact;

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
        badge: 'Normal',
        description: 'Network metrics show no correlation with response rate degradation.',
        availability: 'Normal',
        performance: 'Normal',
      };
    } else {
      const issues = [];
      if (details.availability === 'error') issues.push('Availability degraded');
      if (details.performance === 'error') issues.push('Performance degraded');
      
      return {
        badge: 'Impacted',
        description: `Network layer issues detected during alert period - ${issues.join(', ')}.`,
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
        return 'TCP Setup Failure leads to decreased transaction volume; TCP RST causes reduced transaction response rate';
      }
      return 'TCP connection establishment is stable with no impact on transaction metrics';
    } else {
      if (details.performance === 'error') {
        return 'Packet Loss, Retransmission and Duplicate ACK cause degraded transaction response time and response rate';
      }
      return 'Network performance metrics are healthy with no impact on transaction metrics';
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
                NETWORK STATUS
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                  isHealthy
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-300 text-amber-900 dark:bg-amber-500 dark:text-amber-950'
                }`}
              >
                {statusInfo.badge}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Summary Section - Only show when NOT expanded */}
      {!isExpanded && (
        <div
          className={`mx-4 mb-3 px-3 py-2.5 border-l-4 rounded-lg ${
            isHealthy
              ? 'bg-green-50/60 dark:bg-green-900/25 border-green-500 dark:border-green-400'
              : 'bg-amber-50/60 dark:bg-amber-800/35 border-amber-500 dark:border-amber-400'
          }`}
        >
          <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
            {statusInfo.description}
          </p>

          {/* Status Details */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Availability:</span>
              <span className={`text-xs font-medium ${
                details.availability === 'error'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-green-700 dark:text-green-400'
              }`}>
                {statusInfo.availability}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Performance:</span>
              <span className={`text-xs font-medium ${
                details.performance === 'error'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-green-700 dark:text-green-400'
              }`}>
                {statusInfo.performance}
              </span>
            </div>
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
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-300 text-amber-900 dark:bg-amber-500 dark:text-amber-950'
                }`}
              >
                {statusInfo.badge}
              </span>
            </div>

            {/* Right: Metric Tabs and Close Button */}
            <div className="flex items-center gap-2">
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#e5e5e5'}
                    strokeOpacity={resolvedTheme === 'dark' ? 0.5 : 0.5}
                  />
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
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#262626' : '#ffffff',
                      border: `1px solid ${resolvedTheme === 'dark' ? '#404040' : '#e5e5e5'}`,
                      borderRadius: '8px',
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717',
                    }}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
                  />
                  <Legend
                    content={
                      <CustomLegendWithInfo
                        chartType="tcp"
                        data={tcpHealth}
                        alertMetadata={alertMetadata}
                      />
                    }
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
                    name="TCP Setup Success %"
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
              ) : (
                <AreaChart data={networkHealth} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} syncId="timeSeriesSync">
                  <defs>
                    <linearGradient id="g1-expanded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity={0.35} />
                      <stop offset="100%" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#e5e5e5'}
                    strokeOpacity={resolvedTheme === 'dark' ? 0.5 : 0.5}
                  />
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
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#262626' : '#ffffff',
                      border: `1px solid ${resolvedTheme === 'dark' ? '#404040' : '#e5e5e5'}`,
                      borderRadius: '8px',
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717',
                    }}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
                  />
                  <Legend
                    content={
                      <CustomLegendWithInfo
                        chartType="network"
                        data={networkHealth}
                        alertMetadata={alertMetadata}
                      />
                    }
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
                : 'bg-blue-50/60 dark:bg-blue-900/25'
            }`}>
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 text-center">
                {getInterpretationText()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

