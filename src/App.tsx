import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Activity, Server, Globe, BarChart3, Zap, Layers, Sun, Moon, Monitor, ArrowDown, TrendingDown, Clock, CheckCircle, Gauge, Target, Info, Timer } from "lucide-react";
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
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card, SectionHeader, KPI, Table, CorrelationInsight, NetworkAssessment } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAlertData } from "@/hooks/useAlertData";
import { switchScenario, getCurrentScenario } from "@/api/alertApi";
import { formatNumber } from "@/utils/format";
import { analyzeCorrelation } from "@/utils/correlationAnalysis";
import type { ScenarioId } from "@/types/alert";

// IP Tooltip Component
const IPTooltip: React.FC<{ ip: string; children: React.ReactNode }> = ({ ip, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const hideTimer = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const spanRef = useRef<HTMLSpanElement>(null);

  const openTooltip = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
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
} as const;

// Custom label component for reference lines with icons
const CustomReferenceLabel = ({
  viewBox,
  value,
  icon,
  fill,
  isDark,
  yAxisDomain = [50, 100]
}: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value: string;
  icon: 'line' | 'triangle';
  fill: string;
  isDark: boolean;
  yAxisDomain?: [number, number];
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
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        fill={fill}
        fontSize={11}
        fontWeight={600}
      >
        {value}
      </text>
    </g>
  );
};

