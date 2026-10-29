import React, { useState, useEffect } from 'react';
import type { OrderRecord } from '../types/store';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/rules';
import { ShoppingBag, Printer, ArrowLeft, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

interface OrdersViewProps {
  initialOrderId?: string;
  onNavigateToApp: (slug: string) => void;
  onNavigateToLibrary: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  initialOrderId,
  onNavigateToApp,
  onNavigateToLibrary,
}) => {
  const { user, token, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
          if (initialOrderId) {
            const found = data.find((o) => o.id === initialOrderId || o.orderNumber === initialOrderId);
            if (found) setSelectedReceipt(found);
          }
        }
      })
      .catch((err) => console.error('Orders load error:', err))
      .finally(() => setLoading(false));
  }, [token, initialOrderId]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-xs text-neutral-400">Order receipts and invoices are tied to your account.</p>
        <button
          onClick={openAuthModal}
          className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Orders & Invoices</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review previous software transactions, download invoices, and inspect license allocations
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">Loading order records...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-semibold">
                      PAID & FULFILLED
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 block mt-0.5">
                    Date: {new Date(order.createdAt).toLocaleDateString()} · Billed to {order.userEmail}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-neutral-500 block">Total</span>
                    <span className="text-base font-bold text-violet-400 font-mono">
                      {formatCurrency(order.totalUsd)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(order)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 text-neutral-300">
                    <div>
                      <span className="font-semibold text-white">{item.appName}</span>
                      <span className="text-neutral-500 ml-2">({item.planName})</span>
                      <span className="font-mono text-[11px] text-violet-400 ml-3">
                        Key: {item.licenseKey}
                      </span>
                    </div>
                    <span className="font-mono">{formatCurrency(item.unitPriceUsd)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No previous orders</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            When you purchase software licenses from SAHRIVA Store, detailed invoices will be archived here.
          </p>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white text-neutral-900 p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b pb-6 border-neutral-200">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
                  SAHRIVA<span className="text-violet-600 font-semibold ml-1">Store</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Official Digital Software Invoice</p>
              </div>

              <div className="text-right text-xs text-neutral-500">
                <span className="font-mono font-bold text-sm text-neutral-900 block">
                  #{selectedReceipt.orderNumber}
                </span>
                <span>Date: {new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-400 font-medium block">Customer</span>
                <p className="font-semibold text-neutral-800">{user.name}</p>
                <p className="text-neutral-600">{selectedReceipt.userEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 font-medium block">Distributor</span>
                <p className="font-semibold text-neutral-800">SAHRIVA Store Inc.</p>
                <p className="text-neutral-600">Tax ID: US-SAH-882910</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-semibold">
                  <th className="py-2">Item & Description</th>
                  <th className="py-2">License Allocation</th>
                  <th className="py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {selectedReceipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-neutral-900">
                      <div>{item.appName}</div>
                      <div className="text-[11px] text-neutral-500">{item.planName}</div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-violet-700">
                      {item.licenseKey}
                    </td>
                    <td className="py-3 text-right font-mono font-medium">
                      {formatCurrency(item.unitPriceUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-neutral-200 pt-4 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(selectedReceipt.subtotalUsd)}</span>
              </div>
              {selectedReceipt.discountUsd > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({selectedReceipt.couponCode})</span>
                  <span className="font-mono">-{formatCurrency(selectedReceipt.discountUsd)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-mono">{formatCurrency(selectedReceipt.taxUsd)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-base font-bold text-neutral-900">
                <span>Total Paid</span>
                <span className="font-mono text-violet-700">{formatCurrency(selectedReceipt.totalUsd)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
