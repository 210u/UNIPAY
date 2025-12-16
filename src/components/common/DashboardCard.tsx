import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ children, className }: DashboardCardProps) => {
  return (
    <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow", className)}>
      {children}
    </div>
  );
};

export default DashboardCard;
