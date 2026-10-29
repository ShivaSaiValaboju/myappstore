import React, { useState, useMemo } from 'react';
import type { ApplicationRecord, StoreCategory, PlatformId } from '../types/store';
import { AppCard } from '../components/common/AppCard';
import { CatalogViewSkeleton } from '../components/common/Skeletons';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

interface CatalogViewProps {
  applications: ApplicationRecord[];
  categories: StoreCategory[];
  initialCategory?: string;
  initialSearch?: string;
  onSelectApp: (slug: string) => void;
  loading?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  applications,
  categories,
  initialCategory,
  initialSearch = '',
  onSelectApp,
  loading = false,
}) => {
  if (loading || applications.length === 0) {
    return <CatalogViewSkeleton />;
  }
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'reviews'>('rating');

  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Platform filter
        if (selectedPlatform !== 'all' && !app.supportedPlatforms.includes(selectedPlatform)) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const matchCat =
            app.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedCategory ||
            app.category === selectedCategory;
          if (!matchCat) return false;
        }

        // Free vs Paid filter
        if (pricingFilter === 'free' && (app.basePriceUsd > 0 && app.licenseModel !== 'free')) {
          return false;
        }
        if (pricingFilter === 'paid' && app.basePriceUsd === 0) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = app.name.toLowerCase().includes(q);
          const matchDev = app.developer.toLowerCase().includes(q);
          const matchTagline = app.tagline.toLowerCase().includes(q);
          const matchFeature = app.features.some((f) => f.toLowerCase().includes(q));
          if (!matchName && !matchDev && !matchTagline && !matchFeature) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.basePriceUsd - b.basePriceUsd;
        if (sortBy === 'price_desc') return b.basePriceUsd - a.basePriceUsd;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });
  }, [applications, selectedPlatform, selectedCategory, pricingFilter, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedCategory('all');
    setPricingFilter('all');
    setSortBy('rating');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedPlatform !== 'all' ||
    selectedCategory !== 'all' ||
    pricingFilter !== 'all';

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Search and Title */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Application Catalog</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
          Search verified applications and filter by operating system, category, license model, and hardware architecture.
        </p>

        {/* Search Input Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, developer, category, or feature (e.g. GPU, Terminal, Vector, KaTeX)..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* OS Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">OS:</span>
            <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'macos', label: 'macOS' },
                  { id: 'windows', label: 'Windows' },
                  { id: 'linux', label: 'Linux' },
                  { id: 'android', label: 'Android' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    selectedPlatform === p.id
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Model */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">Price:</span>
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Software</option>
              <option value="free">Free / Community Only</option>
              <option value="paid">Paid & Commercial Only</option>
            </select>
          </div>
        </div>

        {/* Sort and Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-violet-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span className="font-medium">
          Showing <span className="font-mono text-white">{filteredApps.length}</span> applications
        </span>
      </div>

      {/* App Grid or Empty State */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No applications match your criteria</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting different operating systems, or clearing active filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
