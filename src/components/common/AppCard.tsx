import React from 'react';
import type { ApplicationRecord } from '../../types/store';
import { AppIcon } from './AppIcons';
import { PlatformList } from './PlatformBadge';
import { formatCurrency } from '../../utils/rules';
import { Star, Bookmark, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface AppCardProps {
  app: ApplicationRecord;
  onSelect: (slug: string) => void;
  featured?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onSelect, featured = false }) => {
  const { isInWishlist, toggleWishlist } = useCart();
  const bookmarked = isInWishlist(app.id);

  return (
    <div
      onClick={() => onSelect(app.slug)}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#0E131F]/90 hover:bg-neutral-50 dark:hover:bg-[#131929] border border-neutral-200/80 dark:border-neutral-800/80 hover:border-violet-300 dark:hover:border-violet-500/70 sahriva-card cursor-pointer shadow-sm active:scale-[0.98] overflow-hidden animate-card-entrance ${
        featured
          ? 'md:col-span-2 bg-gradient-to-br from-neutral-50 to-white dark:from-[#111728] dark:via-[#0F1422] dark:to-[#0A0D15]'
          : ''
      }`}
      data-cursor-interactive
    >
      {/* Dynamic ambient color glow that matches app accent */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: app.accentColor || '#8B5CF6' }}
      />

      <div>
        {/* Top bar with icon, info, and bookmark */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div
              className="relative shrink-0 sahriva-icon-container rounded-2xl"
              style={{
                boxShadow: `0 8px 22px -6px ${app.accentColor || '#8B5CF6'}45`,
              }}
            >
              <AppIcon
                name={app.iconSvgName}
                accentColor={app.accentColor}
                className="w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300"
              />
              {app.editorialBadge && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] shadow-sm font-bold">
                  ★
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white tracking-tight truncate group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                  {app.name}
                </h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline" />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1">
                <span>{app.developer}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500/80 inline shrink-0" />
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(app.id);
            }}
            className={`p-2 rounded-xl transition-all duration-150 cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center ${
              bookmarked
                ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-90'
            }`}
            aria-label={bookmarked ? `Remove ${app.name} from wishlist` : `Add ${app.name} to wishlist`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-violet-600 dark:fill-violet-400' : ''}`} />
          </button>
        </div>

        {/* Short description / tagline */}
        <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
          {app.tagline}
        </p>
      </div>

      {/* Footer bar: Platforms, Rating, Price */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/70 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <PlatformList platforms={app.supportedPlatforms} />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-neutral-900 dark:text-white">{app.rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">({app.reviewCount})</span>
          </div>

          <span
            className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
              app.basePriceUsd === 0
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40'
                : 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/60'
            }`}
          >
            {formatCurrency(app.basePriceUsd)}
          </span>
        </div>
      </div>
    </div>
  );
};
