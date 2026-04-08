'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface CustomerAuthContextValue {
  customer: Customer | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  /** Refreshes the access token if expired. Returns the new token or null on failure. */
  refreshToken: () => Promise<string | null>;
  /** fetch() wrapper that auto-refreshes on 401 and retries once. */
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

const TOKEN_KEY = 'shopCustomerToken';
const REFRESH_KEY = 'shopCustomerRefreshToken';
const CUSTOMER_KEY = 'shopCustomer';
const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Keep a ref to the current token so authFetch closure always has the latest value
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedCustomer = localStorage.getItem(CUSTOMER_KEY);
      if (storedToken && storedCustomer) {
        setToken(storedToken);
        setCustomer(JSON.parse(storedCustomer) as Customer);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  const storeSession = useCallback((user: Customer, accessToken: string, refreshTokenValue: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshTokenValue);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
    setToken(accessToken);
    setCustomer(user);
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const storedRefresh = localStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) return null;

    try {
      const res = await fetch(`${BACKEND}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });
      if (!res.ok) {
        clearSession();
        return null;
      }
      const json = await res.json() as {
        success: boolean;
        data?: { accessToken: string; refreshToken: string };
      };
      if (!json.success || !json.data) {
        clearSession();
        return null;
      }
      const { accessToken, refreshToken: newRefresh } = json.data;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, newRefresh);
      setToken(accessToken);
      tokenRef.current = accessToken;
      return accessToken;
    } catch {
      return null;
    }
  }, [clearSession]);

  /** Drop-in fetch() that adds Authorization and retries once after a 401 by refreshing the token. */
  const authFetch = useCallback(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const currentToken = tokenRef.current;
    const headers = new Headers(init?.headers);
    if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`);

    let res = await fetch(input, { ...init, headers });

    if (res.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        res = await fetch(input, { ...init, headers });
      }
    }

    return res;
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BACKEND}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json() as {
      success: boolean;
      data?: { user: Customer; tokens: { accessToken: string; refreshToken: string } };
      error?: { message: string };
    };
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message ?? 'Login failed');
    }
    const { tokens, user } = json.data!;
    storeSession(user, tokens.accessToken, tokens.refreshToken);
  }, [storeSession]);

  const logout = useCallback(() => {
    clearSession();
    router.push('/store');
  }, [clearSession, router]);

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch(`${BACKEND}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json() as {
      success: boolean;
      data?: { user: Customer; tokens: { accessToken: string; refreshToken: string } };
      error?: { message: string };
    };
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message ?? 'Registration failed');
    }
    if (json.data?.tokens?.accessToken) {
      const { tokens, user } = json.data;
      storeSession(user, tokens.accessToken, tokens.refreshToken);
    }
  }, [storeSession]);

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, login, logout, register, refreshToken, authFetch }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}
