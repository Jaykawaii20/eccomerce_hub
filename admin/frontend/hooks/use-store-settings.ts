import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface StoreSettings {
  store_name?: string;
  store_currency?: string;
  store_weight_unit?: string;
  store_dimension_unit?: string;
  store_timezone?: string;
  store_tax_display?: string;
}

let cachedSettings: StoreSettings | null = null;
let fetchPromise: Promise<StoreSettings> | null = null;

async function fetchSettings(): Promise<StoreSettings> {
  if (cachedSettings) return cachedSettings;
  if (fetchPromise) return fetchPromise;

  fetchPromise = apiClient
    .get<{ data: StoreSettings }>('/settings')
    .then(({ data }) => {
      cachedSettings = data.data ?? {};
      fetchPromise = null;
      return cachedSettings;
    })
    .catch(() => {
      fetchPromise = null;
      return {};
    });

  return fetchPromise;
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings ?? {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }
    fetchSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const currency = settings.store_currency ?? 'USD';

  function getCurrencySymbol(code: string): string {
    try {
      return (0)
        .toLocaleString('en', { style: 'currency', currency: code, minimumFractionDigits: 0 })
        .replace(/[\d,.\s]/g, '')
        .trim();
    } catch {
      return code;
    }
  }

  return {
    settings,
    loading,
    currency,
    currencySymbol: getCurrencySymbol(currency),
  };
}
