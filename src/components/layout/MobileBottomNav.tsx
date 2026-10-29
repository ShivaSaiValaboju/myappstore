import React from 'react';
import { Sparkles, LayoutGrid, Zap, FolderDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { itemCount, openCart } = useCart();

  const navItems = [
    {
      id: 'discover',
      label: 'Discover',
      icon: Sparkles,
      route: '/',
      isActive: currentRoute === '/',
    },
    {
      id: 'catalog',
      label: 'Store',
      icon: LayoutGrid,
      route: '/apps',
      isActive: currentRoute === '/apps' || currentRoute.startsWith('/categories'),
    },
    {
      id: 'updates',
      label: 'Updates',
      icon: Zap,
      route: '/updates',
      isActive: currentRoute === '/updates',
    },
    {
      id: 'library',
      label: 'My Apps',
      icon: FolderDown,
      route: '/library',
      isActive: currentRoute === '/library',
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-auto"
      aria-label="Mobile Navigation Dock"
    >
      <div className="relative mx-auto max-w-md rounded-2xl bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5 flex items-center justify-between">
        {/* Glow ambient highlight */}
        <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none" />

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                item.isActive
                  ? 'text-violet-600 dark:text-violet-300 font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {item.isActive && (
                <span className="absolute inset-0 rounded-xl bg-violet-100/70 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/40 -z-10" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${item.isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Cart Quick Action Tab */}
        <button
          onClick={openCart}
          className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-200 cursor-pointer active:scale-95"
          aria-label={`Open shopping cart with ${itemCount} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-violet-600 text-white font-bold text-[9px] flex items-center justify-center shadow-sm shadow-violet-600/40 animate-pulse">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            Cart
          </span>
        </button>
      </div>
    </nav>
  );
};
