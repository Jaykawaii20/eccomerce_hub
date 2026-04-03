'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Only verify session on page refresh (user is null).
    // Skip if user is already in store — avoids double API call after login.
    if (!user) {
      checkAuth();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && !user) {
      // Use replace so the dashboard isn't added to history — prevents back-button loops.
      //window.location.replace('/login');
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
