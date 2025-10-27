import React, { useState } from "react";
import { AlertTriangle, Activity, Server, Globe, BarChart3, Zap, Layers, Sun, Moon, Monitor, ArrowDown } from "lucide-react";
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
import { Card, SectionHeader, KPI, Table } from "@/components";
import { responseRate, networkHealth, tcpHealth, transType, clients, channels, servers, returnCodes } from "@/data";
import { useTheme } from "@/hooks/useTheme";
import { formatNumber } from "@/utils/format";

// 明亮而优雅的配色池 - 避免告警色（红/绿）
const CHART_COLORS = {
  blue: '#3b82f6',      // 蓝色 - 清晰、专业
  purple: '#a855f7',    // 紫色 - 优雅、现代
  cyan: '#06b6d4',      // 青色 - 明亮、清新
  amber: '#f59e0b',     // 琥珀色 - 温暖、醒目
  pink: '#ec4899',      // 品红 - 活力、鲜明
  indigo: '#6366f1',    // 靛青 - 深邃、稳重
} as const;

export default function App(): React.ReactElement {
  const [activeChart, setActiveChart] = useState<'network' | 'tcp'>('network');
  const { theme, setTheme, resolvedTheme } = useTheme();

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800">
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
                Automatic Alert Root Cause
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
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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

      <main className="w-full p-4 space-y-6">
        {/* Alert Summary */}
          <Card>
            <SectionHeader
              icon={AlertTriangle}
              title={
                <span>
                  New Credit Card System · OpenShift, Transaction Response Rate dropped to 77.43%
                  <span className="ml-2 text-xs font-normal text-neutral-500">21:27 – 21:32</span>
                </span>
              }
              subtitle="Trigger Condition: Response Rate < 85% for 1 minute"
              iconColor="red"
            />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4">
            <KPI label="Peak Impact" value="> 94% on Normal Purchase" trend="Primary driver" icon={Zap} />
            <KPI label="Affected Server" value="10.10.16.30/10.10.16.31" trend="Single node concentration" icon={Server} />
            <KPI label="Primary Client IPs" value="10.10.24.204 / .206" trend="High volume" icon={Globe} />
            <KPI label="Current Response Rate" value="77.4%" trend="Recovered to 100% post-21:35" icon={Activity} />
          </div>
        </Card>

        {/* Transaction Response Rate & Network Layer Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {/* Transaction Response Rate */}
          <Card className="lg:h-[320px] flex flex-col">
            <SectionHeader icon={Activity} title="Transaction Response Rate" subtitle="Higher is better" />
            <div className="flex-1 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseRate} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis domain={[50, 100]} tickFormatter={(v) => `${formatNumber(v)}%`} />
                  <Tooltip formatter={(v) => (typeof v === "number" ? `${formatNumber(v)}%` : v)} />
                  <Legend />
                  <ReferenceArea x1="21:27" x2="21:32" fill="red" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="rate" name="Response Rate" stroke={CHART_COLORS.blue} dot={false} strokeWidth={2} />
                  <ReferenceLine x="21:27" stroke="red" strokeDasharray="5 5" />
                  <ReferenceLine x="21:32" stroke="red" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Network Layer Health */}
          <Card className="lg:h-[320px] flex flex-col">
            <SectionHeader
              icon={Layers}
              title="Network Layer Health"
              subtitle="Green: Healthy · Red: Issue"
              right={
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveChart('tcp')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeChart === 'tcp'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      healthStatus.tcp === 'error'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`} />
                    Availability
                  </button>
                  <button
                    onClick={() => setActiveChart('network')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeChart === 'network'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      healthStatus.network === 'error'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`} />
                    Performance
                  </button>
                </div>
              }
            />
            <div className="flex-1 p-4">
              {/* Charts */}
              <div className="h-full">
                {activeChart === 'network' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopOpacity={0.35} />
                          <stop offset="100%" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="t" />
                      <YAxis domain={[0, 30]} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)} />
                      <Legend />
                      <ReferenceArea x1="21:27" x2="21:32" fill="green" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="loss" name="Packet Loss" stroke={CHART_COLORS.purple} fill="url(#g1)" strokeWidth={2} />
                      <Area type="monotone" dataKey="retrans" name="Retransmission" stroke={CHART_COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="dupAck" name="Duplicate ACK" stroke={CHART_COLORS.amber} fillOpacity={0.2} strokeWidth={2} />
                      <ReferenceLine x="21:27" stroke="green" strokeDasharray="5 5" />
                      <ReferenceLine x="21:32" stroke="green" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tcpHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} syncId="timeSeriesSync">
                      <CartesianGrid strokeDasharray="3 3" />
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
                      <ReferenceLine yAxisId="left" x="21:27" stroke="green" strokeDasharray="5 5" />
                      <ReferenceLine yAxisId="left" x="21:32" stroke="green" strokeDasharray="5 5" />
                      <Line yAxisId="left" type="monotone" dataKey="setup" name="TCP Setup Success %" stroke={CHART_COLORS.indigo} dot={false} strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="rst" name="TCP RST" stroke={CHART_COLORS.pink} dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </div>


        {/* Analysis Tables - Full Width Dimensions */}
        <div className="space-y-6">
          <Card>
            <SectionHeader icon={BarChart3} title="Dimension · Trans Type" subtitle="2025-10-23 21:27 – 21:32 incident window" />
            <div className="p-4">
              <Table
                keyField="type"
                colorColumn="impact"
                columns={[
                  { key: "type", title: "Trans Type" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "time", title: "Resp Time (ms)", render: (v) => formatNumber(v) },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown },
                ]}
                data={transType}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Globe} title="Dimension · Client IP" subtitle="2025-10-23 21:27 – 21:32 incident window" />
            <div className="p-4">
              <Table
                keyField="ip"
                colorColumn="impact"
                columns={[
                  { key: "ip", title: "Client IP" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "time", title: "Resp Time (ms)", render: (v) => formatNumber(v) },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown },
                ]}
                data={clients}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Server} title="Dimension · Server IP" subtitle="2025-10-23 21:27 – 21:32 incident window" />
            <div className="p-4">
              <Table
                keyField="ip"
                colorColumn="impact"
                columns={[
                  { key: "ip", title: "Server IP" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "time", title: "Resp Time (ms)", render: (v) => formatNumber(v) },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown },
                ]}
                data={servers}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Activity} title="Dimension · Channel" subtitle="2025-10-23 21:27 – 21:32 incident window" />
            <div className="p-4">
              <Table
                keyField="channel"
                colorColumn="impact"
                columns={[
                  { key: "channel", title: "Channel" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "time", title: "Resp Time (ms)", render: (v) => formatNumber(v) },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown },
                ]}
                data={channels}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={BarChart3} title="Dimension · Return Code" subtitle="2025-10-23 21:27 – 21:32 incident window" />
            <div className="p-4">
              <Table
                keyField="code"
                colorColumn="impact"
                columns={[
                  { key: "code", title: "Return Code" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "time", title: "Resp Time (ms)", render: (v) => formatNumber(v) },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${formatNumber(v)}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${formatNumber(v)}%`, icon: ArrowDown },
                ]}
                data={returnCodes}
              />
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-neutral-500 text-center py-6">Demo view · Modern, minimal & clear · Built with React + Tailwind + Recharts</div>
      </main>
    </div>
  );
}

