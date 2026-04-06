import { create } from 'zustand';
import { apiClient, setAccessToken, clearAccessToken } from '@/lib/api-client';
import { clearSupabaseSession, setSupabaseSession } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true, // start as true so layout waits for checkAuth() before deciding to redirect

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Call Next.js proxy — sets refreshToken cookie on the correct domain
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message ?? 'Login failed.');
      }
      setAccessToken(json.data.tokens.accessToken);

      // set supabase session with the tokens from backend
      try {
        await setSupabaseSession(json.data.tokens.accessToken, json.data.tokens.refreshToken);
      } catch (supabaseError) {
        console.error('Failed to get Supabase session:', supabaseError);
      }

      set({ user: json.data.user, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      throw new Error(error instanceof Error ? error.message : 'Login failed.');
    }
  },

  logout: async () => {
    try {
      const { getAccessToken } = await import('@/lib/api-client');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
      });
    } finally {
      clearAccessToken();

      // clear supabase session on logout
      try {
        await clearSupabaseSession();
      } catch (supabaseError) {
        console.error('Failed to clear Supabase session:', supabaseError);
      }
      set({ user: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Next.js proxy forwards the refreshToken cookie to the backend
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Session expired');
      const json = await res.json();
      setAccessToken(json.data.accessToken);

      try {
        await setSupabaseSession(json.data.accessToken, json.data.refreshToken);
        console.log('Supabase session restored successfully');
      } catch (supabaseError) {
        console.error('Failed to restore Supabase session:', supabaseError);
      }

      const { data: meData } = await apiClient.get<{ data: AuthUser }>('/auth/me');
      set({ user: meData.data, isLoading: false });
    } catch {
      clearAccessToken();

      try {
        await clearSupabaseSession();
      } catch (supabaseError) {
        console.error('Failed to clear Supabase session during auth check:', supabaseError);
      }
      set({ user: null, isLoading: false });
    }
  },
}));
