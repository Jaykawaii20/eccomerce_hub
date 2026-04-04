'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

const TOKEN_KEY = 'shopCustomerToken';
const CUSTOMER_KEY = 'shopCustomer';
const BACKEND = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:4000';

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BACKEND}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json() as {
      success: boolean;
      data?: { user: Customer; tokens: { accessToken: string } };
      error?: { message: string };
    };
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message ?? 'Login failed');
    }
    const { tokens, user } = json.data!;
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
    setToken(tokens.accessToken);
    setCustomer(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch(`${BACKEND}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json() as {
      success: boolean;
      data?: { user: Customer; tokens: { accessToken: string } };
      error?: { message: string };
    };
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message ?? 'Registration failed');
    }
    // Auto-login after registration
    if (json.data?.tokens?.accessToken) {
      const { tokens, user } = json.data;
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
      setToken(tokens.accessToken);
      setCustomer(user);
    }
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, login, logout, register }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}
