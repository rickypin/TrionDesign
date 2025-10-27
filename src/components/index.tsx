import React from "react";
import type { CardProps, SectionHeaderProps, KPIProps, TableProps } from "@/types";

export { CorrelationInsight } from "./CorrelationInsight";
export { NetworkAssessment } from "./NetworkAssessment";

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/70 dark:bg-neutral-800/90 backdrop-blur shadow-sm ring-1 ring-black/5 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, right, iconColor = 'neutral' }) => {
  // 为AlertTriangle图标自动使用红色主题
  const isAlertTriangle = Icon && (Icon.displayName === 'AlertTriangle' || Icon.name === 'AlertTriangle');
  const effectiveColor = isAlertTriangle ? 'red' : iconColor;

  const getIconStyles = () => {
    switch (effectiveColor) {
      case 'red':
        return {
          container: 'bg-red-100 dark:bg-red-900/50',
          icon: 'text-red-600 dark:text-red-300'
        };
      case 'blue':
        return {
          container: 'bg-blue-100 dark:bg-blue-900/50',
          icon: 'text-blue-600 dark:text-blue-300'
        };
      case 'green':
        return {
          container: 'bg-green-100 dark:bg-green-900/50',
          icon: 'text-green-600 dark:text-green-300'
        };
      default:
        return {
          container: 'bg-neutral-100 dark:bg-neutral-700',
          icon: ''
        };
    }
  };

  const styles = getIconStyles();

  return (
    <div className="flex items-center justify-between gap-3 p-4 border-b border-neutral-200/70 dark:border-neutral-700">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-xl ${styles.container}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold leading-tight">
            {typeof title === 'string' ? title : title}
          </h3>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
};

export const KPI: React.FC<KPIProps> = ({ label, value, trend, icon: Icon }) => (
  <Card>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</p>
        <Icon className="h-4 w-4 text-neutral-400" />
      </div>
      <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{value}</div>
      {typeof trend === "string" ? (
        <div className="mt-1.5 text-xs text-neutral-500">{trend}</div>
      ) : null}
    </div>
  </Card>
);

export const Table = <T extends Record<string, any>>({ columns, data, keyField, colorColumn, highlightValue }: TableProps<T>): React.ReactElement => {
  // Check if a row is the highlighted primary factor
  const isHighlighted = (row: T): boolean => {
    if (!highlightValue) return false;
    return String(row[keyField]) === highlightValue;
  };

  // 计算基于impact值的着色强度
  const getRowColorClass = (value: number, row: T): string => {
    if (!colorColumn || typeof value !== 'number') return '';

    // If this is the highlighted row, use red alert color
    if (isHighlighted(row)) {
      return 'bg-red-100/80 dark:bg-red-900/40 ring-2 ring-red-400/60 dark:ring-red-400/60';
    }

    // 计算在当前数据集中的相对强度（0-1之间）
    const values = data.map(row => row[colorColumn]).filter(v => typeof v === 'number') as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);

    // 如果所有值相等，返回均匀的浅色
    if (min === max) {
      return 'bg-amber-50/30 dark:bg-amber-800/15';
    }

    // 计算数据集的差异范围
    const range = max - min;

    // 如果差异很小（绝对差异 < 8%），认为贡献均匀，使用统一的浅琥珀色（降低强度）
    // 例如：51.33% vs 48.67% 的差异只有2.66%，应该视为均匀分布
    if (range < 8) {
      return 'bg-amber-50/35 dark:bg-amber-800/20';
    }

    // 计算相对强度
    const intensity = (value - min) / range;

    // 根据强度返回不同的背景色 - 降低所有非高亮行的着色强度
    if (intensity >= 0.8) {
      return 'bg-amber-100/45 dark:bg-amber-800/35'; // 高影响 - 降低强度
    } else if (intensity >= 0.6) {
      return 'bg-amber-50/40 dark:bg-amber-800/28'; // 中高影响
    } else if (intensity >= 0.4) {
      return 'bg-amber-50/30 dark:bg-amber-800/20'; // 中等影响
    } else if (intensity >= 0.2) {
      return 'bg-amber-50/20 dark:bg-amber-800/15'; // 低中等影响
    } else {
      return 'bg-amber-50/15 dark:bg-amber-800/10'; // 低影响 - 很浅的琥珀色
    }
  };

  // 判断是否需要加粗字体
  const shouldBold = (value: number, row: T): boolean => {
    // Highlighted row is always bold
    if (isHighlighted(row)) return true;

    if (!colorColumn || typeof value !== 'number') return false;

    const values = data.map(row => row[colorColumn]).filter(v => typeof v === 'number') as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);

    // 如果所有值相等或差异很小，不加粗（除非是高亮行）
    if (min === max || (max - min) < 8) {
      return false;
    }

    // 如果有差异，只对高影响的行加粗（intensity >= 0.8，提高阈值）
    const intensity = (value - min) / (max - min);
    return intensity >= 0.8;
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <table className="min-w-full text-sm border-separate border-spacing-0">
        <thead className="text-neutral-500">
          <tr className="border-b-2 border-neutral-200 dark:border-neutral-600">
            {columns.map((c, index) => (
              <th key={String(c.key)} className={`px-4 py-3 font-medium whitespace-nowrap bg-neutral-50/50 dark:bg-neutral-700/40 ${index === 0 ? 'text-left' : 'text-right'}`}>
                <div className={`flex items-center gap-1 ${index === 0 ? '' : 'justify-end'}`}>
                  {c.title}
                  {c.icon && <c.icon className="h-4 w-4" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const isBold = colorColumn && shouldBold(row[colorColumn] as number, row);
            const highlighted = isHighlighted(row);
            return (
              <tr
                key={String(row[keyField])}
                className={`border-t border-neutral-200 dark:border-neutral-600 transition-colors ${
                  colorColumn ? getRowColorClass(row[colorColumn] as number, row) : ''
                } ${isBold ? 'font-semibold' : 'font-normal'}`}
              >
                {columns.map((c, index) => (
                  <td key={String(c.key)} className={`px-4 py-3 whitespace-nowrap ${index === 0 ? 'text-left' : 'text-right'}`}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

