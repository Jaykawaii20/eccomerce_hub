'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Package, Clock, CheckCircle, Truck, XCircle, RefreshCw, AlertCircle, MapPin, CreditCard, Copy, Check,
} from 'lucide-react';
import { ShopNavbar } from '../../../components/shop-navbar';
import { useCustomerAuth } from '../../../context/customer-auth-context';

const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  currency: string;
  couponCode?: string | null;
  customerNote?: string | null;
  shippingAddress: Record<string, string>;
  metadata?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    name: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: { slug: string; featuredImageUrl?: string | null } | null;
  }[];
  statusHistory: {
    id: string;
    status: string;
    comment?: string | null;
    createdAt: string;
  }[];
  notes: {
    id: string;
    note: string;
    createdAt: string;
  }[];
}

// Order status progression for tracking timeline
const STATUS_STEPS = [
  { status: 'PENDING', label: 'Order Placed', description: 'We received your order', icon: Package, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
  { status: 'PROCESSING', label: 'Processing', description: 'Your order is being prepared', icon: Clock, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { status: 'ON_HOLD', label: 'On Hold', description: 'Order is pending confirmation', icon: AlertCircle, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { status: 'COMPLETED', label: 'Delivered', description: 'Order delivered successfully', icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-200' },
];

// Non-sequential statuses
const TERMINAL_STATUSES: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  CANCELLED: { label: 'Cancelled', color: 'text-red-500 bg-red-50 border-red-200', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-purple-500 bg-purple-50 border-purple-200', icon: RefreshCw },
  FAILED: { label: 'Failed', color: 'text-red-500 bg-red-50 border-red-200', icon: AlertCircle },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  STRIPE: 'Credit / Debit Card',
  BANK_TRANSFER: 'Bank Transfer',
  GCASH: 'GCash',
  PAYMAYA: 'Maya (PayMaya)',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-purple-100 text-purple-700',
  PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-700',
};

function OrderTrackingTimeline({ status, history }: {
  status: string;
  history: { id: string; status: string; comment?: string | null; createdAt: string }[];
}) {
  const isTerminal = status in TERMINAL_STATUSES;
  const currentStepIdx = isTerminal ? -1 : STATUS_STEPS.findIndex((s) => s.status === status);

  if (isTerminal) {
    const terminal = TERMINAL_STATUSES[status]!;
    const Icon = terminal.icon;
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${terminal.color}`}>
        <Icon className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold text-sm">{terminal.label}</p>
          {history[history.length - 1]?.comment && (
            <p className="text-xs mt-0.5 opacity-80">{history[history.length - 1].comment}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

      <div className="space-y-0">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isPending = idx > currentStepIdx;

          // Find the history entry for this status
          const historyEntry = history.slice().reverse().find((h) => h.status === step.status);
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-start gap-4 relative pb-6 last:pb-0">
              {/* Icon */}
              <div className={`relative z-10 h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isCurrent
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className={`pt-1.5 flex-1 ${isPending ? 'opacity-40' : ''}`}>
                <p className={`text-sm font-bold ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.label}
                  {isCurrent && <span className="ml-2 text-xs animate-pulse">● Now</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                {historyEntry && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(historyEntry.createdAt).toLocaleString('en-PH')}
                    {historyEntry.comment && ` · ${historyEntry.comment}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useCustomerAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    fetch(`${BACKEND}/api/v1/storefront/orders/${params.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((json: { success: boolean; data: OrderDetail } | null) => {
        if (json?.success) setOrder(json.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id, token]);

  function copyOrderNumber() {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const actualPaymentMethod = (order?.metadata?.['actualPaymentMethod'] as string | undefined) ?? order?.paymentMethod ?? '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
          <p className="text-sm text-gray-500 mt-2">
            Check that you have the correct order number.
          </p>
          <a href="/store/account/orders" className="mt-4 inline-block text-orange-500 font-semibold hover:underline text-sm">
            ← Back to My Orders
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <a href="/store/account/orders" className="text-sm text-orange-500 hover:underline">
              ← My Orders
            </a>
            <div className="flex items-center gap-2 mt-2">
              <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Copy order number"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>

        <div className="space-y-5">
          {/* Tracking Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-500" />
              Order Status
            </h2>
            <OrderTrackingTimeline status={order.status} history={order.statusHistory} />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Items Ordered
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    {item.product?.featuredImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.featuredImageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.product?.slug ? (
                      <a
                        href={`/store/products/${item.product.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    )}
                    {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Shipping Address
              </h2>
              <p className="text-sm font-semibold text-gray-900">
                {order.shippingAddress['firstName']} {order.shippingAddress['lastName']}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress['address1']}</p>
              {order.shippingAddress['address2'] && (
                <p className="text-sm text-gray-600">{order.shippingAddress['address2']}</p>
              )}
              <p className="text-sm text-gray-600">
                {order.shippingAddress['city']}, {order.shippingAddress['state']} {order.shippingAddress['postalCode']}
              </p>
              {order.shippingAddress['phone'] && (
                <p className="text-sm text-gray-500 mt-1">{order.shippingAddress['phone']}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Payment
              </h2>
              <p className="text-sm font-semibold text-gray-900">
                {PAYMENT_METHOD_LABELS[actualPaymentMethod] ?? actualPaymentMethod}
              </p>
              <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {order.paymentStatus.replace('_', ' ')}
              </span>
              {order.customerNote && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Your note:</p>
                  <p className="text-xs text-gray-600 mt-0.5">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer notes from admin */}
          {order.notes.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">
                Messages from Store
              </h2>
              <div className="space-y-2">
                {order.notes.map((note) => (
                  <div key={note.id}>
                    <p className="text-sm text-gray-800">{note.note}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(note.createdAt).toLocaleString('en-PH')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track by order number hint */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Share your order number <strong className="text-gray-600">{order.orderNumber}</strong> to track this order without signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
