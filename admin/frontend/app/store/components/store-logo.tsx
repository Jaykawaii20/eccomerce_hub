'use client';

import { useStoreConfig } from '../context/store-config-context';

export function StoreLogo() {
  const { loaded, navbar, primaryColor } = useStoreConfig();
  return (
    <a href="/store" className="text-xl font-bold" style={{ color: primaryColor }}>
      {loaded ? navbar.logoText : ''}
    </a>
  );
}
