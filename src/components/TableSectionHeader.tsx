/**
 * Table Section Header Component
 * A small header for table sections with icon and title
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface TableSectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export const TableSectionHeader: React.FC<TableSectionHeaderProps> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-600">
      <Icon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
    </div>
    <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{title}</h4>
  </div>
);

