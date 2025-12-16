import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string; // Text to display if no src is provided (e.g., initials)
}

const Avatar = ({ src, alt, className, fallback }: AvatarProps) => {
  const initials = fallback || alt.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={cn(
      "relative inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200",
      className
    )}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
