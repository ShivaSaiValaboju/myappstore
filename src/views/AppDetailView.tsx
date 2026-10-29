import React, { useState, useEffect } from 'react';
import type {
  ApplicationRecord,
  PlatformId,
  ApplicationBuild,
  LicensePlan,
  DownloadAuthorization,
  Entitlement,
} from '../types/store';
import { AppIcon, PlatformIcons } from '../components/common/AppIcons';
import { formatCurrency, verifyDownloadEntitlement } from '../utils/rules';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import {
  Download,
  ShieldCheck,
  Check,
  Star,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  HardDrive,
  Cpu,
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { AppDetailViewSkeleton } from '../components/common/Skeletons';

interface AppDetailViewProps {
  app?: ApplicationRecord;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const AppDetailView: React.FC<AppDetailViewProps> = ({
  app,
  onBack,
  onNavigate,
}) => {
  if (!app) {
    return <AppDetailViewSkeleton />;
  }
  const { user, token, openAuthModal } = useAuth();
  const { addItem, isInWishlist, toggleWishlist } = useCart();
  const { showToast } = useNotification();

  // Entitlements state
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isAuthorizingDownload, setIsAuthorizingDownload] = useState(false);
  const [downloadAuth, setDownloadAuth] = useState<DownloadAuthorization | null>(null);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Selected platform (defaults to macOS or first supported platform)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>(() => {
    if (app.supportedPlatforms.includes('macos')) return 'macos';
    return app.supportedPlatforms[0] || 'macos';
  });

  // Selected build for that platform
  const currentPlatformBuilds = app.builds.filter((b) => b.platform === selectedPlatform);
  const [selectedBuildId, setSelectedBuildId] = useState<string>(() => {
    const recommended = app.platformSupport[selectedPlatform]?.recommendedBuildId;
    return recommended || currentPlatformBuilds[0]?.id || '';
  });

  // Keep selectedBuildId in sync when platform switches
  useEffect(() => {
    const builds = app.builds.filter((b) => b.platform === selectedPlatform);
    const recommended = app.platformSupport[selectedPlatform]?.recommendedBuildId;
    if (recommended && builds.some((b) => b.id === recommended)) {
      setSelectedBuildId(recommended);
    } else if (builds.length > 0) {
      setSelectedBuildId(builds[0].id);
    } else {
      setSelectedBuildId('');
    }
  }, [selectedPlatform, app]);

  // Load user entitlements
  useEffect(() => {
    if (!token) {
      setEntitlements([]);
      return;
    }
    fetch('/api/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setEntitlements(data.map((d) => d.entitlement).filter(Boolean));
        }
      })
      .catch((err) => console.error('Failed to load entitlements:', err));
  }, [token]);

  // Load reviews
  useEffect(() => {
    fetch(`/api/apps/${app.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reviews)) {
          setReviewsList(data.reviews);
        }
      })
      .catch(() => {});
  }, [app.slug]);

  const activeBuild = app.builds.find((b) => b.id === selectedBuildId) || currentPlatformBuilds[0];
  const platformSupportInfo = app.platformSupport[selectedPlatform];
  const isPlatformSupported = platformSupportInfo?.supported && currentPlatformBuilds.length > 0;

  // Check if user owns entitlement
  const entitlementCheck = verifyDownloadEntitlement(app, entitlements);
  const isOwned = entitlementCheck.authorized && entitlementCheck.reason === 'valid_license';
  const isFree = app.basePriceUsd === 0 || app.licenseModel === 'free' || app.licenseModel === 'open_source';

  const selectedPlan: LicensePlan = app.licensePlans[0] || {
    id: 'default',
    appId: app.id,
    name: 'Standard License',
    tier: 'personal',
    priceUsd: app.basePriceUsd,
    maxDeviceActivations: 2,
    features: ['Standard commercial license', 'Device activations: 2'],
  };

  const handleDownloadAuthorize = async () => {
    if (!activeBuild) return;

    if (!isFree && !isOwned) {
      // Need to purchase first
      addItem({
        appId: app.id,
        planId: selectedPlan.id,
        appName: app.name,
        planName: selectedPlan.name,
        priceUsd: selectedPlan.priceUsd,
        developer: app.developer,
        iconSvgName: app.iconSvgName,
        accentColor: app.accentColor,
      });
      return;
    }

    setIsAuthorizingDownload(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/downloads/authorize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          appId: app.id,
          buildId: activeBuild.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showToast({
          type: 'error',
          title: 'Authorization Denied',
          message: errorData.message || 'Entitlement validation failed',
        });
        return;
      }

      const authData: DownloadAuthorization = await res.json();
      setDownloadAuth(authData);

      showToast({
        type: 'success',
        title: 'Download Authorized',
        message: `Verified token generated for ${authData.filename}`,
      });

      // Trigger automatic safe browser download of authorized package
      window.location.href = authData.downloadUrl;
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Download Service Unavailable',
        message: 'Could not connect to secure download pipeline',
      });
    } finally {
      setIsAuthorizingDownload(false);
    }
  };

  const copyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast({
      type: 'info',
      title: 'Checksum Copied',
      message: 'SHA-256 hash copied to clipboard for verification',
    });
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast({
      type: 'success',
      title: 'License Key Copied',
      message: 'Paste into application activation dialog',
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetch(`/api/apps/${app.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          platformUsed: selectedPlatform,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewsList((prev: any) => [data.review, ...prev]);
        setIsReviewOpen(false);
        setReviewTitle('');
        setReviewComment('');
        showToast({
          type: 'success',
          title: 'Review Submitted',
          message: 'Thank you for your verified feedback',
        });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to submit review' });
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span>{app.category}</span>
          <span>/</span>
          <span className="text-neutral-900 dark:text-white font-medium">{app.name}</span>
        </div>
      </div>

      {/* Main Product Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <AppIcon
              name={app.iconSvgName}
              accentColor={app.accentColor}
              className="w-20 h-20 md:w-24 md:h-24 shrink-0 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {app.name}
                </h1>
                {app.editorialBadge && (
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/40 px-2.5 py-0.5 rounded-full">
                    {app.editorialBadge}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Developed by{' '}
                <a
                  href={app.developerWebsite || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-900 dark:text-neutral-200 hover:text-violet-600 dark:hover:text-violet-400 font-medium underline-offset-2 hover:underline"
                >
                  {app.developer}
                </a>
              </p>

              <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                <div className="flex items-center gap-1 tabular-nums">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">{app.rating.toFixed(1)}</span>
                  <span>({app.reviewCount} verified reviews)</span>
                </div>
                <span>·</span>
                <span className="capitalize">{app.licenseModel.replace('_', ' ')} License</span>
              </div>
            </div>
          </div>

          {/* Quick Price & Wishlist */}
          <div className="flex items-center gap-3 self-start">
            <button
              onClick={() => toggleWishlist(app.id)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                isInWishlist(app.id)
                  ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-300 dark:border-violet-800 text-violet-600 dark:text-violet-400'
                  : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Save to wishlist"
            >
              <Bookmark className={`w-5 h-5 ${isInWishlist(app.id) ? 'fill-violet-500' : ''}`} />
            </button>

            <div className="text-right">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">License Price</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {formatCurrency(app.basePriceUsd)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-4xl pt-2">
          {app.description}
        </p>
      </div>

      {/* Cross-Platform Selector & Download Panel (CORE REQUIREMENT) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Cross-Platform Builds & Entitlements</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Select your operating system and CPU architecture to inspect verified releases, signatures, and authorized downloads.
          </p>
        </div>

        {/* Platform Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['macos', 'windows', 'linux', 'android'] as const).map((platform) => {
            const isSupported = app.supportedPlatforms.includes(platform);
            const isSelected = selectedPlatform === platform;
            const Icon = PlatformIcons[platform];

            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50 dark:bg-neutral-800/90 border-violet-500 shadow-md ring-1 ring-violet-500/50'
                    : isSupported
                    ? 'bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300'
                    : 'bg-neutral-100/50 dark:bg-neutral-950/40 border-neutral-200/50 dark:border-neutral-800/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-violet-600/20 text-violet-600 dark:text-violet-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSupported ? (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 dark:bg-neutral-900 px-2 py-0.5 rounded">
                      UNAVAILABLE
                    </span>
                  )}
                </div>

                <span className="text-sm font-bold text-neutral-900 dark:text-white capitalize">{platform}</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                  {isSupported
                    ? `${app.builds.filter((b) => b.platform === platform).length} verified build(s)`
                    : 'No distribution package'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Platform Build Panel */}
        {isPlatformSupported && activeBuild ? (
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0E121C] border border-neutral-200 dark:border-neutral-800 shadow-md dark:shadow-none space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    Official Distribution Build
                  </span>
                  <span>·</span>
                  <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">v{activeBuild.version}</span>
                  <span className="text-xs text-neutral-500">({activeBuild.releaseDate})</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{activeBuild.packageFormatLabel}</h3>
              </div>

              {/* Architecture Switcher if multiple builds exist */}
              {currentPlatformBuilds.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Architecture:</span>
                  <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                    {currentPlatformBuilds.map((build) => (
                      <button
                        key={build.id}
                        onClick={() => setSelectedBuildId(build.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          selectedBuildId === build.id
                            ? 'bg-violet-600 text-white font-semibold shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {build.architectureLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  Package Size
                </span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">{activeBuild.fileSizeFormatted}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Target Architecture
                </span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{activeBuild.architectureLabel}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Minimum OS
                </span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{activeBuild.minOsVersion}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Integrity Status
                </span>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Cryptographically Signed</p>
              </div>
            </div>

            {/* SHA-256 Checksum Container */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-neutral-500 font-medium block">Verified SHA-256 Checksum:</span>
                <code className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px] break-all select-all">
                  {activeBuild.sha256Checksum}
                </code>
              </div>
              <button
                onClick={() => copyChecksum(activeBuild.sha256Checksum)}
                className="shrink-0 px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Hash</span>
              </button>
            </div>

            {/* Action Zone: Entitlement Aware */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-violet-50/60 via-neutral-50/50 to-neutral-50 dark:from-violet-950/20 dark:via-neutral-900/60 dark:to-neutral-900 border border-violet-200 dark:border-violet-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                {isOwned ? (
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Active License Entitlement Verified
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      License key:{' '}
                      <code className="text-violet-700 dark:text-violet-300 font-mono bg-white dark:bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                        {entitlementCheck.licenseKey}
                      </code>
                    </p>
                  </div>
                ) : isFree ? (
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Free Community Software
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Open access distribution. No license key or checkout required.
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-violet-400">
                      Perpetual License Required
                    </span>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Includes installer access, lifetime offline activation, and minor upgrades.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isOwned || isFree ? (
                  <button
                    onClick={handleDownloadAuthorize}
                    disabled={isAuthorizingDownload}
                    className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAuthorizingDownload ? 'Generating Signed Token...' : 'Authorized Download'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        addItem({
                          appId: app.id,
                          planId: selectedPlan.id,
                          appName: app.name,
                          planName: selectedPlan.name,
                          priceUsd: selectedPlan.priceUsd,
                          developer: app.developer,
                          iconSvgName: app.iconSvgName,
                          accentColor: app.accentColor,
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Purchase License ({formatCurrency(selectedPlan.priceUsd)})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Clear Verified Unavailable State */
          <div className="p-8 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white capitalize">
              Not Supported on {selectedPlatform}
            </h3>
            <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
              {platformSupportInfo?.statusText ||
                `${app.name} does not currently have an authorized release build for ${selectedPlatform}. SAHRIVA Store does not provide unofficial or untested wrappers.`}
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-neutral-500">
                To run {app.name}, switch to one of the verified platforms:{' '}
                <span className="text-neutral-300 font-medium">
                  {app.supportedPlatforms.join(', ')}
                </span>
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Feature Highlights & System Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Features Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Key Capabilities & Architecture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-md bg-violet-950 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{feat}</p>
              </div>
            ))}
          </div>

          {/* Screenshot Showcase */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="space-y-3 pt-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Interface Showcase</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {app.screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950 flex flex-col"
                  >
                    <div
                      className="h-36 w-full flex items-center justify-center p-4 relative"
                      style={{ background: s.style }}
                    >
                      <div className="p-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-center">
                        <span className="text-xs font-semibold text-white block">{s.title}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-neutral-900/80">
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{s.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Requirements Matrix Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">System Requirements</h3>
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs">
            {platformSupportInfo?.minRequirements ? (
              <>
                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium">Operating System</span>
                  <p className="text-neutral-200 font-semibold">{platformSupportInfo.minRequirements.os}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium">Memory (RAM)</span>
                  <p className="text-neutral-200 font-semibold">{platformSupportInfo.minRequirements.ram}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium">Storage Requirement</span>
                  <p className="text-neutral-200 font-semibold">{platformSupportInfo.minRequirements.storage}</p>
                </div>
                {platformSupportInfo.minRequirements.gpu && (
                  <div className="space-y-1">
                    <span className="text-neutral-500 font-medium">Graphics & Shader API</span>
                    <p className="text-neutral-200 font-semibold">{platformSupportInfo.minRequirements.gpu}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-neutral-400">Select a supported platform to view requirements.</p>
            )}
          </div>

          {/* Publisher Support Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 text-xs">
            <h4 className="font-bold text-white">Publisher & Support</h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex justify-between">
                <span>Publisher:</span>
                <span className="text-neutral-200 font-medium">{app.developer}</span>
              </div>
              <div className="flex justify-between">
                <span>Distribution Type:</span>
                <span className="text-neutral-200 font-medium">Direct Authorized</span>
              </div>
              <div className="flex justify-between">
                <span>Website:</span>
                <a
                  href={app.developerWebsite || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-400 hover:underline flex items-center gap-1"
                >
                  <span>Official Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Release Changelog */}
      {app.changelog && app.changelog.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Verified Release Notes</h3>
          <div className="space-y-3">
            {app.changelog.map((c, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="font-bold text-white font-mono">Version {c.version}</span>
                  <span className="text-neutral-400">{c.date}</span>
                </div>
                <ul className="space-y-1.5 pt-1 text-neutral-300">
                  {c.changes.map((item, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Feedback */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Verified Customer Reviews</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Genuine reviews from verified purchasers and developers
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal();
              } else {
                setIsReviewOpen(true);
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg transition-colors cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        {reviewsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev: any) => (
              <div key={rev.id} className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{rev.userName}</span>
                    {rev.verifiedBuyer && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-800 text-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                <h4 className="font-semibold text-neutral-200 text-sm">{rev.title}</h4>
                <p className="text-neutral-400 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center text-xs text-neutral-400">
            No reviews yet for this application. Be the first to review!
          </div>
        )}

        {/* Review Modal */}
        {isReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 text-xs text-neutral-200 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-white">Review {app.name}</h3>
                <button onClick={() => setIsReviewOpen(false)} className="text-neutral-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-neutral-800 text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Review Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Excellent GPU performance on macOS M3"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your workflow and experience with this application..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* Frequently Asked Questions */}
      {app.faqs && app.faqs.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {app.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1.5 text-xs">
                <h4 className="font-semibold text-white text-sm">{faq.question}</h4>
                <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
