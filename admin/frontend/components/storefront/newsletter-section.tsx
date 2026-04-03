'use client';

import { useState } from 'react';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function NewsletterSection({
  title = 'Stay in the Loop',
  subtitle = 'Get the latest deals, new arrivals and exclusive offers straight to your inbox.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  backgroundColor = '#f3f4f6',
  textColor = '#111827',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  }

  return (
    <section className="py-16" style={{ backgroundColor }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: textColor }}>
          {title}
        </h2>
        <p className="mt-3 opacity-70" style={{ color: textColor }}>
          {subtitle}
        </p>

        {submitted ? (
          <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-xl font-medium">
            Thanks for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              {buttonText}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs opacity-50" style={{ color: textColor }}>
          No spam, unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
