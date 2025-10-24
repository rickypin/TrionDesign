import React from "react";
import type { CardProps, SectionHeaderProps, KPIProps, TableProps } from "@/types";

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur shadow-sm ring-1 ring-black/5 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, right }) => (
  <div className="flex items-center justify-between gap-3 p-4 border-b border-neutral-200/70 dark:border-neutral-800/70">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
      </div>
    </div>
    {right}
  </div>
);

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

export const Table = <T extends Record<string, any>>({ columns, data, keyField }: TableProps<T>): React.ReactElement => (
  <div className="overflow-x-auto overflow-y-hidden">
    <table className="min-w-full text-sm">
      <thead className="text-left text-neutral-500">
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} className="px-4 py-3 font-medium whitespace-nowrap">{c.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row[keyField])} className="border-t border-neutral-100 dark:border-neutral-800">
            {columns.map((c) => (
              <td key={String(c.key)} className="px-4 py-3 whitespace-nowrap">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

