import React, { useState } from "react";
import { AlertTriangle, Activity, Server, Globe, BarChart3, Zap, Layers, Sun, Moon, Monitor, ArrowDown, TrendingDown, Clock, CheckCircle, Gauge, Target, Info } from "lucide-react";
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
import { responseRate, networkHealth, tcpHealth, transType, clients, servers } from "@/data";
import { useTheme } from "@/hooks/useTheme";
import { formatNumber } from "@/utils/format";
import { analyzeCorrelation } from "@/utils/correlationAnalysis";

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
  const [activeChart, setActiveChart] = useState<'network' | 'tcp'>('network');
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Analyze correlation data for insights
  const correlationInsight = analyzeCorrelation(transType, servers, clients);

  // Analyze health status based on problem time window (21:27-21:32)
  const getHealthStatus = () => {
    const problemTimes = ['21:27', '21:29', '21:31'];

    // Check Network Health - red if packet loss > 5% or retransmission > 8% during problem period
    // AND if the curve behavior correlates with transaction response rate degradation
    const networkIssues = networkHealth.filter(data =>
      problemTimes.includes(data.t) && (data.loss > 5 || data.retrans > 8)
    );

    // Analyze curve correlation with transaction response rate
    // Transaction response rate shows sustained degradation (85.2% -> 77.43% -> 78.9%)
    // Network metrics show only minor fluctuations, not correlated degradation pattern
    const hasCurveCorrelation = () => {
      const networkProblemData = networkHealth.filter(data => problemTimes.includes(data.t));
      if (networkProblemData.length < 2) return false;

      // Check if network metrics show sustained degradation pattern like transaction rate
      // Transaction rate: continuous decline then recovery
      // Network metrics: only minor fluctuations without clear degradation trend
      const lossTrend = networkProblemData.map(d => d.loss);
      const retransTrend = networkProblemData.map(d => d.retrans);

      // Network metrics don't show the same sustained degradation pattern
      return false; // Curves are not correlated in this case
    };

    // Check TCP Health - red if setup success < 99% or RST > 2.5 during problem period
    const tcpIssues = tcpHealth.filter(data =>
      problemTimes.includes(data.t) && (data.setup < 99 || data.rst > 2.5)
    );

    return {
      network: (networkIssues.length > 0 && hasCurveCorrelation()) ? 'error' : 'healthy',
      tcp: tcpIssues.length > 0 ? 'error' : 'healthy'
    };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-800/80 border-b border-neutral-200/70 dark:border-neutral-600/50">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-baseline gap-3"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Trion
              </span>
              <span className="text-xl font-medium text-neutral-600 dark:text-neutral-400 uppercase">
                Intelligent Alert Analysis
              </span>
            </motion.div>
            
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
      </header>

      <main className="w-full p-4 space-y-4">
        {/* Alert Summary with Metric Progression */}
        <Card>
          {/* Alert Header */}
          <div className="flex items-center gap-3 p-4 border-b border-neutral-200/70 dark:border-neutral-700">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <div className="flex-1 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-lg">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">SPV =</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">New Credit Card System</span>
                <span className="text-neutral-400 dark:text-neutral-500 mx-1">·</span>
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">Component =</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">OpenShift</span>
              </span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Response rate dropped
              </span>
            </div>
          </div>

          {/* Alert Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pt-3 pb-3 border-b border-neutral-200/70 dark:border-neutral-700">
            {/* Alert Condition */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alert Condition</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Gauge className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Response Rate &lt; 85%</div>
              <div className="text-xs text-neutral-500">Threshold breached</div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Clock className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">6 minutes</div>
              <div className="text-xs text-neutral-500">21:27 – 21:32</div>
            </div>

            {/* Lowest Point */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Lowest Point</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Target className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">77.4%</div>
              <div className="text-xs text-neutral-500">at 21:30</div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/40 border border-neutral-200/50 dark:border-neutral-600/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</p>
                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-600/50">
                  <Info className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Recovered</div>
              <div className="text-xs text-neutral-500">Back to 100% at 21:33</div>
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
                  <YAxis domain={[50, 100]} tickFormatter={(v) => `${formatNumber(v)}%`} />
                  <Tooltip formatter={(v) => (typeof v === "number" ? `${formatNumber(v)}%` : v)} />
                  <Legend />
                  <ReferenceArea x1="21:27" x2="21:32" fill="red" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="rate" name="Transaction Response Rate" stroke={CHART_COLORS.blue} dot={false} strokeWidth={2} />
                  <ReferenceLine
                    x="21:27"
                    stroke={resolvedTheme === 'dark' ? '#f87171' : '#dc2626'}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                    label={<CustomReferenceLabel
                      value="Triggered"
                      icon="line"
                      fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                      isDark={resolvedTheme === 'dark'}
                      yAxisDomain={[50, 100]}
                    />}
                  />
                  <ReferenceLine
                    x="21:30"
                    stroke="transparent"
                    label={<CustomReferenceLabel
                      value="Lowest Point"
                      icon="triangle"
                      fill={resolvedTheme === 'dark' ? '#fb923c' : '#ea580c'}
                      isDark={resolvedTheme === 'dark'}
                      yAxisDomain={[50, 100]}
                    />}
                  />
                  <ReferenceLine
                    x="21:32"
                    stroke={resolvedTheme === 'dark' ? '#f87171' : '#dc2626'}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                    label={<CustomReferenceLabel
                      value="Recovered"
                      icon="line"
                      fill={resolvedTheme === 'dark' ? '#fca5a5' : '#dc2626'}
                      isDark={resolvedTheme === 'dark'}
                      yAxisDomain={[50, 100]}
                    />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Second Row: Network Layer Impact Assessment - Full Width */}
        <Card className="flex flex-col">
          <SectionHeader
            title="Network Layer Impact Assessment"
            subtitle="Determining if network layer contributed to the alert · Green: No impact · Red: Has impact"
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
                      ? 'bg-red-500 ring-2 ring-red-200 dark:ring-red-800'
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
                      ? 'bg-red-500 ring-2 ring-red-200 dark:ring-red-800'
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
            hasImpact={healthStatus.network === 'error' || healthStatus.tcp === 'error'}
            details={{
              availability: healthStatus.tcp,
              performance: healthStatus.network
            }}
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
                    <Tooltip formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)} />
                    <Legend />
                    <ReferenceArea x1="21:27" x2="21:32" fill="green" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="loss" name="Packet Loss" stroke={CHART_COLORS.purple} fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="retrans" name="Retransmission" stroke={CHART_COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="dupAck" name="Duplicate ACK" stroke={CHART_COLORS.amber} fillOpacity={0.2} strokeWidth={2} />
                    <ReferenceLine
                      x="21:27"
                      stroke={resolvedTheme === 'dark' ? '#4ade80' : '#16a34a'}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <ReferenceLine
                      x="21:32"
                      stroke={resolvedTheme === 'dark' ? '#4ade80' : '#16a34a'}
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
                    <Tooltip formatter={(v, name) => {
                      if (typeof v === "number") {
                        return formatNumber(v);
                      }
                      return v;
                    }} />
                    <Legend />
                    <ReferenceArea yAxisId="left" x1="21:27" x2="21:32" fill="green" fillOpacity={0.1} />
                    <ReferenceLine
                      yAxisId="left"
                      x="21:27"
                      stroke={resolvedTheme === 'dark' ? '#4ade80' : '#16a34a'}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      x="21:32"
                      stroke={resolvedTheme === 'dark' ? '#4ade80' : '#16a34a'}
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


        {/* Multi-Dimensional Correlation Analysis */}
        <Card>
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                  Impact Attribution
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Business & Infrastructure contributors at <span className="font-medium text-neutral-900 dark:text-neutral-100">21:30</span> (response rate dropped to <span className="font-medium text-neutral-900 dark:text-neutral-100">77.4%</span>)
                </p>
              </div>
            </div>
          </div>

          {/* Correlation Insight */}
          <CorrelationInsight insight={correlationInsight} />

          {/* Analysis Tables - Horizontal Layout */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6 items-start">
              {/* Service Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-600">
                    <BarChart3 className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Business (Service)</h4>
                </div>
                <Table
                  keyField="type"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor.type === 'transType' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    { key: "type", title: "Service", tooltip: "Service Type" },
                    { key: "cnt", title: "Timeouts", tooltip: "Timed-Out Transactions" },
                    { key: "impact", title: "Contrib. (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Contribution Percentage" },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
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
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Infrastructure (Server IP)</h4>
                </div>
                <Table
                  keyField="ip"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor.type === 'server' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    { key: "ip", title: "Server", tooltip: "Server IP Address" },
                    { key: "cnt", title: "Timeouts", tooltip: "Timed-Out Transactions" },
                    { key: "impact", title: "Contrib. (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Contribution Percentage" },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
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
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Infrastructure (Client IP)</h4>
                </div>
                <Table
                  keyField="ip"
                  colorColumn="impact"
                  highlightValue={correlationInsight.primaryFactor.type === 'client' ? correlationInsight.primaryFactor.name : undefined}
                  columns={[
                    { key: "ip", title: "Client", tooltip: "Client IP Address" },
                    { key: "cnt", title: "Timeouts", tooltip: "Timed-Out Transactions" },
                    { key: "impact", title: "Contrib. (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown, tooltip: "Contribution Percentage" },
                    { key: "outlierness", title: "Change (%)", render: (v) => `${formatNumber(v)}%`, tooltip: "Change Rate: How much higher this value's failure rate is compared to the median within this dimension." },
                  ]}
                  data={clients}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-xs text-neutral-500 text-center py-6">Demo view · Modern, minimal & clear · Built with React + Tailwind + Recharts</div>
      </main>
    </div>
  );
}

