'use client';

import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Ecommerce Graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-bounce">
            <div className="w-20 h-20 bg-yellow-200 rounded-full opacity-60 blur-2xl" />
          </div>
          <div className="absolute bottom-20 right-10 animate-pulse">
            <div className="w-32 h-32 bg-purple-200 rounded-full opacity-60 blur-3xl" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-64 bg-blue-100 rounded-full opacity-40 blur-3xl" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Cartoon-style illustration area */}
          <div className="text-center space-y-8">
            {/* Animated floating shopping bag */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl rotate-12 shadow-xl" />
                <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white" />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-pulse">
                  ✨
                </div>
              </div>
            </motion.div>

            {/* Playful headline */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to <br />Ecommerce Hub
              </h2>
              <p className="text-gray-700 text-lg">
                Manage your store, track orders, and grow your business
              </p>
            </div>

            {/* Feature list with cartoon icons */}
            <div className="space-y-3 mt-8">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📦</span>
                </div>
                <span className="text-gray-700">Easy product management</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🚚</span>
                </div>
                <span className="text-gray-700">Real-time order tracking</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">💳</span>
                </div>
                <span className="text-gray-700">Secure payment processing</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 text-sm">🎧</span>
                </div>
                <span className="text-gray-700">24/7 customer support</span>
              </div>
            </div>

            {/* Customer rating */}
            <div className="flex items-center justify-center gap-1 mt-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
              <span className="ml-2 text-gray-600 text-sm">Trusted by 10,000+ stores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-black">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:block mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 mb-6">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}