export default function App(): React.ReactElement {
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>(getCurrentScenario());
  const [activeChart, setActiveChart] = useState<'network' | 'tcp'>(
    // S1 (app-gc) defaults to 'network' (Performance)
    // S2 (session-table-full) and S3 (pmtud-black-hole) default to 'tcp' (Availability)
    currentScenario === 'app-gc' ? 'network' : 'tcp'
  );
  const { theme, setTheme, resolvedTheme } = useTheme();

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

  // Analyze correlation data for insights and override with scenario status primary factor if available
  const correlationInsight = React.useMemo(() => {
    const calculatedInsight = analyzeCorrelation(transType, servers, clients);
    const primaryFactor = scenarioStatus?.businessInfraBreakdown.primaryFactor;

    if (!primaryFactor) {
      return calculatedInsight;
    }

    // Map dimension ID to type
    const dimensionTypeMap: Record<string, 'transType' | 'server' | 'client' | 'channel'> = {
      'transType': 'transType',
      'serverIp': 'server',
      'clientIp': 'client',
      'channel': 'channel'
    };

    const factorType = dimensionTypeMap[primaryFactor.dimension] || 'transType';

    // Find impact value from the appropriate data source
    let impact = 0;
    if (factorType === 'transType') {
      const item = transType.find(t => t.type === primaryFactor.value);
      impact = item?.impact || 0;
    } else if (factorType === 'server') {
      const item = servers.find(s => s.ip === primaryFactor.value);
      impact = item?.impact || 0;
    } else if (factorType === 'client') {
      const item = clients.find(c => c.ip === primaryFactor.value);
      impact = item?.impact || 0;
    } else if (factorType === 'channel') {
      const item = channels.find(ch => ch.channel === primaryFactor.value);
      impact = item?.impact || 0;
    }

    return {
      ...calculatedInsight,
      primaryFactor: {
        type: factorType,
        name: primaryFactor.value,
        impact
      }
    };
  }, [scenarioStatus, transType, servers, clients, channels]);

  // Update activeChart when scenario changes
  useEffect(() => {
    // S1 (app-gc) defaults to 'network' (Performance)
    // S2 (session-table-full) and S3 (pmtud-black-hole) default to 'tcp' (Availability)
    setActiveChart(currentScenario === 'app-gc' ? 'network' : 'tcp');
  }, [currentScenario]);

  // Handle scenario switch
  const handleScenarioSwitch = async (scenarioId: ScenarioId) => {
    try {
      await switchScenario(scenarioId);
      setCurrentScenario(scenarioId);
      // Refresh data after scenario switch
      await refresh();
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    }
  };

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

  // Use scenario status from API instead of calculating
  const healthStatus = {
    network: scenarioStatus.networkAssessment.details.performance,
    tcp: scenarioStatus.networkAssessment.details.availability
  };

  // Dynamic column header based on metric type
  const getCountColumnHeader = () => {
    switch (alertMetadata.metricType) {
      case 'transactionCount':
        return { title: 'Trans CNT', tooltip: 'Transaction Count' };
      case 'responseRate':
      case 'avgResponseTime':
      case 'successRate':
      default:
        return { title: 'Timeouts', tooltip: 'Timed-Out Transactions' };
    }
  };

  const countColumnHeader = getCountColumnHeader();

  // Dynamic chart configuration based on metric type
  const getChartConfig = () => {
    switch (alertMetadata.metricType) {
      case 'transactionCount':
        return {
          yAxisDomain: [0, 1000],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}/m` : v),
          lineName: 'Transaction Count',
        };
      case 'responseRate':
      case 'successRate':
        // S3 scenario (pmtud-black-hole) uses 70-100 range for better visualization
        const yAxisMin = currentScenario === 'pmtud-black-hole' ? 70 : 50;
        return {
          yAxisDomain: [yAxisMin, 100],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
      case 'avgResponseTime':
        return {
          yAxisDomain: [0, 200],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}ms`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}ms` : v),
          lineName: 'Average Response Time',
        };
      default:
        return {
          yAxisDomain: [50, 100],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
    }
  };

  const chartConfig = getChartConfig();

  // Get reference area color based on network assessment status
  const getReferenceAreaColor = (chartType: 'network' | 'tcp') => {
    if (chartType === 'network') {
      // Performance chart
      return scenarioStatus.networkAssessment.details.performance === 'error' ? '#f59e0b' : '#16a34a';
    } else {
      // Availability chart
      return scenarioStatus.networkAssessment.details.availability === 'error' ? '#f59e0b' : '#16a34a';
    }
  };

  const getReferenceLineColor = (chartType: 'network' | 'tcp') => {
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
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'app-gc'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                  title="S1: App GC Scenario"
                >
                  <span className={currentScenario === 'app-gc' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S1
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('session-table-full')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'session-table-full'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                  title="S2: Session Table Full Scenario"
                >
                  <span className={currentScenario === 'session-table-full' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S2
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('pmtud-black-hole')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'pmtud-black-hole'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
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
        {/* Alert Summary with Metric Progression */}
        <Card>
          {/* Alert Header */}
          <div className="flex items-center gap-3 p-4 border-b border-neutral-200/70 dark:border-neutral-700">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 dark:bg-red-600">
              <AlertTriangle className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white tracking-wide">CRITICAL</span>
            </div>
            <div className="flex-1 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-lg">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">SPV =</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{alertMetadata.spv}</span>
                <span className="text-neutral-400 dark:text-neutral-500 mx-1">·</span>
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">Component =</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{alertMetadata.component}</span>
              </span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {alertMetadata.title}
              </span>
            </div>
          </div>

          {/* Alert Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-4 pt-3 pb-3 border-b border-neutral-200/70 dark:border-neutral-700">
            {/* Alert Condition */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alert Condition</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Gauge className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {alertMetadata.condition.metric} {alertMetadata.condition.operator} {alertMetadata.condition.threshold}{alertMetadata.condition.unit}
              </div>
              <div className="text-xs text-neutral-500">Sustained for 1 minute</div>
            </div>

            {/* Trigger Time */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Trigger Time</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Clock className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {alertMetadata.duration.start}
              </div>
              <div className="text-xs text-neutral-500">{alertMetadata.duration.startDate || "2024-01-15"}</div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Timer className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {alertMetadata.duration.durationMinutes} minutes
              </div>
              <div className="text-xs text-neutral-500">{alertMetadata.duration.start} – {alertMetadata.duration.end}</div>
            </div>

            {/* Lowest Point */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Lowest Point</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Target className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {alertMetadata.lowestPoint.value}{alertMetadata.lowestPoint.unit}
              </div>
              <div className="text-xs text-neutral-500">at {alertMetadata.lowestPoint.time}</div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Info className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {alertMetadata.status === 'recovered' ? 'Recovered' : alertMetadata.status === 'active' ? 'Active' : 'Acknowledged'}
              </div>
              <div className="text-xs text-neutral-500">
                {alertMetadata.recoveryInfo ? `Back to ${alertMetadata.recoveryInfo.value}${alertMetadata.lowestPoint.unit} at ${alertMetadata.recoveryInfo.time}` : 'Ongoing'}
              </div>
            </div>
          </div>

          {/* Metric Progression Chart */}
          <div className="px-4 pb-3 pt-3">
            <div className="mb-2">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Metric Progression</h4>
            </div>
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
                      isDark={resolvedTheme === 'dark'}
                      yAxisDomain={chartConfig.yAxisDomain}
                    />}
                  />
                  <ReferenceLine
                    x={alertMetadata.lowestPoint.time}
                    stroke="transparent"
                    label={<CustomReferenceLabel
                      value="Lowest Point"
                      icon="triangle"
                      fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                      isDark={resolvedTheme === 'dark'}
                      yAxisDomain={chartConfig.yAxisDomain}
                    />}
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
                        isDark={resolvedTheme === 'dark'}
                        yAxisDomain={chartConfig.yAxisDomain}
                      />}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Second Row: Business Impact - Full Width */}
        <Card>
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                  Business Impact
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {alertMetadata.contextDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Correlation Insight */}
          <CorrelationInsight insight={correlationInsight} />

          {/* Analysis Tables - Responsive Layout */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              {/* Channel Table - Only show if channel dimension is enabled */}
              {dimensionConfig?.dimensions.find(d => d.id === 'channel')?.enabled && channels.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-600">
                      <BarChart3 className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Channel</h4>
                  </div>
                  <Table
                    keyField="channel"
                    colorColumn="impact"
                    highlightValue={correlationInsight.primaryFactor?.type === 'channel' ? correlationInsight.primaryFactor.name : undefined}
                    columns={[
                      { key: "channel", title: "Channel", tooltip: "Channel Name" },
                      {
                        key: "cnt",
                        title: countColumnHeader.title,
                        tooltip: countColumnHeader.tooltip,
                        render: (v) => String(v)
                      },
                      { key: "outlierness", title: "Change (%)", render: (v) => `${currentScenario === 'session-table-full' ? '-' : '+'}${formatNumber(v)}%`, tooltip: "Change Rate" },
                      { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Impact Percentage" },
                    ]}
                    data={channels}
                  />
                </div>
              )}

              {/* Trans Type Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-600">
                    <BarChart3 className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Trans Type</h4>
                </div>
                <Table
                  keyField="type"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor?.type === 'transType' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    { key: "type", title: "Trans Type", tooltip: "Transaction Type" },
                    {
                      key: "cnt",
                      title: countColumnHeader.title,
                      tooltip: countColumnHeader.tooltip,
                      render: (v, row) => {
                        const current = Number(v);
                        const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                        return `${previous} → ${current}`;
                      }
                    },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${currentScenario === 'session-table-full' ? '-' : '+'}${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
                    { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Impact Percentage" },
                  ]}
                  data={transType}
                />
              </div>

              {/* Server IP Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-600">
                    <Server className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Server IP</h4>
                </div>
                <Table
                  keyField="ip"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor?.type === 'server' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    {
                      key: "ip",
                      title: "Server",
                      tooltip: "Server IP Address",
                      render: (v) => <IPTooltip ip={v}>{v}</IPTooltip>
                    },
                    {
                      key: "cnt",
                      title: countColumnHeader.title,
                      tooltip: countColumnHeader.tooltip,
                      render: (v, row) => {
                        const current = Number(v);
                        const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                        return `${previous} → ${current}`;
                      }
                    },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${currentScenario === 'networkIssue' ? '-' : '+'}${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
                    { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Impact Percentage" },
                  ]}
                  data={servers}
                />
              </div>

              {/* Client IP Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-600">
                    <Globe className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Client IP</h4>
                </div>
                <Table
                  keyField="ip"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor?.type === 'client' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    {
                      key: "ip",
                      title: "Client",
                      tooltip: "Client IP Address",
                      render: (v) => <IPTooltip ip={v}>{v}</IPTooltip>
                    },
                    {
                      key: "cnt",
                      title: countColumnHeader.title,
                      tooltip: countColumnHeader.tooltip,
                      render: (v, row) => {
                        const current = Number(v);
                        const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                        return `${previous} → ${current}`;
                      }
                    },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${currentScenario === 'networkIssue' ? '-' : '+'}${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
                    { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Impact Percentage" },
                  ]}
                  data={clients}
                />
              </div>
            </div>
          </div>
        </Card>


        {/* Network Correlation */}
        <Card className="flex flex-col">
          <SectionHeader
            title="Network Correlation"
            subtitle="Determining if network layer contributed to the alert · Green: No impact · Amber: Has impact"
            right={
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveChart('tcp')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
                    activeChart === 'tcp'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    healthStatus.tcp === 'error'
                      ? 'bg-amber-300 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-400/60'
                      : 'bg-green-500 ring-2 ring-green-200 dark:ring-green-800'
                  }`} />
                  <span className={activeChart === 'tcp' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    Availability
                  </span>
                </button>
                <button
                  onClick={() => setActiveChart('network')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
                    activeChart === 'network'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    healthStatus.network === 'error'
                      ? 'bg-amber-300 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-400/60'
                      : 'bg-green-500 ring-2 ring-green-200 dark:ring-green-800'
                  }`} />
                  <span className={activeChart === 'network' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    Performance
                  </span>
                </button>
              </div>
            }
          />

          {/* Network Assessment Conclusion */}
          <NetworkAssessment
            hasImpact={scenarioStatus.networkAssessment.hasImpact}
            details={scenarioStatus.networkAssessment.details}
          />

          <div className="p-4">
            {/* Charts */}
            <div className="h-[240px]">
              {activeChart === 'network' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={networkHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopOpacity={0.35} />
                        <stop offset="100%" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={resolvedTheme === 'dark' ? '#525252' : '#e5e5e5'}
                      strokeOpacity={resolvedTheme === 'dark' ? 0.5 : 0.5}
                    />
                    <XAxis dataKey="t" />
                    <YAxis domain={[0, 30]} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)}
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
                    <ReferenceArea x1="21:27" x2="21:32" fill={getReferenceAreaColor('network')} fillOpacity={0.1} />
                    <Area type="monotone" dataKey="loss" name="Packet Loss" stroke={CHART_COLORS.purple} fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="retrans" name="Retransmission" stroke={CHART_COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="dupAck" name="Duplicate ACK" stroke={CHART_COLORS.amber} fillOpacity={0.2} strokeWidth={2} />
                    <ReferenceLine
                      x="21:27"
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('network').dark : getReferenceLineColor('network').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <ReferenceLine
                      x="21:32"
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('network').dark : getReferenceLineColor('network').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tcpHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={resolvedTheme === 'dark' ? '#525252' : '#e5e5e5'}
                      strokeOpacity={resolvedTheme === 'dark' ? 0.5 : 0.5}
                    />
                    <XAxis dataKey="t" />
                    <YAxis yAxisId="left" domain={[95, 100]} tickFormatter={(v) => formatNumber(v)} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      formatter={(v, name) => {
                        if (typeof v === "number") {
                          return formatNumber(v);
                        }
                        return v;
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
                    <ReferenceArea yAxisId="left" x1="21:27" x2="21:32" fill={getReferenceAreaColor('tcp')} fillOpacity={0.1} />
                    <ReferenceLine
                      yAxisId="left"
                      x="21:27"
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('tcp').dark : getReferenceLineColor('tcp').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      x="21:32"
                      stroke={resolvedTheme === 'dark' ? getReferenceLineColor('tcp').dark : getReferenceLineColor('tcp').light}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="setup" name="TCP Setup Success %" stroke={CHART_COLORS.indigo} dot={false} strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="rst" name="TCP RST" stroke={CHART_COLORS.pink} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-xs text-neutral-500 text-center py-6">Demo view · Modern, minimal & clear · Built with React + Tailwind + Recharts</div>
      </main>
    </div>
  );
}

