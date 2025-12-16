import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  const getColorClass = (progress: number) => {
    if (progress < 40) {
      return 'bg-red-500'; // Red for low progress
    } else if (progress < 70) {
      return 'bg-yellow-500'; // Yellow for medium progress
    } else {
      return 'bg-green-500'; // Green for high progress
    }
  };

  return (
    <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", className)}>
      <div
        className={cn("h-2.5 rounded-full", getColorClass(progress))}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
