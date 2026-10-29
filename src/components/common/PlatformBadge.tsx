import React from 'react';
import type { PlatformId } from '../../types/store';
import { PlatformIcons } from './AppIcons';

interface PlatformListProps {
  platforms: PlatformId[];
  className?: string;
}

export const PlatformList: React.FC<PlatformListProps> = ({ platforms, className = '' }) => {
  const labels: Record<PlatformId, string> = {
    android: 'Android',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
  };

  const priority: Record<PlatformId, number> = {
    android: 1,
    windows: 2,
    macos: 3,
    linux: 4,
  };

  const sortedPlatforms = [...platforms].sort(
    (a, b) => (priority[a] ?? 99) - (priority[b] ?? 99)
  );

  return (
    <div className={`flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 ${className}`}>
      {sortedPlatforms.map((p, idx) => {
        const Icon = PlatformIcons[p];
        return (
          <span key={p} className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{labels[p]}</span>
            {idx < sortedPlatforms.length - 1 && (
              <span className="opacity-40" aria-hidden="true">
                ·
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};
