/**
 * Business Impact Section Component
 * Displays business impact analysis with dimension tables
 */

import React, { useState } from 'react';
import { BarChart3, Activity, Server, Globe } from 'lucide-react';
import { Card, Table, IPTooltip, TableSectionHeader } from '@/components';
import { formatNumber } from '@/utils/format';
import type {
  TransTypeData,
  ClientData,
  ServerData,
  ChannelData,
  ReturnCodeData
} from '@/types';
import type { DimensionConfig } from '@/types/alert';

interface BusinessImpactSectionProps {
// ...existing code...
  transType: TransTypeData[];
  returnCodes: ReturnCodeData[];
  channels: ChannelData[];
  servers: ServerData[];
  clients: ClientData[];
  dimensionConfig: DimensionConfig | null;
  successRateColumnConfig: {
    title: string;
    tooltip: string;
  };
}

export const BusinessImpactSection: React.FC<BusinessImpactSectionProps> = ({
  transType,
  returnCodes,
  channels,
  servers,
  clients,
  dimensionConfig,
  successRateColumnConfig,
}) => {
  // State for "Affected Only" filter
  const [affectedOnly, setAffectedOnly] = useState(true);

  // Helper to count items with impact > 0
  const getAffectedCount = (data: { impact: number }[]) => data.filter(d => d.impact > 0).length;

  // Helper to filter data based on affectedOnly state
  const filterData = <T extends { impact: number }>(data: T[]): T[] => {
    return affectedOnly ? data.filter(d => d.impact > 0) : data;
  };

  // Helper to render affected tag
  // Since all dimensions are affected during an incident, we use a neutral style
  // with amber accents to indicate the "impact" nature without visual noise.
  const renderAffectedTag = (Icon: React.ElementType, label: string, data: { impact: number }[]) => {
    if (data.length === 0) return null;
    
    const count = getAffectedCount(data);
    const total = data.length;

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50">
        <Icon className="h-3.5 w-3.5 text-amber-500 dark:text-amber-500" />
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{count}</span>
          <span className="text-neutral-400 dark:text-neutral-500">/{total}</span> {label}
        </span>
      </div>
    );
  };

  return (
    <Card className="flex-1 min-w-0">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Business Impact
        </h3>
      </div>

      {/* Summary Header - Affected Counts */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Affected - Always show regardless of primaryFactor */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Affected:</span>
            
            {renderAffectedTag(BarChart3, "Trans Types", transType)}
            {renderAffectedTag(Activity, "Return Codes", returnCodes)}
            {renderAffectedTag(BarChart3, "Channels", channels)}
            {renderAffectedTag(Server, "Server IPs", servers)}
            {renderAffectedTag(Globe, "Client IPs", clients)}
          </div>

          {/* Affected Only Checkbox */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={affectedOnly}
                  onChange={(e) => setAffectedOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-neutral-400 dark:border-neutral-600 bg-transparent peer-checked:bg-neutral-600 dark:peer-checked:bg-neutral-700 peer-checked:border-neutral-600 dark:peer-checked:border-neutral-700 peer-focus:ring-2 peer-focus:ring-neutral-500/20 peer-focus:ring-offset-1 peer-focus:ring-offset-neutral-800 transition-all duration-150 flex items-center justify-center group-hover:border-neutral-500 dark:group-hover:border-neutral-500">
                  {affectedOnly && (
                    <svg className="w-3 h-3 text-neutral-100 dark:text-neutral-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-150">
                Affected Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Analysis Tables - Responsive Layout */}
      <div className="p-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {/* Channel Table - Only show if channel dimension is enabled */}
          {dimensionConfig?.dimensions.find(d => d.id === 'channel')?.enabled && channels.length > 0 && (
            <div className="space-y-2">
              <TableSectionHeader icon={BarChart3} title="Channel" />
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
                    tooltip: "Transaction count: baseline → current (change)",
                    sortValue: (row) => Number(row.cnt),
                    render: (v, row) => {
                      const current = Number(v);
                      const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                      const delta = current - previous;
                      return `${previous.toLocaleString()} → ${current.toLocaleString()} (${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
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
                data={filterData(channels)}
              />
            </div>
          )}

          {/* Trans Type Table */}
          <div className="space-y-2">
            <TableSectionHeader icon={BarChart3} title="Trans Type" />
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
                  tooltip: "Transaction count: baseline → current (change)",
                  sortValue: (row) => Number(row.cnt),
                  render: (v, row) => {
                    const current = Number(v);
                    const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                    const delta = current - previous;
                    return `${previous.toLocaleString()} → ${current.toLocaleString()} (${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
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
              data={filterData(transType)}
            />
          </div>

          {/* Return Code Table */}
          <div className="space-y-2">
            <TableSectionHeader icon={Activity} title="Return Code" />
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
                  tooltip: "Transaction count: baseline → current (change)",
                  sortValue: (row) => Number(row.cnt),
                  render: (v, row) => {
                    const current = Number(v);
                    const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                    const delta = current - previous;
                    return `${previous.toLocaleString()} → ${current.toLocaleString()} (${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
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
              data={filterData(returnCodes)}
            />
          </div>

          {/* Server IP Table */}
          <div className="space-y-2">
            <TableSectionHeader icon={Server} title="Server IP" />
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
                  tooltip: "Transaction count: baseline → current (change)",
                  sortValue: (row) => Number(row.cnt),
                  render: (v, row) => {
                    const current = Number(v);
                    const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                    const delta = current - previous;
                    return `${previous.toLocaleString()} → ${current.toLocaleString()} (${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
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
              data={filterData(servers)}
            />
          </div>

          {/* Client IP Table */}
          <div className="space-y-2">
            <TableSectionHeader icon={Globe} title="Client IP" />
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
                  tooltip: "Transaction count: baseline → current (change)",
                  sortValue: (row) => Number(row.cnt),
                  render: (v, row) => {
                    const current = Number(v);
                    const previous = row.previousCnt !== undefined ? row.previousCnt : current;
                    const delta = current - previous;
                    return `${previous.toLocaleString()} → ${current.toLocaleString()} (${delta >= 0 ? '+' : ''}${delta.toLocaleString()})`;
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
              data={filterData(clients)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};


