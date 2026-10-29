import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/common/AppIcons';
import { formatCurrency } from '../utils/rules';
import {
  X,
  Trash2,
  Tag,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { OrderRecord } from '../types/store';

interface CartDrawerProps {
  onNavigateToOrders: (orderId: string) => void;
  onNavigateToLibrary: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToOrders,
  onNavigateToLibrary,
}) => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculation,
    checkout,
    isCheckingOut,
  } = useCart();
  const { user, openAuthModal } = useAuth();

  const [inputCoupon, setInputCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'demo_credit_card' | 'demo_apple_pay'>('demo_credit_card');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  const handleCompleteCheckout = async () => {
    const order = await checkout(paymentMethod);
    if (order) {
      setCompletedOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0C0F17] border-l border-neutral-800 text-neutral-200 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Software Cart</h2>
              <span className="text-xs text-neutral-400">({items.length} items)</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/80 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen after Order */}
          {completedOrder ? (
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="text-center space-y-4 pt-6">
                <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment & Entitlement Fulfilled</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Order <span className="font-mono text-white">#{completedOrder.orderNumber}</span> has been confirmed. Licenses and download rights have been assigned to your library.
                </p>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left space-y-2 text-xs">
                  <span className="text-neutral-500 font-medium block">Purchased Software & Keys:</span>
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="border-b border-neutral-800/60 last:border-0 pb-2">
                      <div className="flex justify-between font-semibold text-white">
                        <span>{it.appName}</span>
                        <span className="font-mono">{formatCurrency(it.unitPriceUsd)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-violet-400 font-mono mt-1">
                        <span>Key: {it.licenseKey}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToLibrary();
                  }}
                  className="w-full py-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to My Apps Library</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToOrders(completedOrder.id);
                  }}
                  className="w-full py-2.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
                >
                  View Printable Receipt
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <p className="text-sm text-neutral-400">Your cart is empty.</p>
                    <p className="text-xs text-neutral-500">
                      Explore applications in the catalog to select personal or studio licenses.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.planId}
                      className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <AppIcon
                          name={item.iconSvgName}
                          accentColor={item.accentColor}
                          className="w-10 h-10 shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-white">{item.appName}</h4>
                          <p className="text-xs text-neutral-400">{item.planName}</p>
                          <span className="text-xs font-mono font-bold text-violet-400 mt-1 block">
                            {formatCurrency(item.priceUsd)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.planId)}
                        className="text-neutral-500 hover:text-rose-400 p-1.5 transition-colors"
                        aria-label={`Remove ${item.appName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Calculation & Actions (if items exist) */}
              {items.length > 0 && (
                <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 space-y-4 text-xs">
                  {/* Coupon Code Input */}
                  <div className="space-y-1.5">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-violet-950/40 border border-violet-800/40 text-violet-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Coupon Applied: {appliedCoupon}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-bold hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Coupon code (e.g. LAUNCH25)"
                          className="flex-1 px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-violet-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">{formatCurrency(calculation.subtotal)}</span>
                    </div>

                    {calculation.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({calculation.appliedCoupon?.code})</span>
                        <span className="font-mono">-{formatCurrency(calculation.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Estimated Tax (8%)</span>
                      <span className="text-white font-mono">{formatCurrency(calculation.tax)}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold text-white">
                      <span>Total Due</span>
                      <span className="font-mono text-base text-violet-400">
                        {formatCurrency(calculation.total)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-neutral-500 block">Test Payment Provider:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('demo_credit_card')}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                          paymentMethod === 'demo_credit_card'
                            ? 'bg-neutral-800 border-violet-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-medium">Demo Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('demo_apple_pay')}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                          paymentMethod === 'demo_apple_pay'
                            ? 'bg-neutral-800 border-violet-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-medium">Apple Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* Security Disclaimer */}
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Test mode: Instant sandbox entitlement & license generation.</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCompleteCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isCheckingOut ? 'Authorizing Payment...' : `Complete Order · ${formatCurrency(calculation.total)}`}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
