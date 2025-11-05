import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { getCartesianGridConfig, getTooltipContentStyle } from '@/config/chartConfig';
import type { NetworkHealthData, TcpHealthData } from "@/types";
import type { AlertMetadata } from "@/types/alert";

interface NetworkCorrelationCompactProps {
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
}

export const NetworkCorrelationCompact: React.FC<NetworkCorrelationCompactProps> = ({
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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<'network' | 'tcp'>(
    details.performance === 'error' ? 'network' : 'tcp'
  );

  const isHealthy = !hasImpact;

  return (
    <div className="space-y-3">
      {/* Compact Summary Section */}
      <div className={`mx-3 px-3 py-2.5 border-l-4 rounded-lg ${
        isHealthy
          ? 'bg-green-50/60 dark:bg-green-900/25 border-green-500 dark:border-green-400'
          : 'bg-amber-50/60 dark:bg-amber-800/35 border-amber-500 dark:border-amber-400'
      }`}>
        <div className="space-y-2">
          {/* Header with Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isHealthy
                  ? 'text-green-700 dark:text-green-200'
                  : 'text-amber-700 dark:text-amber-200'
              }`}>
                Network Status
              </span>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                isHealthy
                  ? 'bg-green-600 dark:bg-green-600'
                  : 'bg-amber-300 dark:bg-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy
                    ? 'bg-white'
                    : 'bg-neutral-900'
                }`} />
                <span className={`text-xs font-bold ${
                  isHealthy ? 'text-white' : 'text-neutral-900'
                }`}>
                  {isHealthy ? 'Normal' : 'Impacted'}
                </span>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            >
              {isExpanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>View Details</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Summary Text */}
          <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
            {isHealthy ? (
              <>
                Network metrics show <span className="font-medium text-green-700 dark:text-green-300">no correlation</span> with response rate degradation.
                Availability: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>,
                Performance: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>.
              </>
            ) : (
              <>
                Network layer issues detected during alert period -
                {details.availability === 'error' && <span className="font-medium text-amber-700 dark:text-amber-300"> Availability degraded</span>}
                {details.availability === 'error' && details.performance === 'error' && ', '}
                {details.performance === 'error' && <span className="font-medium text-amber-700 dark:text-amber-300"> Performance degraded</span>}.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Metrics Toggle */}
          <div className="px-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                Metrics:
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveChart('tcp')}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                    activeChart === 'tcp'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    details.availability === 'error'
                      ? 'bg-amber-300 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-400/60'
                      : 'bg-green-500 ring-2 ring-green-200 dark:ring-green-800'
                  }`} />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    Availability
                  </span>
                </button>
                <button
                  onClick={() => setActiveChart('network')}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                    activeChart === 'network'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    details.performance === 'error'
                      ? 'bg-amber-300 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-400/60'
                      : 'bg-green-500 ring-2 ring-green-200 dark:ring-green-800'
                  }`} />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    Performance
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="px-3">
            <div className="h-[180px]">
              {activeChart === 'network' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={networkHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                    <defs>
                      <linearGradient id="g1-compact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopOpacity={0.35} />
                        <stop offset="100%" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
                    <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 30]} tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)}
                      contentStyle={{
                        ...getTooltipContentStyle(resolvedTheme),
                        fontSize: '11px'
                      }}
                      labelStyle={{
                        color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceArea
                      x1={alertMetadata.duration.start}
                      x2={alertMetadata.duration.end || (networkHealth.length > 0 ? networkHealth[networkHealth.length - 1].t : alertMetadata.duration.start)}
                      fill={getReferenceAreaColor('network')}
                      fillOpacity={0.1}
                    />
                    <Area type="monotone" dataKey="loss" name="Packet Loss" stroke={CHART_COLORS.purple} fill="url(#g1-compact)" strokeWidth={2} />
                    <Area type="monotone" dataKey="retrans" name="Retransmission" stroke={CHART_COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="dupAck" name="Duplicate ACK" stroke={CHART_COLORS.amber} fillOpacity={0.2} strokeWidth={2} />
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
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tcpHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                    <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
                    <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" domain={[95, 100]} tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v, name) => {
                        if (typeof v === "number") {
                          return formatNumber(v);
                        }
                        return v;
                      }}
                      contentStyle={{
                        ...getTooltipContentStyle(resolvedTheme),
                        fontSize: '11px'
                      }}
                      labelStyle={{
                        color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
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
                    <Line yAxisId="left" type="monotone" dataKey="setup" name="TCP Setup Success Rate" stroke={CHART_COLORS.indigo} dot={false} strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="rst" name="TCP RST" stroke={CHART_COLORS.pink} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

