'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ 
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginForm) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid email or password');
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Sign in to your account
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Enter your credentials to access your dashboard
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            className={`w-full px-4 py-2.5 text-base text-gray-900 dark:text-white bg-transparent border ${
              errors.email
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
            } rounded-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`}
            placeholder="Enter your email"
            {...register('email')}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-red-500 mt-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <button
              type="button"
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            className={`w-full px-4 py-2.5 text-base text-gray-900 dark:text-white bg-transparent border ${
              errors.password
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
            } rounded-lg outline-none transition-all`}
            placeholder="Enter your password"
            {...register('password')}
          />
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-red-500 mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/10 rounded-lg px-4 py-2"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </motion.form>
    </>
  );
}