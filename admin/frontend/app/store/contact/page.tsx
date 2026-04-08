'use client';

import { useState } from 'react';
import { ShopNavbar } from '../components/shop-navbar';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would send to a backend endpoint
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-500">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Info cards */}
          <div className="md:col-span-2 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'support@store.com' },
              { icon: Phone, label: 'Phone', value: '+63 (2) 8XXX XXXX' },
              { icon: MapPin, label: 'Address', value: 'Manila, Philippines' },
              { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9AM–6PM' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-50">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 mb-6">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="text-orange-500 font-semibold text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
                    <input
                      value={form.name}
                      onChange={set('name')}
                      required
                      placeholder="Juan Dela Cruz"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      required
                      placeholder="Enter your email"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={set('subject')}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Inquiry</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
