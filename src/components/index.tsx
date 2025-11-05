import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { CardProps, TableProps } from "@/types";
import { getRowColorClass, shouldBold as shouldBoldValue } from "@/utils/tableColoring";

export { NetworkCorrelationSidebar } from "./NetworkCorrelationSidebar";
export { MetricInfoTooltip } from "./MetricInfoTooltip";
export { CustomLegendWithInfo } from "./CustomLegendWithInfo";
export { IPTooltip } from "./IPTooltip";
export { NetworkLayerTooltip } from "./NetworkLayerTooltip";
export { CustomReferenceLabel } from "./CustomReferenceLabel";
export { BusinessImpactSection } from "./BusinessImpactSection";
export { AlertSummaryChart } from "./AlertSummaryChart";
export { TableSectionHeader } from "./TableSectionHeader";

export const Card: React.FC<CardProps> = ({ children, className = "" }): React.ReactElement => (
  <div className={`rounded-xl bg-white/70 dark:bg-neutral-800/90 backdrop-blur shadow-sm ring-1 ring-black/5 ${className}`}>
    {children}
  </div>
);

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  keyField,
  colorColumn,
  defaultSortColumn,
  defaultSortDirection = 'desc'
}: TableProps<T>): React.ReactElement => {
  // State for sorting
  const [sortColumn, setSortColumn] = useState<keyof T | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // Sort data based on current sort state
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    const column = columns.find(c => c.key === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      // Use custom sortValue function if provided, otherwise use the raw value
      if (column.sortValue) {
        aValue = column.sortValue(a);
        bValue = column.sortValue(b);
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Extract all values for outlier detection
  const allValues = colorColumn
    ? sortedData.map(row => row[colorColumn]).filter(v => typeof v === 'number') as number[]
    : [];

  // Get row color class using utility function
  const getRowColor = (value: number): string => {
    if (!colorColumn || typeof value !== 'number') return '';
    return getRowColorClass(value, allValues);
  };

  // Check if value should be bold using utility function
  const shouldBold = (value: number): boolean => {
    if (!colorColumn || typeof value !== 'number') return false;
    return shouldBoldValue(value, allValues);
  };

  // Handle column header click for sorting
  const handleSort = (columnKey: keyof T, sortable?: boolean) => {
    if (sortable === false) return;

    if (sortColumn === columnKey) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending for numeric columns
      setSortColumn(columnKey);
      setSortDirection('desc');
    }
  };

  // Get sort icon for a column
  const getSortIcon = (columnKey: keyof T, sortable?: boolean) => {
    if (sortable === false) return null;

    if (sortColumn === columnKey) {
      return sortDirection === 'asc'
        ? <ArrowUp className="h-3.5 w-3.5" />
        : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  // 智能列宽分配：根据列的内容类型分配不同的宽度
  // 30% + 26% + 30% + 14% = 100%
  const getColumnWidth = (index: number, columnKey: keyof T) => {
    if (index === 0) return '30%'; // 第一列（名称）

    // 根据列的 key 判断内容类型
    const key = String(columnKey);
    if (key === 'cnt' || key.includes('Volume') || key.includes('count')) {
      return '26%'; // Transaction Volume 列
    }
    if (key === 'succ' || key.includes('Rate') || key.includes('rate')) {
      return '30%'; // Response Rate/Success Rate 列
    }
    if (key === 'impact' || key.includes('Impact')) {
      return '14%'; // Impact 列
    }

    // 默认平均分配
    return `${70 / (columns.length - 1)}%`;
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-xs border-separate border-spacing-0" style={{ tableLayout: 'fixed' }}>
          <thead className="text-neutral-500 dark:text-neutral-400">
            <tr className="border-b-2 border-neutral-300 dark:border-neutral-600">
              {columns.map((c, index) => (
                <th
                  key={String(c.key)}
                  className={`px-1.5 sm:px-2 py-1.5 sm:py-2 font-medium bg-neutral-100/80 dark:bg-neutral-700/60 ${
                    index === 0 ? 'text-left' : 'text-right'
                  } ${c.sortable !== false ? 'cursor-pointer hover:bg-neutral-200/80 dark:hover:bg-neutral-600/60' : 'cursor-help'} transition-colors`}
                  title={c.tooltip}
                  onClick={() => handleSort(c.key, c.sortable)}
                  style={{ width: getColumnWidth(index, c.key) }}
                >
                  <div className={`flex items-center gap-0.5 sm:gap-1 ${index === 0 ? '' : 'justify-end'} min-w-0`}>
                    <span className="truncate">{c.title}</span>
                    {c.icon && <c.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />}
                    {getSortIcon(c.key, c.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const isBold = colorColumn && shouldBold(row[colorColumn] as number);
              return (
                <tr
                  key={String(row[keyField])}
                  className={`border-t border-neutral-200 dark:border-neutral-700 transition-colors ${
                    colorColumn ? getRowColor(row[colorColumn] as number) : ''
                  } ${isBold ? 'font-semibold' : 'font-normal'}`}
                >
                  {columns.map((c, index) => (
                    <td key={String(c.key)} className={`px-1.5 sm:px-2 py-1.5 sm:py-2 ${index === 0 ? 'text-left' : 'text-right'}`}>
                      <div className="truncate min-w-0">{c.render ? c.render(row[c.key], row) : row[c.key]}</div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

