'use client';

import { useEffect, useState } from 'react';
import { Package, ChevronRight, ShoppingBag, LogIn } from 'lucide-react';
import { useCustomerAuth } from '../../context/customer-auth-context';
import { ShopNavbar } from '../../components/shop-navbar';

const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-purple-100 text-purple-700',
  FAILED: 'bg-red-100 text-red-600',
};

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    product: { featuredImageUrl?: string | null; slug: string } | null;
  }[];
}

export default function MyOrdersPage() {
  const { customer, token, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!customer || !token) {
      setLoading(false);
      return;
    }

    fetch(`${BACKEND}/api/v1/storefront/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json: { success: boolean; data: OrderSummary[] }) => {
        if (json.success) setOrders(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customer, token, authLoading]);

  if (authLoading) return null;

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <LogIn className="h-16 w-16 text-orange-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Sign in to view your orders</h2>
          <p className="text-gray-500 text-sm mt-2">You need to be signed in to view order history.</p>
          <a
            href="/store/auth/login?redirect=/store/account/orders"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Signed in as <strong>{customer.email}</strong>
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">When you place an order, it will appear here.</p>
            <a
              href="/store/products"
              className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const firstImage = order.items[0]?.product?.featuredImageUrl;
              const extraCount = Math.max(0, order.items.length - 3);

              return (
                <a
                  key={order.id}
                  href={`/store/account/orders/${order.orderNumber}`}
                  className="block bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all p-5"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnails */}
                    <div className="flex -space-x-2 shrink-0">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="h-10 w-10 rounded-lg border-2 border-white bg-gray-100 overflow-hidden"
                        >
                          {item.product?.featuredImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.featuredImageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-300 m-auto" />
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="h-10 w-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          +{extraCount}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Total + arrow */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-auto mt-1" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
