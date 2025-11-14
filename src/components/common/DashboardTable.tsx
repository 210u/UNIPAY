import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode; // Optional custom renderer for cell content
  className?: string; // Optional className for header cell
}

interface DashboardTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

const DashboardTable = <T extends {}>({ data, columns, className }: DashboardTableProps<T>) => {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg neumorphic-raised", className)}>
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-cardBg">
          {data.map((item: T, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={cn(
                "hover:bg-sidebarItemHoverBg transition-colors",
                rowIndex < data.length - 1 && "neumorphic-divider"
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;
