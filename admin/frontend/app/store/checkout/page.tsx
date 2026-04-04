'use client';

import { useState } from 'react';
import { useCart } from '../context/cart-context';
import { useCustomerAuth } from '../context/customer-auth-context';
import { ShopNavbar } from '../components/shop-navbar';
import {
  CreditCard, Truck, Building2, Smartphone, ShoppingBag, Check, ChevronRight, ArrowLeft,
} from 'lucide-react';

type PaymentMethod = 'CASH_ON_DELIVERY' | 'STRIPE' | 'BANK_TRANSFER' | 'GCASH' | 'PAYMAYA';
type Step = 'address' | 'payment' | 'review';

const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Truck,
  },
  {
    value: 'GCASH',
    label: 'GCash',
    description: 'Pay via GCash e-wallet',
    icon: Smartphone,
  },
  {
    value: 'PAYMAYA',
    label: 'Maya (PayMaya)',
    description: 'Pay via Maya e-wallet',
    icon: Smartphone,
  },
  {
    value: 'STRIPE',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, etc.',
    icon: CreditCard,
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    description: 'Transfer to our bank account',
    icon: Building2,
  },
];

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const emptyAddress: Address = {
  firstName: '', lastName: '', address1: '', address2: '',
  city: '', state: '', postalCode: '', country: 'PH', phone: '',
};

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'address', label: 'Address' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];
  const idx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            i <= idx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {i < idx ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

function AddressForm({ value, onChange, title }: {
  value: Address;
  onChange: (a: Address) => void;
  title: string;
}) {
  function set(key: keyof Address) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: e.target.value });
  }

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'firstName' as const, label: 'First name', placeholder: 'Juan' },
          { key: 'lastName' as const, label: 'Last name', placeholder: 'Dela Cruz' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
              value={value[key]}
              onChange={set(key)}
              required
              placeholder={placeholder}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address line 1</label>
          <input
            value={value.address1}
            onChange={set('address1')}
            required
            placeholder="House/Unit No., Street"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address line 2 (optional)</label>
          <input
            value={value.address2}
            onChange={set('address2')}
            placeholder="Barangay, Subdivision"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'city' as const, label: 'City', placeholder: 'Manila' },
            { key: 'state' as const, label: 'Province / Region', placeholder: 'Metro Manila' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                value={value[key]}
                onChange={set(key)}
                required
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ZIP / Postal code</label>
            <input
              value={value.postalCode}
              onChange={set('postalCode')}
              required
              placeholder="1000"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              value={value.phone}
              onChange={set('phone')}
              placeholder="+63 9XX XXX XXXX"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, count, clearCart } = useCart();
  const { customer, token } = useCustomerAuth();

  const [step, setStep] = useState<Step>('address');
  const [shipping, setShipping] = useState<Address>(
    customer
      ? { ...emptyAddress, firstName: customer.firstName, lastName: customer.lastName }
      : emptyAddress
  );
  const [email, setEmail] = useState(customer?.email ?? '');
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; id: string } | null>(null);

  if (count === 0 && !orderResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-orange-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <a href="/store/products" className="mt-4 inline-block text-orange-500 font-semibold hover:underline">
            ← Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  // ── Order placed successfully ──
  if (orderResult) {
    const paymentOpt = PAYMENT_OPTIONS.find((p) => p.value === paymentMethod);
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Thank you for your purchase. Your order number is:
            </p>
            <div className="bg-orange-50 rounded-xl px-6 py-3 text-xl font-bold text-orange-600 mb-6 inline-block">
              {orderResult.orderNumber}
            </div>
            <p className="text-xs text-gray-500 mb-8">
              A confirmation email will be sent to <strong>{email}</strong>.
              {paymentMethod === 'CASH_ON_DELIVERY' && ' Please prepare exact payment upon delivery.'}
              {paymentMethod === 'GCASH' && ' Please send payment to our GCash number and include your order number as reference.'}
              {paymentMethod === 'PAYMAYA' && ' Please send payment via Maya and include your order number as reference.'}
              {paymentMethod === 'BANK_TRANSFER' && ' Please transfer payment to our bank account and email us your reference number.'}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`/store/account/orders/${orderResult.orderNumber}`}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
              >
                Track Order
              </a>
              <a
                href="/store/products"
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Address step ──
  async function handleAddressNext(e: React.FormEvent) {
    e.preventDefault();
    setStep('payment');
  }

  // ── Place order ──
  async function handlePlaceOrder() {
    setError('');
    setSubmitting(true);
    try {
      const body = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        paymentMethod,
        shippingAddress: shipping,
        customerEmail: email,
        customerNote: note || undefined,
        couponCode: couponCode || undefined,
      };

      const res = await fetch(`${BACKEND}/api/v1/storefront/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json() as {
        success: boolean;
        data?: { id: string; orderNumber: string };
        error?: { message: string };
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to place order. Please try again.');
      }

      clearCart();
      setOrderResult(json.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator current={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">

              {/* Step: Address */}
              {step === 'address' && (
                <form onSubmit={handleAddressNext} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>

                  <AddressForm
                    title="Shipping Address"
                    value={shipping}
                    onChange={setShipping}
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Order note (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Any special instructions for your order?"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Step: Payment */}
              {step === 'payment' && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-gray-900">Payment Method</h3>

                  <div className="space-y-3">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = paymentMethod === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPaymentMethod(opt.value)}
                          className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-100 hover:border-orange-200'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${selected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${selected ? 'text-orange-600' : 'text-gray-900'}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500">{opt.description}</p>
                          </div>
                          {selected && (
                            <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Coupon */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coupon code (optional)</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('address')}
                      className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep('review')}
                      className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      Review Order <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Review */}
              {step === 'review' && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-gray-900">Review Your Order</h3>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Shipping summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping To</p>
                      <button onClick={() => setStep('address')} className="text-xs text-orange-500 hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{shipping.firstName} {shipping.lastName}</p>
                    <p className="text-sm text-gray-600">{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ''}</p>
                    <p className="text-sm text-gray-600">{shipping.city}, {shipping.state} {shipping.postalCode}</p>
                    <p className="text-sm text-gray-600">{email}</p>
                  </div>

                  {/* Payment summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</p>
                      <button onClick={() => setStep('payment')} className="text-xs text-orange-500 hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('payment')}
                      className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                      className="flex-1 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Placing Order…' : `Place Order — ${formatPrice(subtotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                Order Summary ({count} {count === 1 ? 'item' : 'items'})
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex items-center gap-2">
                    <div className="relative h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 flex-1 line-clamp-2">{item.name}</p>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 text-xs font-medium">TBD</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
