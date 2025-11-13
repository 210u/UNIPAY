import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'feature' | 'bug' | 'review' | 'testing' | 'high' | 'medium' | 'low';
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant, children, className }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const variants = {
    feature: 'bg-badgeFeatureBg text-badgeFeatureText',
    bug: 'bg-badgeBugBg text-badgeBugText',
    review: 'bg-badgeReviewBg text-badgeReviewText',
    testing: 'bg-badgeTestingBg text-badgeTestingText',
    high: 'bg-priorityHighBg text-priorityHighText',
    medium: 'bg-priorityMediumBg text-priorityMediumText',
    low: 'bg-priorityLowBg text-priorityLowText',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)}>{children}</span>
  );
};

export default Badge;

