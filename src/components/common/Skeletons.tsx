import React from 'react';

/**
 * Reusable Shimmer Skeleton component with animated iridescent wave
 */
export const SkeletonBox: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = '', style }) => {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Shimmer skeleton loader replicating the AppCard layout with exact dimensions
 */
export const AppCardSkeleton: React.FC<{
  featured?: boolean;
}> = ({ featured = false }) => {
  return (
    <div
      className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#0E131F]/90 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm overflow-hidden ${
        featured
          ? 'md:col-span-2 bg-gradient-to-br from-neutral-50 to-white dark:from-[#111728] dark:via-[#0F1422] dark:to-[#0A0D15]'
          : ''
      }`}
      aria-busy="true"
      aria-label="Loading application details"
    >
      <div>
        {/* Top bar with icon, info, and bookmark placeholder */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            {/* 48-56px App Icon Placeholder */}
            <SkeletonBox className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0" />

            <div className="min-w-0 flex-1 space-y-2">
              {/* App title placeholder */}
              <SkeletonBox className="h-4 w-3/4 max-w-[140px]" />
              {/* Developer name placeholder */}
              <SkeletonBox className="h-3 w-1/2 max-w-[100px]" />
            </div>
          </div>

          {/* Bookmark button placeholder */}
          <SkeletonBox className="w-9 h-9 rounded-xl shrink-0" />
        </div>

        {/* Short description / tagline placeholders */}
        <div className="mt-3.5 space-y-2">
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-4/5" />
        </div>
      </div>

      {/* Footer bar: Platforms, Rating, Price placeholders */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/70 flex items-center justify-between gap-2">
        {/* Platforms placeholder chips */}
        <div className="flex items-center gap-1.5 flex-1">
          <SkeletonBox className="h-3.5 w-12 rounded-md" />
          <SkeletonBox className="h-3.5 w-14 rounded-md" />
          <SkeletonBox className="h-3.5 w-12 rounded-md hidden sm:block" />
        </div>

        {/* Rating and price placeholders */}
        <div className="flex items-center gap-2.5 shrink-0">
          <SkeletonBox className="h-4 w-9 rounded-md" />
          <SkeletonBox className="h-6 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Shimmer skeleton for Hero & Spotlight section
 */
export const HeroSpotlightSkeleton: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-6 sm:pt-12 pb-8 sm:pb-14 rounded-3xl bg-gradient-to-b from-neutral-100 dark:from-neutral-900/90 via-neutral-50 dark:via-[#0C0F17] to-transparent border border-neutral-200/90 dark:border-neutral-800/80 p-5 sm:p-8 md:p-12 shadow-sm">
      <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
        {/* Author badge placeholder */}
        <div className="flex justify-center">
          <SkeletonBox className="h-8 w-56 sm:w-72 rounded-full" />
        </div>

        {/* Headline placeholder */}
        <div className="space-y-2.5 max-w-2xl mx-auto flex flex-col items-center">
          <SkeletonBox className="h-8 sm:h-12 w-4/5" />
          <SkeletonBox className="h-8 sm:h-12 w-3/5" />
        </div>

        {/* Description placeholder */}
        <div className="space-y-2 max-w-xl mx-auto flex flex-col items-center pt-1">
          <SkeletonBox className="h-3.5 w-full" />
          <SkeletonBox className="h-3.5 w-4/5" />
        </div>

        {/* CTA Buttons placeholder */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <SkeletonBox className="h-11 w-full sm:w-48 rounded-xl" />
          <SkeletonBox className="h-11 w-full sm:w-40 rounded-xl" />
        </div>

        {/* Micro-pills strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <SkeletonBox className="h-6 w-28 rounded-md" />
          <SkeletonBox className="h-6 w-32 rounded-md" />
          <SkeletonBox className="h-6 w-30 rounded-md" />
        </div>
      </div>

      {/* Spotlight Card Skeleton: Minimal on mobile, Deep showcase on desktop */}
      <div className="mt-8 sm:mt-14 max-w-5xl mx-auto">
        {/* Mobile Viewport: Minimal Card Skeleton */}
        <div className="block sm:hidden rounded-2xl bg-[#0E1320] border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-5 w-24 rounded-full" />
            <SkeletonBox className="h-4 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <SkeletonBox className="h-4 w-20 rounded" />
            <SkeletonBox className="h-4 w-20 rounded" />
            <SkeletonBox className="h-4 w-16 rounded" />
          </div>
          <SkeletonBox className="h-10 w-full rounded-xl" />
        </div>

        {/* Desktop Viewport: Rich Spotlight Skeleton */}
        <div className="hidden sm:block rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 md:p-8">
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7 space-y-4">
              <SkeletonBox className="h-4 w-36 rounded-md" />
              <div className="flex items-center gap-4">
                <SkeletonBox className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <SkeletonBox className="h-6 w-48" />
                  <SkeletonBox className="h-3.5 w-28" />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBox className="h-3.5 w-full" />
                <SkeletonBox className="h-3.5 w-5/6" />
              </div>
              <div className="space-y-2 pt-1">
                <SkeletonBox className="h-3.5 w-2/3" />
                <SkeletonBox className="h-3.5 w-1/2" />
                <SkeletonBox className="h-3.5 w-3/5" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <SkeletonBox className="h-10 w-44 rounded-xl" />
                <SkeletonBox className="h-4 w-32 rounded" />
              </div>
            </div>

            <div className="col-span-5 rounded-xl bg-neutral-950 p-5 space-y-3.5 border border-neutral-800">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <SkeletonBox className="h-3 w-16 rounded" />
                <SkeletonBox className="h-3 w-24 rounded" />
              </div>
              <div className="h-40 rounded-lg p-4 flex flex-col justify-between border border-neutral-800/60 bg-neutral-900/40">
                <div className="flex justify-between">
                  <SkeletonBox className="h-3.5 w-32" />
                  <SkeletonBox className="h-3.5 w-12" />
                </div>
                <SkeletonBox className="h-2 w-full rounded-full" />
                <div className="flex justify-between pt-2 border-t border-neutral-800">
                  <SkeletonBox className="h-3 w-20" />
                  <SkeletonBox className="h-3 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Shimmer skeleton for Trending Right Now slider
 */
export const TrendingSliderSkeleton: React.FC = () => {
  return (
    <section className="space-y-4">
      {/* Header with icon and arrow placeholders */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SkeletonBox className="w-8 h-8 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <SkeletonBox className="h-5 w-40" />
            <SkeletonBox className="h-3 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-8 w-16 rounded-xl" />
          <SkeletonBox className="h-4 w-12 rounded" />
        </div>
      </div>

      {/* Horizontal Cards Rail */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-3 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="w-[82vw] max-w-[315px] sm:w-[320px] md:w-[340px] shrink-0 relative"
          >
            <div className="absolute -top-2 left-4 z-10">
              <SkeletonBox className="h-5 w-24 rounded-full shadow-sm" />
            </div>
            <div className="pt-1.5 h-full">
              <AppCardSkeleton />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Pills */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-1.5">
          <SkeletonBox className="h-1.5 w-7 rounded-full" />
          <SkeletonBox className="h-1.5 w-2 rounded-full" />
          <SkeletonBox className="h-1.5 w-2 rounded-full" />
          <SkeletonBox className="h-1.5 w-2 rounded-full" />
        </div>
        <SkeletonBox className="h-3 w-16 rounded" />
      </div>
    </section>
  );
};

/**
 * Shimmer skeleton for Essential Applications section
 */
export const EssentialSectionSkeleton: React.FC = () => {
  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-3 w-72" />
        </div>

        {/* Platform tabs placeholder */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <SkeletonBox className="h-7 w-16 rounded-lg" />
          <SkeletonBox className="h-7 w-20 rounded-lg" />
          <SkeletonBox className="h-7 w-20 rounded-lg" />
          <SkeletonBox className="h-7 w-18 rounded-lg" />
        </div>
      </div>

      {/* Grid of 6 AppCard skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
};

/**
 * Shimmer skeleton for Creator & Developer Grid sections
 */
export const FeatureSectionSkeleton: React.FC<{ titleWidth?: string }> = ({
  titleWidth = 'w-48',
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBox className={`h-6 ${titleWidth}`} />
          <SkeletonBox className="h-3 w-64" />
        </div>
        <SkeletonBox className="h-4 w-16 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <AppCardSkeleton />
        <AppCardSkeleton />
      </div>
    </section>
  );
};

/**
 * Complete Shimmer Skeleton for Discover View
 */
export const DiscoverViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 sm:space-y-16 pb-20 animate-pulse-subtle">
      <HeroSpotlightSkeleton />
      <TrendingSliderSkeleton />
      <EssentialSectionSkeleton />
      <FeatureSectionSkeleton titleWidth="w-56" />
      <FeatureSectionSkeleton titleWidth="w-48" />
    </div>
  );
};

/**
 * Complete Shimmer Skeleton for Catalog View
 */
export const CatalogViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-4">
        <SkeletonBox className="h-8 w-56" />
        <SkeletonBox className="h-3.5 w-96 max-w-full" />

        {/* Search input placeholder */}
        <SkeletonBox className="h-11 w-full max-w-2xl rounded-xl" />

        {/* Filter categories pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <SkeletonBox className="h-8 w-16 rounded-lg shrink-0" />
          <SkeletonBox className="h-8 w-28 rounded-lg shrink-0" />
          <SkeletonBox className="h-8 w-32 rounded-lg shrink-0" />
          <SkeletonBox className="h-8 w-24 rounded-lg shrink-0" />
          <SkeletonBox className="h-8 w-28 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Grid of 6 catalog card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

/**
 * Complete Shimmer Skeleton for App Detail View
 */
export const AppDetailViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Back button placeholder */}
      <SkeletonBox className="h-8 w-24 rounded-lg" />

      {/* Main App Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <SkeletonBox className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shrink-0" />
            <div className="space-y-2.5">
              <SkeletonBox className="h-7 w-48" />
              <SkeletonBox className="h-4 w-32" />
              <div className="flex gap-2 pt-1">
                <SkeletonBox className="h-4 w-16 rounded" />
                <SkeletonBox className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <SkeletonBox className="h-12 w-full sm:w-44 rounded-xl" />
            <SkeletonBox className="h-9 w-full sm:w-44 rounded-xl" />
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800">
          <SkeletonBox className="h-12 rounded-xl" />
          <SkeletonBox className="h-12 rounded-xl" />
          <SkeletonBox className="h-12 rounded-xl" />
          <SkeletonBox className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Specs / Tab placeholder */}
      <div className="space-y-4">
        <SkeletonBox className="h-6 w-36" />
        <SkeletonBox className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
};
