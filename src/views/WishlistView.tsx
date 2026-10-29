import React from 'react';
import type { ApplicationRecord } from '../types/store';
import { AppCard } from '../components/common/AppCard';
import { useCart } from '../context/CartContext';
import { Bookmark, ArrowRight } from 'lucide-react';

interface WishlistViewProps {
  applications: ApplicationRecord[];
  onSelectApp: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  applications,
  onSelectApp,
  onNavigate,
}) => {
  const { wishlistIds } = useCart();
  const savedApps = applications.filter((app) => wishlistIds.includes(app.id));

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Applications</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Applications and developer suites bookmarked for your workflows
        </p>
      </div>

      {savedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedApps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={onSelectApp} />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Tap the bookmark icon on any application in the catalog to save it for quick access.
          </p>
          <button
            onClick={() => onNavigate('/apps')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
          >
            Browse Applications
          </button>
        </div>
      )}
    </div>
  );
};
