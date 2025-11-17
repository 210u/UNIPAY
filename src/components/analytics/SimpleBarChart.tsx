"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BarDatum {
  label: string;
  value: number;
  hint?: string;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarDatum[];
  maxValue?: number;
  className?: string;
  barWidth?: number;
}

export const SimpleBarChart = ({
  data,
  maxValue,
  className,
  barWidth = 32,
}: SimpleBarChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-textSecondary text-sm", className)}>
        No data available
      </div>
    );
  }

  const computedMax = maxValue ?? Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={cn("flex items-end gap-6 h-48 w-full", className)}>
      {data.map((item) => {
        const heightPercent = Math.max((item.value / computedMax) * 100, 6);
        return (
          <div key={item.label} className="flex flex-col items-center gap-2 text-center flex-1 min-w-[60px]">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full rounded-full bg-gradient-to-b from-[#b794f4] to-[#7c3aed] shadow-[0_10px_30px_rgba(124,58,237,0.35)] flex items-end justify-center"
              style={{
                width: barWidth,
                background: `linear-gradient(180deg, ${item.color || '#c084fc'} 0%, #7c3aed 100%)`,
              }}
            >
              <span className="text-xs font-semibold text-white mb-2">{item.value.toLocaleString()}</span>
            </motion.div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-textPrimary">{item.label}</span>
              {item.hint && <span className="text-xs text-textSecondary">{item.hint}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SimpleBarChart;

