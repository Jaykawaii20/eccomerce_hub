'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Package, CheckCircle, Truck, XCircle, RefreshCw, AlertCircle, MapPin,
  CreditCard, Copy, Check, ChevronRight, Clock, Box, ShoppingBag,
} from 'lucide-react';
import { ShopNavbar } from '../../../components/shop-navbar';
import { useCustomerAuth } from '../../../context/customer-auth-context';

const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
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

// Ordered status progression
const STATUS_FLOW = ['PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED'];

const STATUS_META: Record<string, { label: string; description: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING: {
    label: 'Order Placed',
    description: 'We received your order and are preparing it.',
    icon: Package,
    color: 'text-yellow-600',
    bg: 'bg-yellow-500',
  },
  PROCESSING: {
    label: 'Processing',
    description: 'Your order is being packed and prepared for pickup.',
    icon: Box,
    color: 'text-blue-600',
    bg: 'bg-blue-500',
  },
  ON_HOLD: {
    label: 'On Hold',
    description: 'Your order is awaiting confirmation or payment.',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Delivered',
    description: 'Your order has been delivered successfully.',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'This order has been cancelled.',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-500',
  },
  REFUNDED: {
    label: 'Refunded',
    description: 'A refund has been issued for this order.',
    icon: RefreshCw,
    color: 'text-purple-600',
    bg: 'bg-purple-500',
  },
  FAILED: {
    label: 'Failed',
    description: 'This order could not be processed.',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-500',
  },
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

/** Add N business days (Mon–Fri) to a date, skipping weekends. */
function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay(); // 0 = Sun, 6 = Sat
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

/** Format a date as "Apr 10" or "Apr 10, 2027" when it's a different year. */
function fmtDeliveryDate(d: Date): string {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() !== now.getFullYear()
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-PH', opts);
}

/**
 * Dynamic delivery window based on order creation date:
 *   from  = +3 business days after order placed
 *   to    = +7 business days after order placed
 *   guarantee = +9 business days (2 extra after window closes)
 */
function getEstimatedDelivery(createdAt: string): { from: string; to: string; guarantee: string } {
  const base = new Date(createdAt);
  return {
    from: fmtDeliveryDate(addBusinessDays(base, 3)),
    to: fmtDeliveryDate(addBusinessDays(base, 7)),
    guarantee: fmtDeliveryDate(addBusinessDays(base, 9)),
  };
}

function StatusBanner({ order }: { order: OrderDetail }) {
  const meta = STATUS_META[order.status] ?? STATUS_META['PENDING']!;
  const Icon = meta.icon;
  const isCOD = (order.metadata?.['actualPaymentMethod'] ?? order.paymentMethod) === 'CASH_ON_DELIVERY';
  const est = getEstimatedDelivery(order.createdAt);
  const isTerminal = ['CANCELLED', 'REFUNDED', 'FAILED'].includes(order.status);
  const isDelivered = order.status === 'COMPLETED';

  return (
    <div className={`rounded-2xl overflow-hidden ${isTerminal ? 'bg-red-50 border border-red-100' : isDelivered ? 'bg-green-50 border border-green-100' : 'bg-gray-900'}`}>
      {/* Top status bar */}
      <div className={`px-5 py-4 ${isTerminal ? '' : isDelivered ? '' : 'text-white'}`}>
        {isDelivered ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-base">Order Delivered!</p>
              <p className="text-xs text-green-600">Your package has been delivered successfully.</p>
            </div>
          </div>
        ) : isTerminal ? (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${meta.bg} bg-opacity-10 flex items-center justify-center shrink-0`}>
              <Icon className={`h-6 w-6 ${meta.color}`} />
            </div>
            <div>
              <p className={`font-bold text-base ${meta.color}`}>{meta.label}</p>
              <p className="text-xs text-gray-500">{meta.description}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Estimated Delivery</p>
            <p className="text-xl font-bold text-white">{est.from} – {est.to}</p>
            {isCOD && (
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-green-500 text-white text-[11px] font-bold rounded-md">COD</span>
                <span className="text-sm text-gray-300">
                  Please prepare <span className="text-white font-bold">{formatPrice(order.total)}</span> in cash
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Guaranteed delivery attempt by <span className="text-gray-300 font-semibold">{est.guarantee}</span>. Get a coupon if your order arrives late.
            </p>
          </>
        )}
      </div>

      {/* Carrier row */}
      {!isTerminal && !isDelivered && (
        <div className="bg-white px-5 py-3 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Standard Shipping</p>
              <p className="text-[11px] text-gray-400">{order.orderNumber}</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-orange-500 hover:underline">Contact</button>
        </div>
      )}
    </div>
  );
}

function TrackingTimeline({ order }: { order: OrderDetail }) {
  // Build a unified event list from statusHistory + notes, sorted newest-first
  const events: { time: string; label: string; description: string; isHighlight: boolean; isCurrent: boolean }[] = [];

  const isTerminal = ['CANCELLED', 'REFUNDED', 'FAILED'].includes(order.status);
  const currentStepIdx = isTerminal ? -1 : STATUS_FLOW.indexOf(order.status);

  // Add status history events
  const sortedHistory = [...order.statusHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sortedHistory.forEach((h, idx) => {
    const meta = STATUS_META[h.status];
    const isMostRecent = idx === 0;
    events.push({
      time: h.createdAt,
      label: meta?.label ?? h.status,
      description: h.comment ?? (meta?.description ?? ''),
      isHighlight: isMostRecent,
      isCurrent: isMostRecent,
    });
  });

  // If no history entries at all, synthesize one from the order itself
  if (events.length === 0) {
    const meta = STATUS_META[order.status] ?? STATUS_META['PENDING']!;
    events.push({
      time: order.createdAt,
      label: meta.label,
      description: meta.description,
      isHighlight: true,
      isCurrent: true,
    });
  }

  // Add pending future steps (greyed out)
  const futureSteps: typeof events = [];
  if (!isTerminal && currentStepIdx >= 0) {
    for (let i = currentStepIdx + 1; i < STATUS_FLOW.length; i++) {
      const s = STATUS_FLOW[i]!;
      const meta = STATUS_META[s]!;
      futureSteps.push({
        time: '',
        label: meta.label,
        description: meta.description,
        isHighlight: false,
        isCurrent: false,
      });
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="h-4 w-4 text-orange-500" />
        Package Tracking
      </h2>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gray-100" />

        <div className="space-y-0">
          {/* Real events (newest first) */}
          {events.map((ev, i) => (
            <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
              {/* Dot */}
              <div className={`relative z-10 mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                ev.isCurrent
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-green-500 border-green-500 text-white'
              }`}>
                {ev.isCurrent
                  ? <Truck className="h-4 w-4" />
                  : <Check className="h-4 w-4" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${ev.isCurrent ? 'text-orange-600' : 'text-gray-700'}`}>
                    {ev.label}
                    {ev.isCurrent && <span className="ml-2 text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Now</span>}
                  </p>
                  {ev.time && (
                    <p className="text-[11px] text-gray-400 shrink-0 ml-2">{formatDateTime(ev.time)}</p>
                  )}
                </div>
                {ev.isHighlight ? (
                  <div className="mt-1.5 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-teal-700 font-medium">{ev.description}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                )}
              </div>
            </div>
          ))}

          {/* Future steps (greyed out) */}
          {futureSteps.map((step, i) => (
            <div key={`future-${i}`} className="flex gap-4 relative pb-5 last:pb-0 opacity-35">
              <div className="relative z-10 mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 bg-white border-gray-200 text-gray-300">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-semibold text-gray-500">{step.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { authFetch } = useCustomerAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    authFetch(`${BACKEND}/api/v1/storefront/orders/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((json: { success: boolean; data: OrderDetail } | null) => {
        if (json?.success) setOrder(json.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id, authFetch]);

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
        <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
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
          <p className="text-sm text-gray-500 mt-2">Check that you have the correct order number.</p>
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

      <div className="max-w-lg mx-auto px-4 sm:px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <a href="/store/account/orders" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            ←
          </a>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Track Package</h1>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.paymentStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-4">
          {/* Main status banner (TikTok-style) */}
          <StatusBanner order={order} />

          {/* Order number row */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Order Number</p>
              <p className="text-sm font-bold text-gray-900 font-mono">{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              <button
                onClick={copyOrderNumber}
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy order number"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Detailed tracking timeline */}
          <TrackingTimeline order={order} />

          {/* Items ordered */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
              </h2>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    {item.product?.featuredImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.featuredImageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.product?.slug ? (
                      <a href={`/store/products/${item.product.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">
                        {item.name}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    )}
                    {item.sku && <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>}
                    <p className="text-xs text-gray-500">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span><span>{formatPrice(order.shippingAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span><span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Ship To
              </h2>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {order.shippingAddress['firstName']} {order.shippingAddress['lastName']}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{order.shippingAddress['address1']}</p>
              {order.shippingAddress['address2'] && (
                <p className="text-xs text-gray-500">{order.shippingAddress['address2']}</p>
              )}
              <p className="text-xs text-gray-500">
                {order.shippingAddress['city']}, {order.shippingAddress['state']} {order.shippingAddress['postalCode']}
              </p>
              {order.shippingAddress['phone'] && (
                <p className="text-xs text-gray-400 mt-1">{order.shippingAddress['phone']}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Payment
              </h2>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {PAYMENT_METHOD_LABELS[actualPaymentMethod] ?? actualPaymentMethod}
              </p>
              <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {order.paymentStatus.replace('_', ' ')}
              </span>
              {order.customerNote && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">Your note:</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-3">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages from store */}
          {order.notes.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">
                Messages from Store
              </h2>
              <div className="space-y-3">
                {order.notes.map((note) => (
                  <div key={note.id}>
                    <p className="text-sm text-gray-800">{note.note}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guest tracking hint */}
          <div className="text-center pb-4">
            <p className="text-xs text-gray-400">
              Share order number <strong className="text-gray-600">{order.orderNumber}</strong> to track without signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
