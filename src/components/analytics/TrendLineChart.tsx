"use client";

import { cn } from '@/lib/utils';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendLineChartProps {
  data: TrendPoint[];
  className?: string;
  showGradient?: boolean;
}

export const TrendLineChart = ({
  data,
  className,
  showGradient = true,
}: TrendLineChartProps) => {
  if (!data || data.length < 2) {
    return <div className={cn("h-32 flex items-center justify-center text-sm text-textSecondary", className)}>Insufficient data</div>;
  }

  const values = data.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const normalized = (point.value - min) / range;
    const y = 100 - normalized * 80 - 10; // pad top/bottom
    return `${x},${y}`;
  });

  const path = `M ${points.join(' L ')}`;
  const areaPath = showGradient ? `${path} L 100,100 L 0,100 Z` : undefined;

  return (
    <div className={cn("w-full h-48", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {showGradient && (
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(124,58,237,0.35)" />
              <stop offset="100%" stopColor="rgba(124,58,237,0)" />
            </linearGradient>
          </defs>
        )}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#trendGradient)"
            stroke="none"
          />
        )}
        <path
          d={path}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {points.map((point, idx) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={1.2}
              fill="#7c3aed"
              stroke="#fff"
              strokeWidth={0.5}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-textSecondary mt-2">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

export default TrendLineChart;

