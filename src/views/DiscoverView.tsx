import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ApplicationRecord, PlatformId } from '../types/store';
import { AppCard } from '../components/common/AppCard';
import { AppIcon, PlatformIcons } from '../components/common/AppIcons';
import { formatCurrency } from '../utils/rules';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Check,
  Flame,
  Layers,
  Search,
  CheckCircle2,
  Cpu,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { DiscoverViewSkeleton } from '../components/common/Skeletons';

interface DiscoverViewProps {
  applications: ApplicationRecord[];
  onSelectApp: (slug: string) => void;
  onNavigate: (route: string) => void;
  loading?: boolean;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  applications,
  onSelectApp,
  onNavigate,
  loading = false,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useNotification();

  // If data is loading or applications list is empty, show shimmer skeleton loader
  if (loading || applications.length === 0) {
    return <DiscoverViewSkeleton />;
  }

  // Slider State & Refs for Trending Right Now carousel
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  // Flagship spotlight app
  const spotlightApp =
    applications.find((a) => a.slug === 'hyperflow-studio') || applications[0];

  // Filtering by platform
  const filteredApps = applications.filter((app) => {
    if (selectedPlatform === 'all') return true;
    return app.supportedPlatforms.includes(selectedPlatform);
  });

  // Trending top apps for mobile horizontal rail
  const trendingApps = applications.slice(0, 6);

  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = el.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveSlide(Math.min(Math.max(0, index), trendingApps.length - 1));
  }, [trendingApps.length]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // Gentle auto-advance when not interacting
  useEffect(() => {
    if (isSliderHovered) return;
    const interval = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      const firstCard = el.firstElementChild as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isSliderHovered]);

  const scrollToSlide = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
    el.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  const scrollByCard = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
    const distance = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const creatorApps = applications.filter(
    (a) => a.category === 'Creative & Design'
  );
  const developerApps = applications.filter(
    (a) => a.category === 'Developer Tools'
  );
  const freeApps = applications.filter(
    (a) => a.basePriceUsd === 0 || a.licenseModel === 'free' || a.licenseModel === 'open_source'
  );

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address' });
      return;
    }
    setIsSubscribed(true);
    showToast({
      type: 'success',
      title: 'Subscribed',
      message: 'You will receive monthly verified release digests.',
    });
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-20">
      {/* Editorial Hero Section - Mobile Attention-Grabbing & High Impact */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-8 sm:pb-14 rounded-3xl bg-gradient-to-b from-neutral-100 dark:from-neutral-900/90 via-neutral-50 dark:via-[#0C0F17] to-transparent border border-neutral-200/90 dark:border-neutral-800/80 p-5 sm:p-8 md:p-12 shadow-sm dark:shadow-none">
        {/* Subtle ambient gradient mesh */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-sky-500/20 blur-[100px] sm:blur-[130px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Prominent Owner & Author Spotlight Pill with Shimmer & Animated Aura */}
          <div className="sahriva-author-badge px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-500 sahriva-sparkle-icon mr-2 shrink-0" />
            <span className="text-neutral-700 dark:text-neutral-300 mr-1.5 hidden xs:inline">Store Architect & Curator:</span>
            <span className="sahriva-author-name text-sm sm:text-base font-extrabold tracking-tight">Shiva Sai Valaboju</span>
            <CheckCircle2 className="w-4 h-4 text-violet-500 ml-2 shrink-0" />
          </div>

          <h1 className="text-2.5xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white text-balance leading-[1.15]">
            Discover Software That <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">Does More</span>.
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Hand-curated, notarized software crafted for high performance across macOS, Windows, Linux, and Android. Built with devotion by <strong className="sahriva-author-name font-bold">Shiva Sai Valaboju</strong>.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={() => onNavigate('/apps')}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore 20+ Applications</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('/categories')}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-900/90 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Browse Categories
            </button>
          </div>

          {/* Mobile Attention Grabbing Quick Stat Pill Strip */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Notarized Builds
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <Cpu className="w-3.5 h-3.5 text-sky-500" />
              Native Silicon Ready
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Zero Telemetry Bloat
            </span>
          </div>
        </div>

        {/* Featured Editorial Spotlight Card */}
        {spotlightApp && (
          <>
            {/* Mobile Viewport: Minimal, Punchy & Attention-Grabbing HyperFlow Spotlight */}
            <div className="block sm:hidden mt-6 rounded-2xl bg-gradient-to-br from-[#121026] via-[#0E1320] to-[#0A0D15] border border-violet-500/40 p-4 shadow-xl text-white sahriva-card relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/25 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                    Featured Spotlight
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9</span>
                    <span className="text-neutral-400 text-[10px] font-normal">({spotlightApp.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <AppIcon
                      name={spotlightApp.iconSvgName}
                      accentColor={spotlightApp.accentColor}
                      className="w-12 h-12 rounded-xl shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] shadow-sm font-bold">
                      ★
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-extrabold text-white tracking-tight truncate">
                      {spotlightApp.name}
                    </h2>
                    <p className="text-xs text-violet-300/90 font-medium">
                      Pro 120 FPS Motion Engine
                    </p>
                  </div>
                </div>

                {/* Minimal Micro-Specs Row */}
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-semibold">⚡ 120 FPS Native</span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800">Metal & Vulkan</span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-800/50">DMG · MSI</span>
                </div>

                {/* High Impact Action Button */}
                <button
                  onClick={() => onSelectApp(spotlightApp.slug)}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 rounded-xl shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Explore HyperFlow Studio · $49.00</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop & Tablet Viewport: Comprehensive Editorial Showcase */}
            <div className="hidden sm:block mt-8 sm:mt-14 max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-neutral-900/95 via-[#101522] to-neutral-950 border border-neutral-800/90 p-5 sm:p-7 md:p-8 shadow-2xl text-white sahriva-card">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
                    <span className="uppercase tracking-wider">EDITORIAL SPOTLIGHT</span>
                    <span>·</span>
                    <span>{spotlightApp.editorialBadge || 'Featured Application'}</span>
                  </div>

                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <AppIcon
                      name={spotlightApp.iconSvgName}
                      accentColor={spotlightApp.accentColor}
                      className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
                    />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {spotlightApp.name}
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">by {spotlightApp.developer}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {spotlightApp.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {spotlightApp.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                    <button
                      onClick={() => onSelectApp(spotlightApp.slug)}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/30 cursor-pointer active:scale-95"
                    >
                      <span>View Specifications & Builds</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-white">{spotlightApp.rating}</span>
                      <span>({spotlightApp.reviewCount} verified reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Spotlight Visual Mockup */}
                <div className="lg:col-span-5 rounded-xl bg-neutral-950/90 border border-neutral-800 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {spotlightApp.slug}.app
                    </span>
                  </div>

                  <div className="h-40 sm:h-44 rounded-lg bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-neutral-900 border border-neutral-800/80 p-3.5 sm:p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <span className="font-medium text-white">Universal Platform Engine</span>
                      <span className="font-mono text-violet-400">v{spotlightApp.builds[0]?.version || '3.4.1'}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-sky-400 w-4/5 animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Metal 3 / Vulkan 1.3 Acceleration</span>
                        <span className="text-emerald-400 font-mono">120 FPS</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60">
                      <span className="text-neutral-400">Verified Formats:</span>
                      <span className="font-mono text-neutral-200">DMG · MSI · AppImage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modern Attention-Grabbing Interactive Trending Card Slider */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-amber-600/10 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Trending Right Now
                </h2>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  LIVE RANKINGS
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Most downloaded applications this week · Verified direct builds
              </p>
            </div>
          </div>

          {/* Slider Controls: Arrows & View All */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900/80 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <button
                onClick={() => scrollByCard('left')}
                disabled={!canScrollLeft}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'text-neutral-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-xs active:scale-90'
                    : 'text-neutral-400 dark:text-neutral-600 opacity-30 cursor-not-allowed'
                }`}
                aria-label="Previous trending application"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollByCard('right')}
                disabled={!canScrollRight}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  canScrollRight
                    ? 'text-neutral-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-xs active:scale-90'
                    : 'text-neutral-400 dark:text-neutral-600 opacity-30 cursor-not-allowed'
                }`}
                aria-label="Next trending application"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('/apps')}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 px-2 py-1 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Rail Container with Soft Edge Fades */}
        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsSliderHovered(true)}
          onMouseLeave={() => setIsSliderHovered(false)}
          onTouchStart={() => setIsSliderHovered(true)}
          onTouchEnd={() => setIsSliderHovered(false)}
        >
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-3 -mx-4 px-4 sm:mx-0 sm:px-0 carousel-smooth-rail snap-x snap-mandatory"
          >
            {trendingApps.map((app, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={app.id}
                  className="w-[82vw] max-w-[315px] sm:w-[320px] md:w-[340px] snap-start shrink-0 relative flex flex-col transition-all duration-300"
                >
                  {/* Top Ranking Ribbon Badge */}
                  <div className="absolute -top-2 left-4 z-20">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md border ${
                        isFirst
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 shadow-amber-500/25'
                          : isSecond
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-400 shadow-violet-500/25'
                          : isThird
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-sky-300 shadow-sky-500/25'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      #{idx + 1} Trending
                    </span>
                  </div>

                  <div className="h-full pt-1.5">
                    <AppCard app={app} onSelect={onSelectApp} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Pagination Indicators & Progress Bar */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-1.5">
            {trendingApps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                aria-label={`Jump to trending card ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx
                    ? 'w-7 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-sm'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>

          <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <span className="font-bold text-neutral-900 dark:text-white">
              0{activeSlide + 1}
            </span>
            <span>/</span>
            <span>0{trendingApps.length}</span>
            <span className="hidden xs:inline text-[10px] text-neutral-400 ml-1">· Swipe or click arrows</span>
          </div>
        </div>
      </section>

      {/* Interactive Platform Segmented Filter Bar - Order: android, windows, mac (Linux discarded) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Essential Applications
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Curated software with verified installers and guaranteed platform compatibility
            </p>
          </div>

          {/* Touch-Friendly Horizontal Platform Tabs in requested order: Android, Windows, macOS */}
          <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <div className="inline-flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
              {(
                [
                  { id: 'all', label: 'All OS' },
                  { id: 'android', label: 'Android' },
                  { id: 'windows', label: 'Windows' },
                  { id: 'macos', label: 'macOS' },
                ] as const
              ).map((tab) => {
                const active = selectedPlatform === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedPlatform(tab.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                      active
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    {tab.id === 'android' && <PlatformIcons.android className="w-3.5 h-3.5" />}
                    {tab.id === 'windows' && <PlatformIcons.windows className="w-3.5 h-3.5" />}
                    {tab.id === 'macos' && <PlatformIcons.macos className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Application Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} />
          ))}
        </div>
      </section>

      {/* Creator Tools Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Powerful Tools for Creators
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              High-precision vector illustration, typography, audio workstations, and motion engines
            </p>
          </div>
          <button
            onClick={() => onNavigate('/categories/creative-design')}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {creatorApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} featured={false} />
          ))}
        </div>
      </section>

      {/* Developer Essentials Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Developer Essentials
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              GPU-accelerated terminals, database IDEs, and local security infrastructure
            </p>
          </div>
          <button
            onClick={() => onNavigate('/categories/developer-tools')}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {developerApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} featured={false} />
          ))}
        </div>
      </section>

      {/* Seamless Across Devices Banner */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-50/70 via-white to-sky-50/70 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#121826] border border-neutral-200/90 dark:border-neutral-800 shadow-sm dark:shadow-none">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <span className="text-xs font-semibold text-violet-600 dark:text-sky-400 uppercase tracking-wider">
            SEAMLESS WORKFLOWS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Engineered for Every Device You Own
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
            Software built for cross-platform interoperability. Purchase once or download open-source editions that run natively on macOS Apple Silicon, Windows 11, Linux distributions, and Android companions.
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-6 pt-2 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <PlatformIcons.macos className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
              <span>macOS (Apple Silicon)</span>
            </div>
            <div className="flex items-center gap-2">
              <PlatformIcons.windows className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
              <span>Windows (EXE / MSI)</span>
            </div>
            <div className="flex items-center gap-2">
              <PlatformIcons.linux className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
              <span>Linux (AppImage / DEB)</span>
            </div>
            <div className="flex items-center gap-2">
              <PlatformIcons.android className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
              <span>Android (APK / Play)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free & Open Source Applications */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Free & Community Software
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Exceptional applications available at zero cost with open licenses and no telemetry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {freeApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} />
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-center max-w-2xl mx-auto space-y-3.5 shadow-sm dark:shadow-none">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
          Stay Informed on Verified Releases
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
          Receive monthly notifications of verified version upgrades, architecture improvements, and new platform ports. No marketing spam.
        </p>

        {isSubscribed ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ Thank you! You are subscribed to SAHRIVA Store verified releases.
          </p>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="engineer@company.com"
              className="w-full px-4 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-violet-500/20 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
