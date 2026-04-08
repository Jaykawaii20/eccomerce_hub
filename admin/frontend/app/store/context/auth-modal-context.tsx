'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export type AuthModalTab = 'login' | 'register';

interface OpenOptions {
  tab?: AuthModalTab;
  /** URL to navigate to after successful auth. If omitted, stays on current page. */
  redirect?: string;
  /** Called after successful login/register instead of navigating. */
  onSuccess?: () => void;
}

interface AuthModalContextValue {
  isOpen: boolean;
  tab: AuthModalTab;
  redirect: string | undefined;
  onSuccess: (() => void) | undefined;
  openAuthModal: (opts?: OpenOptions) => void;
  closeAuthModal: () => void;
  switchTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>('login');
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(undefined);

  const openAuthModal = useCallback((opts: OpenOptions = {}) => {
    setTab(opts.tab ?? 'login');
    setRedirect(opts.redirect);
    // useState setter with a function: wrap in another fn to avoid calling it immediately
    setOnSuccess(opts.onSuccess ? () => opts.onSuccess : undefined);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchTab = useCallback((t: AuthModalTab) => {
    setTab(t);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, redirect, onSuccess, openAuthModal, closeAuthModal, switchTab }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider');
  return ctx;
}
