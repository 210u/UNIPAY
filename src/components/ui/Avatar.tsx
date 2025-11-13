import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string; // Text to display if no src is provided (e.g., initials)
}

const Avatar = ({ src, alt, className, fallback }: AvatarProps) => {
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center h-8 w-8 rounded-full bg-sidebarItemHoverBg text-sm font-medium text-textPrimary",
      className
    )}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="select-none">{fallback || alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};

export default Avatar;

