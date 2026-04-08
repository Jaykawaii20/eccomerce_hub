'use client';

import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '../context/cart-context';
import { useCustomerAuth } from '../context/customer-auth-context';
import { useAuthModal } from '../context/auth-modal-context';
import { ShopNavbar } from '../components/shop-navbar';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

export default function CartPage() {
  const { items, subtotal, count, removeItem, updateQuantity, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();

  if (count === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-orange-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Start shopping to add items to your cart.</p>
          <a
            href="/store/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? ''}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
              >
                {/* Image */}
                <a href={`/store/products/${item.slug}`} className="shrink-0">
                  <div className="h-20 w-20 rounded-xl bg-gray-100 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                </a>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/store/products/${item.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-orange-500">{formatPrice(item.price)}</span>
                    {item.price < item.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      = {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({count} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {customer ? (
                <a
                  href="/store/checkout"
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                    <p className="text-sm text-orange-700 font-medium">Login required to checkout</p>
                    <p className="text-xs text-orange-500 mt-0.5">Your cart is saved — login to continue</p>
                  </div>
                  <button
                    onClick={() => openAuthModal({ tab: 'login', redirect: '/store/checkout' })}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                  >
                    <LogIn className="h-4 w-4" /> Login to Checkout
                  </button>
                  <button
                    onClick={() => openAuthModal({ tab: 'register', redirect: '/store/checkout' })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold transition-colors text-sm"
                  >
                    Create an Account
                  </button>
                </div>
              )}

              <a
                href="/store/products"
                className="mt-3 w-full flex items-center justify-center py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
