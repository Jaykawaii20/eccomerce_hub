'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const BACKEND_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export interface NavLink {
  label: string;
  href: string;
}

export interface StoreConfig {
  loaded: boolean;
  primaryColor: string;
  navbar: {
    logoText: string;
    backgroundColor: string;
    textColor: string;
    showSearch: boolean;
    showCart: boolean;
    navLinks: NavLink[];
  };
}

const initialState: StoreConfig = {
  loaded: false,
  primaryColor: '#f97316',
  navbar: {
    logoText: '',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    showSearch: true,
    showCart: true,
    navLinks: [],
  },
};

const StoreConfigContext = createContext<StoreConfig>(initialState);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(initialState);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/page-builder/public`)
      .then((r) => r.json())
      .then((json) => {
        const g = json?.data?.globalStyles ?? {};
        const sections: { type: string; props: Record<string, unknown> }[] =
          json?.data?.sections ?? [];

        // Navbar props come from the navbar section in the page builder
        const navbarSection = sections.find((s) => s.type === 'navbar');
        const np = navbarSection?.props ?? {};

        setConfig({
          loaded: true,
          // Primary color comes from global styles
          primaryColor: (g.primaryColor as string) || '#f97316',
          navbar: {
            // Logo text: navbar section prop → global storeName (fallback)
            logoText: (np['logoText'] as string) || (g.storeName as string) || '',
            backgroundColor: (np['backgroundColor'] as string) || '#ffffff',
            textColor: (np['textColor'] as string) || '#111827',
            showSearch: np['showSearch'] !== undefined ? Boolean(np['showSearch']) : true,
            showCart: np['showCart'] !== undefined ? Boolean(np['showCart']) : true,
            navLinks:
              Array.isArray(np['navLinks']) && (np['navLinks'] as NavLink[]).length > 0
                ? (np['navLinks'] as NavLink[])
                : [
                    { label: 'Home', href: '/store' },
                    { label: 'Shop', href: '/store/products' },
                  ],
          },
        });
      })
      .catch(() => {
        setConfig((prev) => ({ ...prev, loaded: true }));
      });
  }, []);

  return (
    <StoreConfigContext.Provider value={config}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}
