import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { SearchModal } from './components/common/SearchModal';
import { CustomCursor } from './components/common/CustomCursor';
import { CartDrawer } from './views/CartDrawer';
import { AuthModal } from './views/AuthModal';

import { DiscoverView } from './views/DiscoverView';
import { CatalogView } from './views/CatalogView';
import { AppDetailView } from './views/AppDetailView';
import { LibraryView } from './views/LibraryView';
import { OrdersView } from './views/OrdersView';
import { WishlistView } from './views/WishlistView';
import { CategoriesView } from './views/CategoriesView';
import { UpdatesView } from './views/UpdatesView';
import { AdminView } from './views/AdminView';
import { LegalView } from './views/LegalViews';
import {
  DiscoverViewSkeleton,
  CatalogViewSkeleton,
  AppDetailViewSkeleton,
} from './components/common/Skeletons';

import type { ApplicationRecord, StoreCategory } from './types/store';

function MainApp() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [selectedAppSlug, setSelectedAppSlug] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Fetch initial catalog data
  const fetchData = useCallback(async () => {
    setLoadError(false);
    try {
      const [appsRes, catsRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/categories'),
      ]);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      } else {
        setLoadError(true);
      }
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
      if (path.startsWith('/apps/')) {
        setSelectedAppSlug(path.replace('/apps/', ''));
      } else {
        setSelectedAppSlug(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (route.startsWith('/apps/')) {
      setSelectedAppSlug(route.replace('/apps/', ''));
    } else {
      setSelectedAppSlug(null);
    }
    if (route.startsWith('/categories/')) {
      setSelectedCategorySlug(route.replace('/categories/', ''));
    } else {
      setSelectedCategorySlug(null);
    }
  };

  const handleSelectApp = (slug: string) => {
    navigate(`/apps/${slug}`);
  };

  const selectedApp = applications.find(
    (a) => a.slug === selectedAppSlug || a.id === selectedAppSlug
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-violet-600 selection:text-white transition-colors duration-200">
      {/* Animated Custom Cursor for interactive viewports */}
      <CustomCursor />

      {/* Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area with safe-area spacing for mobile bottom dock */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:pb-12">
        {loading ? (
          selectedAppSlug ? (
            <AppDetailViewSkeleton />
          ) : currentRoute === '/apps' ? (
            <CatalogViewSkeleton />
          ) : (
            <DiscoverViewSkeleton />
          )
        ) : loadError && applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
            <h2 className="text-xl font-semibold">We couldn't load the store</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              The catalog is temporarily unavailable. Check your connection and try again.
            </p>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        ) : selectedAppSlug && selectedApp ? (
          <AppDetailView
            app={selectedApp}
            onBack={() => navigate('/apps')}
            onNavigate={navigate}
          />
        ) : currentRoute === '/' ? (
          <DiscoverView
            applications={applications}
            onSelectApp={handleSelectApp}
            onNavigate={navigate}
            loading={loading}
          />
        ) : currentRoute === '/apps' ? (
          <CatalogView
            applications={applications}
            categories={categories}
            initialCategory={selectedCategorySlug || undefined}
            onSelectApp={handleSelectApp}
            loading={loading}
          />
        ) : currentRoute === '/categories' ? (
          <CategoriesView
            categories={categories}
            applications={applications}
            onSelectCategory={(slug) => navigate(`/categories/${slug}`)}
            onSelectApp={handleSelectApp}
          />
        ) : currentRoute.startsWith('/categories/') ? (
          <CatalogView
            applications={applications}
            categories={categories}
            initialCategory={selectedCategorySlug || undefined}
            onSelectApp={handleSelectApp}
          />
        ) : currentRoute === '/updates' ? (
          <UpdatesView applications={applications} onSelectApp={handleSelectApp} />
        ) : currentRoute === '/library' ? (
          <LibraryView onSelectApp={handleSelectApp} onNavigate={navigate} />
        ) : currentRoute.startsWith('/orders') ? (
          <OrdersView
            initialOrderId={currentRoute.replace('/orders/', '').replace('/orders', '')}
            onNavigateToApp={handleSelectApp}
            onNavigateToLibrary={() => navigate('/library')}
          />
        ) : currentRoute === '/wishlist' ? (
          <WishlistView
            applications={applications}
            onSelectApp={handleSelectApp}
            onNavigate={navigate}
          />
        ) : currentRoute === '/admin' ? (
          <AdminView applications={applications} onRefreshApps={fetchData} />
        ) : currentRoute === '/privacy' ? (
          <LegalView page="privacy" />
        ) : currentRoute === '/terms' ? (
          <LegalView page="terms" />
        ) : currentRoute === '/refund-policy' ? (
          <LegalView page="refund-policy" />
        ) : currentRoute === '/licensing' ? (
          <LegalView page="licensing" />
        ) : currentRoute === '/support' ? (
          <LegalView page="support" />
        ) : (
          <DiscoverView
            applications={applications}
            onSelectApp={handleSelectApp}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onNavigateToOrders={(orderId) => navigate(`/orders/${orderId}`)}
        onNavigateToLibrary={() => navigate('/library')}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        applications={applications}
        onSelectApp={handleSelectApp}
      />

      {/* Auth Modal */}
      <AuthModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Floating Modern Mobile Bottom Navigation Dock */}
      <MobileBottomNav currentRoute={currentRoute} onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
