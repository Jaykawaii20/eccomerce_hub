'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useCustomerAuth } from '../context/customer-auth-context';
import { useAuthModal } from '../context/auth-modal-context';
import { useRouter } from 'next/navigation';

function InputField({
  label, type = 'text', value, onChange, placeholder, required, minLength, autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoFocus={autoFocus}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors pr-10"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      <InputField label="Email address" type="email" value={email} onChange={setEmail} placeholder="Enter your email" required autoFocus />
      <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" required />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useCustomerAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSubmitting(true);
    try {
      await register({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="First name" value={form.firstName} onChange={set('firstName')} placeholder="Juan" required autoFocus />
        <InputField label="Last name" value={form.lastName} onChange={set('lastName')} placeholder="Dela Cruz" required />
      </div>
      <InputField label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" required />
      <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required minLength={8} />
      <InputField label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" required />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}

export function AuthModal() {
  const { isOpen, tab, redirect, onSuccess, closeAuthModal, switchTab } = useAuthModal();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closeAuthModal]);

  function handleSuccess() {
    closeAuthModal();
    if (onSuccess) {
      onSuccess();
    } else if (redirect) {
      router.push(redirect);
    }
    // else: stay on current page — the auth context already updated the UI
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                tab === t ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'login' ? (
            <>
              <p className="text-gray-500 text-sm mb-5">Welcome! Sign in to continue.</p>
              <LoginForm onSuccess={handleSuccess} />
              <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button onClick={() => switchTab('register')} className="text-orange-500 font-semibold hover:underline">
                  Create one
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-5">Join us and start shopping today.</p>
              <RegisterForm onSuccess={handleSuccess} />
              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => switchTab('login')} className="text-orange-500 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
