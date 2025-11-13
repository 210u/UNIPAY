import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ children, className }: DashboardCardProps) => {
  return (
    <div className={cn("bg-cardBg p-6 rounded-lg shadow-card border border-cardBorder", className)}>
      {children}
    </div>
  );
};

export default DashboardCard;
