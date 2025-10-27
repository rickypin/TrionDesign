import React from "react";
import type { CardProps, SectionHeaderProps, KPIProps, TableProps } from "@/types";

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur shadow-sm ring-1 ring-black/5 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, right, iconColor = 'neutral' }) => {
  // 为AlertTriangle图标自动使用红色主题
  const isAlertTriangle = Icon.displayName === 'AlertTriangle' || Icon.name === 'AlertTriangle';
  const effectiveColor = isAlertTriangle ? 'red' : iconColor;

  const getIconStyles = () => {
    switch (effectiveColor) {
      case 'red':
        return {
          container: 'bg-red-100 dark:bg-red-900/40',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'blue':
        return {
          container: 'bg-blue-100 dark:bg-blue-900/40',
          icon: 'text-blue-600 dark:text-blue-400'
        };
      case 'green':
        return {
          container: 'bg-green-100 dark:bg-green-900/40',
          icon: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          container: 'bg-neutral-100 dark:bg-neutral-800',
          icon: ''
        };
    }
  };

  const styles = getIconStyles();

  return (
    <div className="flex items-center justify-between gap-3 p-4 border-b border-neutral-200/70 dark:border-neutral-800/70">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${styles.container}`}>
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      {typeof trend === "string" ? (
        <div className="mt-1 text-xs text-neutral-500">{trend}</div>
      ) : null}
    </div>
  </Card>
);

export const Table = <T extends Record<string, any>>({ columns, data, keyField, colorColumn }: TableProps<T>): React.ReactElement => {
  // 计算基于impact值的着色强度
  const getRowColorClass = (value: number): string => {
    if (!colorColumn || typeof value !== 'number') return '';

    // 计算在当前数据集中的相对强度（0-1之间）
    const values = data.map(row => row[colorColumn]).filter(v => typeof v === 'number') as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);

    // 如果所有值相等，返回均匀的浅色
    if (min === max) {
      return 'bg-amber-50/50 dark:bg-amber-900/10';
    }

    // 计算数据集的差异范围
    const range = max - min;

    // 如果差异很小（绝对差异 < 8%），认为贡献均匀，使用统一的显著琥珀色
    // 例如：51.33% vs 48.67% 的差异只有2.66%，应该视为均匀分布但仍然显著
    if (range < 8) {
      return 'bg-amber-100/60 dark:bg-amber-900/20';
    }

    // 计算相对强度
    const intensity = (value - min) / range;

    // 根据强度返回不同的背景色
    if (intensity >= 0.8) {
      return 'bg-amber-100/70 dark:bg-amber-900/30'; // 高影响 - 较深的琥珀色
    } else if (intensity >= 0.6) {
      return 'bg-amber-50/60 dark:bg-amber-900/20'; // 中高影响
    } else if (intensity >= 0.4) {
      return 'bg-amber-25/50 dark:bg-amber-900/15'; // 中等影响
    } else if (intensity >= 0.2) {
      return 'bg-amber-25/40 dark:bg-amber-900/10'; // 低中等影响
    } else {
      return 'bg-amber-25/30 dark:bg-amber-900/5'; // 低影响 - 很浅的琥珀色
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <table className="min-w-full text-sm">
        <thead className="text-neutral-500">
          <tr>
            {columns.map((c, index) => (
              <th key={String(c.key)} className={`px-4 py-3 font-medium whitespace-nowrap ${index === 0 ? 'text-left' : 'text-right'}`}>
                <div className={`flex items-center gap-1 ${index === 0 ? '' : 'justify-end'}`}>
                  {c.title}
                  {c.icon && <c.icon className="h-4 w-4" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className={`border-t border-neutral-100 dark:border-neutral-800 transition-colors ${
                colorColumn ? getRowColorClass(row[colorColumn] as number) : ''
              }`}
            >
              {columns.map((c, index) => (
                <td key={String(c.key)} className={`px-4 py-3 whitespace-nowrap ${index === 0 ? 'text-left' : 'text-right'}`}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

