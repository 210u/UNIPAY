import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  const getColorClass = (progress: number) => {
    if (progress < 40) {
      return 'bg-priorityLowBg'; // Light green
    } else if (progress < 70) {
      return 'bg-priorityMediumBg'; // Light yellow
    } else {
      return 'bg-priorityHighBg'; // Light red
    }
  };

  return (
    <div className={cn("w-full bg-inputBg rounded-full h-2.5", className)}>
      <div
        className={cn("h-2.5 rounded-full", getColorClass(progress))}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;

