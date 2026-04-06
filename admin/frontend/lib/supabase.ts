// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

// Set Supabase session with tokens from your backend
export const setSupabaseSession = async (accessToken: string, refreshToken?: string) => {
  if (!accessToken) {
    console.error('No access token provided to setSupabaseSession');
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
    
    if (error) {
      console.error('Supabase setSession error:', error);
      throw error;
    }
    
    console.log('Supabase session set successfully');
    return data;
  } catch (error) {
    console.error('Failed to set Supabase session:', error);
    throw error;
  }
};

// Clear Supabase session on logout
export const clearSupabaseSession = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error);
      throw error;
    }
    console.log('Supabase session cleared successfully');
  } catch (error) {
    console.error('Failed to clear Supabase session:', error);
    throw error;
  }
};

// Helper to get current Supabase session
export const getSupabaseSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }
  return session;
};

// Helper to check if user is authenticated in Supabase
export const isSupabaseAuthenticated = async () => {
  const session = await getSupabaseSession();
  return !!session;
};