import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Activity, Server, Globe, BarChart3, Sun, Moon, Monitor, Clock, Timer } from "lucide-react";
import { motion } from "framer-motion";
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
} from "recharts";
import { Card, Table, NetworkCorrelationSidebar } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAlertData } from "@/hooks/useAlertData";
import { switchScenario, getCurrentScenario } from "@/api/alertApi";
import { formatNumber, formatDate } from "@/utils/format";
import { findOutliers } from "@/utils/tableColoring";
import type { ScenarioId } from "@/types/alert";

// IP Tooltip Component with smart positioning
const IPTooltip: React.FC<{ ip: string; children: React.ReactNode }> = ({ ip, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const hideTimer = useRef<number | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const openTooltip = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Estimated tooltip dimensions
      const tooltipWidth = 280;
      const tooltipHeight = 180;
      const gap = 4; // Smaller gap for closer positioning

      let top = rect.bottom + gap;
      let left = rect.left;

      // Horizontal positioning with boundary detection
      if (left + tooltipWidth > viewportWidth - 16) {
        // Align to right edge of trigger element
        left = rect.right - tooltipWidth;
      }

      // Ensure minimum left padding
      if (left < 16) {
        left = 16;
      }

      // Vertical positioning - prefer below, but check if space available
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < tooltipHeight + gap + 16 && spaceAbove > spaceBelow) {
        // Not enough space below and more space above - position above
        top = rect.top - tooltipHeight - gap;
      } else {
        // Default: position below
        top = rect.bottom + gap;
      }

      // Final boundary check
      if (top < 16) {
        top = 16;
      } else if (top + tooltipHeight > viewportHeight - 16) {
        top = viewportHeight - tooltipHeight - 16;
      }

      setPosition({ top, left });
    }
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowTooltip(true);
  };

  const scheduleClose = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowTooltip(false), 150);
  };

  return (
    <>
      <span
        ref={spanRef}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer underline underline-offset-2"
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
      >
        {children}
      </span>
      {showTooltip && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2.5 rounded-lg shadow-xl whitespace-nowrap bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
          onMouseEnter={openTooltip}
          onMouseLeave={scheduleClose}
        >
          <div className="text-sm space-y-1.5">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 rounded text-white text-[10px] font-bold">
                D
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Track {ip} in Dynatrace
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 rounded text-white text-[10px] font-bold">
                S
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Track {ip} in SolarWinds
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 rounded text-white text-[10px] font-bold">
                N
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Track {ip} in Netis NPM
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 rounded text-white text-[10px] font-bold">
                42
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Track {ip} in Netis 42
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// 明亮而优雅的配色池 - 避免告警色（红/绿）
const CHART_COLORS = {
  blue: '#3b82f6',      // 蓝色 - 清晰、专业
  purple: '#a855f7',    // 紫色 - 优雅、现代
  cyan: '#06b6d4',      // 青色 - 明亮、清新
  amber: '#f59e0b',     // 琥珀色 - 温暖、醒目
  pink: '#ec4899',      // 品红 - 活力、鲜明
  indigo: '#6366f1',    // 靛青 - 深邃、稳重
  // Network metrics colors
  packetLoss: '#ef4444',        // 红色 - Packet Loss
  retransmission: '#f97316',    // 橙色 - Retransmission
  duplicateAck: '#eab308',      // 黄色 - Duplicate ACK
  tcpSetupSuccess: '#60a5fa',   // 亮蓝色 - TCP Setup Success (更亮，更易见)
  tcpRst: '#fb923c',            // 亮橙色 - TCP RST (更亮，更易见)
} as const;

// Custom label component for reference lines with icons
const CustomReferenceLabel = ({
  viewBox,
  value,
  icon,
  fill,
  metricValue,
  metricUnit
}: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value: string;
  icon: 'line' | 'triangle';
  fill: string;
  metricValue?: number;
  metricUnit?: string;
}) => {
  if (!viewBox || viewBox.x === undefined || viewBox.y === undefined || viewBox.height === undefined) return null;

  const x = viewBox.x;

  // In Recharts coordinate system:
  // viewBox.y = top of the chart area
  // The 100% gridline is at viewBox.y
  // We need to place text and icon above this line
  const chartTop = viewBox.y;

  // Position elements above the 100% line
  const iconSize = 8;
  const iconCenterY = chartTop - 10; // Icon center 10px above the 100% line
  const textY = iconCenterY - 10; // Text baseline 10px above icon center

  // If metric value is provided, add extra space for the value text
  const hasMetricValue = metricValue !== undefined && metricUnit !== undefined;
  const valueTextY = hasMetricValue ? textY - 12 : textY; // Move label text up if showing value

  return (
    <g>
      {icon === 'line' ? (
        // Vertical line marker
        <line
          x1={x}
          y1={iconCenterY - iconSize / 2}
          x2={x}
          y2={iconCenterY + iconSize / 2}
          stroke={fill}
          strokeWidth={2}
        />
      ) : (
        // Downward triangle marker (pointing down)
        <polygon
          points={`${x},${iconCenterY + iconSize / 2} ${x - iconSize / 2},${iconCenterY - iconSize / 2} ${x + iconSize / 2},${iconCenterY - iconSize / 2}`}
          fill={fill}
        />
      )}
      {/* Label text */}
      <text
        x={x}
        y={valueTextY}
        textAnchor="middle"
        fill={fill}
        fontSize={11}
        fontWeight={600}
      >
        {value}
      </text>
      {/* Metric value text (if provided) */}
      {hasMetricValue && (
        <text
          x={x}
          y={textY}
          textAnchor="middle"
          fill={fill}
          fontSize={13}
          fontWeight={700}
        >
          {metricValue}{metricUnit}
        </text>
      )}
    </g>
  );
};

export default function App(): React.ReactElement {
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>(getCurrentScenario());
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [switchingScenario, setSwitchingScenario] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Fetch all alert data from API
  const {
    alertMetadata,
    dimensionConfig,
    scenarioStatus,
    responseRate: rawResponseRate,
    networkHealth,
    tcpHealth,
    transType,
    clients,
    servers,
    channels,
    returnCodes,
    loading,
    error,
    refresh,
  } = useAlertData();

  // Merge baseline data with response rate data
  const responseRate = React.useMemo(() => {
    if (!alertMetadata || !rawResponseRate) {
      return rawResponseRate || [];
    }

    if (alertMetadata.baseline?.type === 'dynamic' && alertMetadata.baseline.data) {
      // Create a map of baseline data by time
      const baselineMap = new Map(
        alertMetadata.baseline.data.map(b => [b.t, { baseline: b.baseline, upper: b.upper, lower: b.lower }])
      );

      // Merge baseline data into response rate data
      return rawResponseRate.map(d => ({
        ...d,
        baseline: baselineMap.get(d.t)?.baseline,
        baselineUpper: baselineMap.get(d.t)?.upper,
        baselineLower: baselineMap.get(d.t)?.lower,
      }));
    }
    return rawResponseRate;
  }, [rawResponseRate, alertMetadata]);

  // Find most impacted items using table coloring logic (outlier detection)
  const mostImpactedItems = React.useMemo(() => {
    interface MostImpactedItem {
      type: 'transType' | 'returnCode' | 'server' | 'client' | 'channel';
      name: string;
      impact: number;
    }

    const items: MostImpactedItem[] = [];

    // Find outliers in each dimension
    const transTypeOutliers = findOutliers(transType, 'impact');
    transTypeOutliers.forEach(item => {
      items.push({ type: 'transType', name: item.type, impact: item.impact });
    });

    const returnCodeOutliers = findOutliers(returnCodes, 'impact');
    returnCodeOutliers.forEach(item => {
      items.push({ type: 'returnCode', name: String(item.code), impact: item.impact });
    });

    const serverOutliers = findOutliers(servers, 'impact');
    serverOutliers.forEach(item => {
      items.push({ type: 'server', name: item.ip, impact: item.impact });
    });

    const clientOutliers = findOutliers(clients, 'impact');
    clientOutliers.forEach(item => {
      items.push({ type: 'client', name: item.ip, impact: item.impact });
    });

    const channelOutliers = findOutliers(channels, 'impact');
    channelOutliers.forEach(item => {
      items.push({ type: 'channel', name: item.channel, impact: item.impact });
    });

    // Sort by impact descending
    return items.sort((a, b) => b.impact - a.impact);
  }, [transType, returnCodes, servers, clients, channels]);



  // Handle scenario switch with proper error handling and race condition prevention
  const handleScenarioSwitch = React.useCallback(async (scenarioId: ScenarioId) => {
    // Prevent switching if already switching or if it's the same scenario
    if (switchingScenario || scenarioId === currentScenario) {
      return;
    }

    const previousScenario = currentScenario;

    try {
      setSwitchingScenario(true);
      setSwitchError(null);

      // First, switch the scenario in the backend
      await switchScenario(scenarioId);

      // Only update UI state after successful backend switch
      setCurrentScenario(scenarioId);
      setIsNetworkExpanded(false);

      // Refresh data after scenario switch
      await refresh();
    } catch (err) {
      console.error('Failed to switch scenario:', err);

      // Rollback to previous scenario on error
      setCurrentScenario(previousScenario);

      // Set error message for user feedback
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch scenario';
      setSwitchError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => setSwitchError(null), 5000);
    } finally {
      setSwitchingScenario(false);
    }
  }, [currentScenario, switchingScenario, refresh]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error || !alertMetadata || !scenarioStatus) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Error loading data: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  // Dynamic chart configuration based on metric type
  const getChartConfig = () => {
    switch (alertMetadata.metricType) {
      case 'transactionCount':
        return {
          yAxisDomain: [0, 1000] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}/m` : v),
          lineName: 'Transaction Count',
        };
      case 'responseRate':
        // S3 scenario (pmtud-black-hole) uses 70-100 range for better visualization
        const yAxisMinResponse = currentScenario === 'pmtud-black-hole' ? 70 : 50;
        return {
          yAxisDomain: [yAxisMinResponse, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
      case 'successRate':
        const yAxisMinSuccess = currentScenario === 'pmtud-black-hole' ? 70 : 50;
        return {
          yAxisDomain: [yAxisMinSuccess, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Success Rate',
        };
      case 'avgResponseTime':
        return {
          yAxisDomain: [0, 200] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}ms`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}ms` : v),
          lineName: 'Average Response Time',
        };
      default:
        return {
          yAxisDomain: [50, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
    }
  };

  const chartConfig = getChartConfig();

  // Dynamic success rate column configuration based on metric type
  const getSuccessRateColumnConfig = () => {
    switch (alertMetadata.metricType) {
      case 'successRate':
        return {
          title: 'Success Rate',
          tooltip: 'Success rate: baseline% → current% (↓ decline in percentage points)',
        };
      case 'responseRate':
      default:
        return {
          title: 'Response Rate',
          tooltip: 'Success rate: baseline% → current% (↓ decline in percentage points)',
        };
    }
  };

  const successRateColumnConfig = getSuccessRateColumnConfig();

  // Get reference area color based on network assessment status
  const getReferenceAreaColor = (chartType: string) => {
    if (chartType === 'network') {
      // Performance chart
      return scenarioStatus.networkAssessment.details.performance === 'error' ? '#f59e0b' : '#16a34a';
    } else {
      // Availability chart
      return scenarioStatus.networkAssessment.details.availability === 'error' ? '#f59e0b' : '#16a34a';
    }
  };

  const getReferenceLineColor = (chartType: string) => {
    const isError = chartType === 'network'
      ? scenarioStatus.networkAssessment.details.performance === 'error'
      : scenarioStatus.networkAssessment.details.availability === 'error';

    if (isError) {
      return {
        light: '#d97706', // amber-600
        dark: '#fbbf24'   // amber-400
      };
    } else {
      return {
        light: '#16a34a', // green-600
        dark: '#4ade80'   // green-400
      };
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-800/80 border-b border-neutral-200/70 dark:border-neutral-600/50">
        {/* Error Banner */}
        {switchError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span>{switchError}</span>
            </div>
          </div>
        )}

        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-baseline gap-2 sm:gap-3"
            >
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Trion
              </span>
              <span className="hidden sm:inline text-xl font-medium text-neutral-600 dark:text-neutral-400 uppercase">
                Intelligent Alert Analysis
              </span>
            </motion.div>

            {/* Scenario Switcher & Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Scenario Buttons */}
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={() => handleScenarioSwitch('app-gc')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'app-gc'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S1: App GC Scenario"
                >
                  <span className={currentScenario === 'app-gc' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S1
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('session-table-full')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'session-table-full'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S2: Session Table Full Scenario"
                >
                  <span className={currentScenario === 'session-table-full' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S2
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('pmtud-black-hole')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'pmtud-black-hole'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S3: PMTUD Black Hole Scenario"
                >
                  <span className={currentScenario === 'pmtud-black-hole' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S3
                  </span>
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => {
                  // 循环切换：light -> dark -> system
                  if (theme === 'light') setTheme('dark');
                  else if (theme === 'dark') setTheme('system');
                  else setTheme('light');
                }}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                title={theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
              >
                {theme === 'system' ? (
                  <Monitor className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                ) : resolvedTheme === 'dark' ? (
                  <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                ) : (
                  <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Alert Summary */}
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={resolvedTheme === 'dark' ? '#525252' : '#e5e5e5'}
                    strokeOpacity={resolvedTheme === 'dark' ? 0.5 : 0.5}
                  />
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
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#262626' : '#ffffff',
                      border: `1px solid ${resolvedTheme === 'dark' ? '#404040' : '#e5e5e5'}`,
                      borderRadius: '8px',
                      color: resolvedTheme === 'dark' ? '#fafafa' : '#171717'
                    }}
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

        {/* Responsive Layout: Business Impact (flex) + Network Correlation Sidebar (280px) */}
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4">
          {/* Business Impact - Takes remaining space on xl screens, full width on smaller screens */}
          {!isNetworkExpanded && (
            <Card className="flex-1 min-w-0">
            {/* Section Header */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Business Impact
              </h3>
            </div>

            {/* Summary Header - Most Impacted and Affected in one line */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
              <div className="flex flex-wrap items-center gap-3">
                {/* Most Impacted - Show all outlier items */}
                {mostImpactedItems.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                        Most Impacted:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {mostImpactedItems.map((item, index) => (
                          <div key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-300 dark:bg-amber-300">
                            <span className="text-xs text-neutral-900 dark:text-neutral-900">
                              {(() => {
                                switch (item.type) {
                                  case 'transType': return 'Trans Type';
                                  case 'returnCode': return 'Return Code';
                                  case 'server': return 'Server IP';
                                  case 'client': return 'Client IP';
                                  case 'channel': return 'Channel';
                                  default: return 'Dimension';
                                }
                              })()}
                            </span>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-900">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
                  </>
                )}

                {/* Affected - Always show regardless of primaryFactor */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Affected:</span>

                  {/* Trans Type Count */}
                  {transType.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700">
                      <BarChart3 className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {transType.length} Trans Type{transType.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Return Code Count */}
                  {returnCodes.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700">
                      <Activity className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {returnCodes.length} Return Code{returnCodes.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Channel Count */}
                  {channels.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700">
                      <BarChart3 className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {channels.length} Channel{channels.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Server IP Count */}
                  {servers.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700">
                      <Server className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {servers.length} Server IP{servers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Client IP Count */}
                  {clients.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700">
                      <Globe className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">
                        {clients.length} Client IP{clients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Tables - Responsive Layout */}
            <div className="p-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {/* Channel Table - Only show if channel dimension is enabled */}
                {dimensionConfig?.dimensions.find(d => d.id === 'channel')?.enabled && channels.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
                        <BarChart3 className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                      </div>
                      <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Channel</h4>
                    </div>
                    <Table
                      keyField="channel"
                      colorColumn="impact"
                      defaultSortColumn="impact"
                      defaultSortDirection="desc"
                      columns={[
                        { key: "channel", title: "Channel", tooltip: "Channel Name", sortable: false },
                        {
                          key: "cnt",
                          title: "Transaction Volume",
                          tooltip: "Transaction count: baseline → current (Δ = change)",
                          sortValue: (row) => Number(row.cnt),
                          render: (v, row) => {
                            const current = Number(v);
                            const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                            const delta = current - previous;
                            return `${previous.toLocaleString()} → ${current.toLocaleString()} (Δ ${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
                          }
                        },
                        {
                          key: "succ",
                          title: successRateColumnConfig.title,
                          tooltip: successRateColumnConfig.tooltip,
                          sortValue: (row) => Number(row.succ),
                          render: (v, row) => {
                            const currentRate = Number(v);
                            const previousRate = row.previousSucc !== undefined ? row.previousSucc : currentRate;
                            const decline = Math.max(0, previousRate - currentRate);
                            return `${formatNumber(previousRate)}% → ${formatNumber(currentRate)}% (↓${formatNumber(decline)}pp)`;
                          }
                        },
                        {
                          key: "impact",
                          title: "Impact",
                          render: (v) => `${formatNumber(v)}%`,
                          tooltip: "Contribution to total new failures in this incident",
                          sortValue: (row) => Number(row.impact)
                        },
                      ]}
                      data={channels}
                    />
                  </div>
                )}

                {/* Trans Type Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
                      <BarChart3 className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Trans Type</h4>
                  </div>
                  <Table
                    keyField="type"
                    colorColumn="impact"
                    defaultSortColumn="impact"
                    defaultSortDirection="desc"
                    columns={[
                      { key: "type", title: "Trans Type", tooltip: "Transaction Type", sortable: false },
                      {
                        key: "cnt",
                        title: "Transaction Volume",
                        tooltip: "Transaction count: baseline → current (Δ = change)",
                        sortValue: (row) => Number(row.cnt),
                        render: (v, row) => {
                          const current = Number(v);
                          const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                          const delta = current - previous;
                          return `${previous.toLocaleString()} → ${current.toLocaleString()} (Δ ${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
                        }
                      },
                      {
                        key: "succ",
                        title: successRateColumnConfig.title,
                        tooltip: successRateColumnConfig.tooltip,
                        sortValue: (row) => Number(row.succ),
                        render: (v, row) => {
                          const currentRate = Number(v);
                          const previousRate = row.previousSucc !== undefined ? row.previousSucc : currentRate;
                          const decline = Math.max(0, previousRate - currentRate);
                          return `${formatNumber(previousRate)}% → ${formatNumber(currentRate)}% (↓${formatNumber(decline)}pp)`;
                        }
                      },
                      {
                        key: "impact",
                        title: "Impact",
                        render: (v) => `${formatNumber(v)}%`,
                        tooltip: "Contribution to total new failures in this incident",
                        sortValue: (row) => Number(row.impact)
                      },
                    ]}
                    data={transType}
                  />
                </div>

                {/* Return Code Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
                      <Activity className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Return Code</h4>
                  </div>
                  <Table
                    keyField="code"
                    colorColumn="impact"
                    defaultSortColumn="impact"
                    defaultSortDirection="desc"
                    columns={[
                      {
                        key: "code",
                        title: "Return Code",
                        tooltip: "Transaction return code",
                        sortable: false
                      },
                      {
                        key: "cnt",
                        title: "Transaction Volume",
                        tooltip: "Transaction count: baseline → current (Δ = change)",
                        sortValue: (row) => Number(row.cnt),
                        render: (v, row) => {
                          const current = Number(v);
                          const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                          const delta = current - previous;
                          return `${previous.toLocaleString()} → ${current.toLocaleString()} (Δ ${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
                        }
                      },
                      {
                        key: "succ",
                        title: successRateColumnConfig.title,
                        tooltip: successRateColumnConfig.tooltip,
                        sortValue: (row) => Number(row.succ),
                        render: (v, row) => {
                          const currentRate = Number(v);
                          const previousRate = row.previousSucc !== undefined ? row.previousSucc : currentRate;
                          const decline = Math.max(0, previousRate - currentRate);
                          return `${formatNumber(previousRate)}% → ${formatNumber(currentRate)}% (↓${formatNumber(decline)}pp)`;
                        }
                      },
                      {
                        key: "impact",
                        title: "Impact",
                        render: (v) => `${formatNumber(v)}%`,
                        tooltip: "Contribution to total new failures in this incident",
                        sortValue: (row) => Number(row.impact)
                      },
                    ]}
                    data={returnCodes}
                  />
                </div>

                {/* Server IP Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
                      <Server className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Server IP</h4>
                  </div>
                  <Table
                    keyField="ip"
                    colorColumn="impact"
                    defaultSortColumn="impact"
                    defaultSortDirection="desc"
                    columns={[
                      {
                        key: "ip",
                        title: "Server IP",
                        tooltip: "Server IP Address",
                        render: (v) => <IPTooltip ip={v}>{v}</IPTooltip>,
                        sortable: false
                      },
                      {
                        key: "cnt",
                        title: "Transaction Volume",
                        tooltip: "Transaction count: baseline → current (Δ = change)",
                        sortValue: (row) => Number(row.cnt),
                        render: (v, row) => {
                          const current = Number(v);
                          const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                          const delta = current - previous;
                          return `${previous.toLocaleString()} → ${current.toLocaleString()} (Δ ${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
                        }
                      },
                      {
                        key: "succ",
                        title: successRateColumnConfig.title,
                        tooltip: successRateColumnConfig.tooltip,
                        sortValue: (row) => Number(row.succ),
                        render: (v, row) => {
                          const currentRate = Number(v);
                          const previousRate = row.previousSucc !== undefined ? row.previousSucc : currentRate;
                          const decline = Math.max(0, previousRate - currentRate);
                          return `${formatNumber(previousRate)}% → ${formatNumber(currentRate)}% (↓${formatNumber(decline)}pp)`;
                        }
                      },
                      {
                        key: "impact",
                        title: "Impact",
                        render: (v) => `${formatNumber(v)}%`,
                        tooltip: "Contribution to total new failures in this incident",
                        sortValue: (row) => Number(row.impact)
                      },
                    ]}
                    data={servers}
                  />
                </div>

                {/* Client IP Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
                      <Globe className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Client IP</h4>
                  </div>
                  <Table
                    keyField="ip"
                    colorColumn="impact"
                    defaultSortColumn="impact"
                    defaultSortDirection="desc"
                    columns={[
                      {
                        key: "ip",
                        title: "Client IP",
                        tooltip: "Client IP Address",
                        render: (v) => <IPTooltip ip={v}>{v}</IPTooltip>,
                        sortable: false
                      },
                      {
                        key: "cnt",
                        title: "Transaction Volume",
                        tooltip: "Transaction count: baseline → current (Δ = change)",
                        sortValue: (row) => Number(row.cnt),
                        render: (v, row) => {
                          const current = Number(v);
                          const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                          const delta = current - previous;
                          return `${previous.toLocaleString()} → ${current.toLocaleString()} (Δ ${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
                        }
                      },
                      {
                        key: "succ",
                        title: successRateColumnConfig.title,
                        tooltip: successRateColumnConfig.tooltip,
                        sortValue: (row) => Number(row.succ),
                        render: (v, row) => {
                          const currentRate = Number(v);
                          const previousRate = row.previousSucc !== undefined ? row.previousSucc : currentRate;
                          const decline = Math.max(0, previousRate - currentRate);
                          return `${formatNumber(previousRate)}% → ${formatNumber(currentRate)}% (↓${formatNumber(decline)}pp)`;
                        }
                      },
                      {
                        key: "impact",
                        title: "Impact",
                        render: (v) => `${formatNumber(v)}%`,
                        tooltip: "Contribution to total new failures in this incident",
                        sortValue: (row) => Number(row.impact)
                      },
                    ]}
                    data={clients}
                  />
                </div>
              </div>
            </div>
          </Card>
          )}

          {/* Network Correlation - Sidebar Version (Fixed 280px width on xl screens) or Full Width when expanded */}
          <Card className={isNetworkExpanded ? "flex-1" : "xl:w-[280px] xl:flex-shrink-0"}>
            {/* Sidebar Network Correlation Component */}
            <NetworkCorrelationSidebar
              networkHealth={networkHealth}
              tcpHealth={tcpHealth}
              alertMetadata={alertMetadata}
              hasImpact={scenarioStatus.networkAssessment.hasImpact}
              details={scenarioStatus.networkAssessment.details}
              resolvedTheme={resolvedTheme}
              formatNumber={formatNumber}
              CHART_COLORS={CHART_COLORS}
              getReferenceAreaColor={getReferenceAreaColor}
              getReferenceLineColor={getReferenceLineColor}
              onExpandChange={setIsNetworkExpanded}
            />
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-neutral-500 text-center py-6">Demo view · Modern, minimal & clear · Built with React + Tailwind + Recharts</div>
      </main>
    </div>
  );
}

