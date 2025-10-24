import React from "react";
import { AlertTriangle, Activity, Clock, Server, Globe, Network, BarChart3, Zap, Filter } from "lucide-react";
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

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Application Performance Center</h1>
              <p className="text-xs text-neutral-500">Automatic Alert Root Cause · 2025-10-23 21:30 · New Credit Card System · OpenShift</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800">
              <Clock className="h-4 w-4" />Last 30 min
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Filter className="h-4 w-4" />Filters
            </button>
          </div>
        </div>
      </header>

      <main className="w-full p-4 space-y-6">
        {/* Alert Summary */}
        <Card>
          <SectionHeader
            icon={BarChart3}
            title="Critical · Transaction Response Rate of 'OpenShift' dropped to 77.43%"
            subtitle="Response Rate < 85% for 1 minute"
            right={<span className="text-xs text-neutral-500">21:27 – 21:32 incident window</span>}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4">
            <KPI label="Peak Impact" value="> 93% on Normal Purchase" trend="Primary driver" icon={Zap} />
            <KPI label="Affected Server" value="10.10.10.30/10.10.10.31" trend="Single node concentration" icon={Server} />
            <KPI label="Primary Client IPs" value="10.10.24.204 / .206" trend="High volume" icon={Globe} />
            <KPI label="Current Response Rate" value="77.43%" trend="Recovered to 100% post-21:35" icon={Activity} />
          </div>
        </Card>

        {/* Transaction Response Rate */}
        <Card>
          <SectionHeader icon={Activity} title="Transaction Response Rate" subtitle="Higher is better" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseRate} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis domain={[50, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => (typeof v === "number" ? `${v.toFixed(2)}%` : v)} />
                <Legend />
                <ReferenceArea x1="21:27" x2="21:32" fill="red" fillOpacity={0.1} />
                <Line type="monotone" dataKey="rate" name="Response Rate" dot={false} strokeWidth={2} />
                <ReferenceLine x="21:27" stroke="red" strokeDasharray="5 5" />
                <ReferenceLine x="21:32" stroke="red" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Network Metrics */}
        <Card>
          <SectionHeader icon={Network} title="Network Metrics" subtitle="Packet Loss / Retransmission / Duplicate ACK" />
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.35} />
                    <stop offset="100%" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="loss" name="Packet Loss" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="retrans" name="Retransmission" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="dupAck" name="Duplicate ACK" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* TCP Health */}
        <Card>
          <SectionHeader icon={Globe} title="TCP Health" subtitle="Setup Success Rate & RST" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tcpHealth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis yAxisId="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="setup" name="TCP Setup Success %" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="rst" name="TCP RST" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Analysis Tables - Full Width Dimensions */}
        <div className="space-y-6">
          <Card>
            <SectionHeader icon={BarChart3} title="Dimension · Trans Type" subtitle="2025-10-23 21:30:00" />
            <div className="p-4">
              <Table
                keyField="type"
                columns={[
                  { key: "type", title: "Trans Type" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${v}%` },
                  { key: "time", title: "Resp Time (ms)" },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${v}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${v}%` },
                ]}
                data={transType}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Globe} title="Dimension · Client IP" />
            <div className="p-4">
              <Table
                keyField="ip"
                columns={[
                  { key: "ip", title: "Client IP" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${v}%` },
                  { key: "time", title: "Resp Time (ms)" },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${v}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${v}%` },
                ]}
                data={clients}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Server} title="Dimension · Server IP" />
            <div className="p-4">
              <Table
                keyField="ip"
                columns={[
                  { key: "ip", title: "Server IP" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${v}%` },
                  { key: "time", title: "Resp Time (ms)" },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${v}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${v}%` },
                ]}
                data={servers}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Activity} title="Dimension · Channel" />
            <div className="p-4">
              <Table
                keyField="channel"
                columns={[
                  { key: "channel", title: "Channel" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${v}%` },
                  { key: "time", title: "Resp Time (ms)" },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${v}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${v}%` },
                ]}
                data={channels}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={BarChart3} title="Dimension · Return Code" />
            <div className="p-4">
              <Table
                keyField="code"
                columns={[
                  { key: "code", title: "Return Code" },
                  { key: "cnt", title: "Trans CNT" },
                  { key: "resp", title: "Resp Rate (%)", render: (v) => `${v}%` },
                  { key: "time", title: "Resp Time (ms)" },
                  { key: "succ", title: "Succ Rate (%)", render: (v) => `${v}%` },
                  { key: "impact", title: "Impact (%)", render: (v) => `${v}%` },
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

