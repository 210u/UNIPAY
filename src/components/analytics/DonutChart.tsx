"use client";

import { cn } from '@/lib/utils';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  totalLabel?: string;
  className?: string;
}

export const DonutChart = ({
  data,
  size = 160,
  thickness = 22,
  totalLabel = 'Total',
  className,
}: DonutChartProps) => {
  const total = data.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cumulative = 0;

  const gradientSegments = data
    .map((segment) => {
      const start = (cumulative / total) * 360;
      cumulative += segment.value;
      const end = (cumulative / total) * 360;
      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-6 w-full", className)}>
      <div
        className="relative rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(124,58,237,0.25)]"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientSegments})`,
        }}
      >
        <div
          className="rounded-full bg-cardBg text-center flex flex-col items-center justify-center"
          style={{
            width: size - thickness * 2,
            height: size - thickness * 2,
          }}
        >
          <span className="text-xs text-textSecondary uppercase tracking-wide">{totalLabel}</span>
          <span className="text-2xl font-semibold text-textPrimary">{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {data.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-medium text-textPrimary">{segment.label}</span>
            </div>
            <span className="text-sm font-semibold text-textPrimary">
              {segment.value.toLocaleString()} ({Math.round((segment.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;

