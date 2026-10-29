import React from 'react';
import { PlatformIcons } from '../common/AppIcons';
import { ShieldCheck, Lock, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-neutral-100 dark:bg-[#07090F] border-t border-neutral-200 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-xs py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Author & Creator Spotlight Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/50 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold shrink-0 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400">
                  Store Owner & Architect
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.2 rounded font-semibold">
                  Principal Creator
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5">
                <span className="sahriva-author-name text-lg">Shiva Sai Valaboju</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Principal software architect & curator behind the SAHRIVA Store cross-platform software ecosystem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="sahriva-author-badge px-4 py-2 text-xs font-semibold shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 sahriva-sparkle-icon mr-1.5 shrink-0" />
              <span className="sahriva-author-name">Shiva Sai Valaboju</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 ml-1.5 shrink-0" />
            </div>
          </div>
        </div>

        {/* Trust & Verification Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-neutral-200 dark:border-neutral-800/60">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shrink-0 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Cryptographically Verified Builds</h4>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Every installer package includes immutable SHA-256 checksums, Apple Notarization, or EV Authenticode digital signatures.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Genuine Offline Licensing</h4>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Perpetual licenses validate on your hardware without constant background telemetry or cloud lock-in.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Direct & Official Distribution</h4>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Only verified, publisher-authorized distribution channels. Direct DMG, MSI, AppImage, and APK packages.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-column directory */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
                SAHRIVA<span className="text-violet-600 dark:text-violet-400 font-semibold ml-1">Store</span>
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Discover software that does more. A refined application marketplace for macOS, Windows, Linux, and Android. Engineered and curated by <strong className="sahriva-author-name">Shiva Sai Valaboju</strong>.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[11px] text-neutral-500 font-medium">Verified Platforms:</span>
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <PlatformIcons.macos className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white transition-colors" />
                <PlatformIcons.windows className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white transition-colors" />
                <PlatformIcons.linux className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white transition-colors" />
                <PlatformIcons.android className="w-4 h-4 hover:text-neutral-900 dark:hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Store links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">Store</h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Discover
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/apps')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  All Applications
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/updates')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Release Notes
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Library */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">Library</h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/library')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  My Apps
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/orders')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Orders & Receipts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/wishlist')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-violet-600 dark:text-violet-400 hover:underline transition-colors cursor-pointer">
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">Trust & Legal</h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/refund-policy')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/licensing')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Software Licensing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/support')} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                  Support & Tickets
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 dark:text-neutral-500">
          <p>© {new Date().getFullYear()} SAHRIVA Store Inc. Directed & Architected by <strong className="sahriva-author-name">Shiva Sai Valaboju</strong>. All trademarks belong to respective publishers.</p>
          <div className="flex items-center gap-4">
            <span>Verified Authenticode</span>
            <span>·</span>
            <span>Perpetual Licenses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
