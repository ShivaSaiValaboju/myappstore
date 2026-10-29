import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, OrderRecord, OrderCalculation } from '../types/store';
import { calculateOrderTotals } from '../utils/rules';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  couponCode: string;
  appliedCoupon: string | null;
  calculation: OrderCalculation;
  wishlistIds: string[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (planId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  checkout: (paymentMethod?: string) => Promise<OrderRecord | null>;
  isCheckingOut: boolean;
  toggleWishlist: (appId: string) => Promise<void>;
  isInWishlist: (appId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const { user, token, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('nexora_cart', JSON.stringify(items));
  }, [items]);

  // Load wishlist when user changes
  useEffect(() => {
    if (!token) {
      setWishlistIds([]);
      return;
    }
    fetch('/api/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistIds(data.map((a) => a.id));
        }
      })
      .catch((err) => console.error('Wishlist load error:', err));
  }, [token]);

  const calculation = calculateOrderTotals(
    items.map((i) => ({ priceUsd: i.priceUsd })),
    appliedCoupon || undefined
  );

  const addItem = useCallback(
    (item: CartItem) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.planId === item.planId);
        if (exists) {
          showToast({
            type: 'info',
            title: 'Already in Cart',
            message: `${item.appName} (${item.planName}) is already in your cart`,
          });
          return prev;
        }
        showToast({
          type: 'success',
          title: 'Added to Cart',
          message: `${item.appName} · ${item.planName}`,
        });
        return [...prev, item];
      });
      setIsOpen(true);
    },
    [showToast]
  );

  const removeItem = useCallback(
    (planId: string) => {
      setItems((prev) => prev.filter((i) => i.planId !== planId));
      showToast({ type: 'info', title: 'Item Removed', message: 'Item removed from cart' });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const calc = calculateOrderTotals(
        items.map((i) => ({ priceUsd: i.priceUsd })),
        code
      );
      if (!calc.valid) {
        showToast({
          type: 'error',
          title: 'Coupon Error',
          message: calc.error || 'Invalid coupon code',
        });
        return;
      }
      setAppliedCoupon(code.toUpperCase());
      showToast({
        type: 'success',
        title: 'Coupon Applied',
        message: `${calc.appliedCoupon?.description} applied successfully`,
      });
    },
    [items, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast({ type: 'info', title: 'Coupon Removed', message: 'Coupon removed' });
  }, [showToast]);

  const checkout = useCallback(
    async (paymentMethod = 'demo_credit_card'): Promise<OrderRecord | null> => {
      if (!user || !token) {
        openAuthModal();
        showToast({
          type: 'info',
          title: 'Authentication Required',
          message: 'Please sign in or use demo account to complete checkout',
        });
        return null;
      }

      if (items.length === 0) {
        showToast({ type: 'error', title: 'Empty Cart', message: 'No items in cart' });
        return null;
      }

      setIsCheckingOut(true);
      try {
        const res = await fetch('/api/checkout/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items,
            couponCode: appliedCoupon,
            paymentMethod,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          showToast({
            type: 'error',
            title: 'Checkout Failed',
            message: data.error || 'Unable to process checkout',
          });
          return null;
        }

        const data = await res.json();
        clearCart();
        setIsOpen(false);
        showToast({
          type: 'success',
          title: 'Order Confirmed',
          message: `Order #${data.order.orderNumber} fulfilled! Licenses generated.`,
        });
        return data.order;
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Connection Error',
          message: 'Could not communicate with checkout server',
        });
        return null;
      } finally {
        setIsCheckingOut(false);
      }
    },
    [user, token, items, appliedCoupon, clearCart, openAuthModal, showToast]
  );

  const toggleWishlist = useCallback(
    async (appId: string) => {
      if (!user || !token) {
        openAuthModal();
        showToast({
          type: 'info',
          title: 'Sign In Required',
          message: 'Sign in to sync your wishlist across devices',
        });
        return;
      }

      try {
        const res = await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appId }),
        });
        if (res.ok) {
          const data = await res.json();
          setWishlistIds(data.wishlist);
          const isNowIn = data.wishlist.includes(appId);
          showToast({
            type: 'info',
            title: isNowIn ? 'Saved to Wishlist' : 'Removed from Wishlist',
            message: isNowIn ? 'Added to your saved applications' : 'Removed from saved items',
          });
        }
      } catch (err) {
        console.error('Failed to toggle wishlist:', err);
      }
    },
    [user, token, openAuthModal, showToast]
  );

  const isInWishlist = useCallback((appId: string) => wishlistIds.includes(appId), [wishlistIds]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        isOpen,
        couponCode,
        appliedCoupon,
        calculation,
        wishlistIds,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        checkout,
        isCheckingOut,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
