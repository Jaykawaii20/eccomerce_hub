'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { Save, Check } from 'lucide-react';

interface SettingsMap {
  store_name?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  store_city?: string;
  store_country?: string;
  store_currency?: string;
  store_timezone?: string;
  store_weight_unit?: string;
  store_dimension_unit?: string;
  store_tax_display?: string;
  store_tagline?: string;
}

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'MYR', 'PHP'];
const WEIGHT_UNITS = ['kg', 'g', 'lbs', 'oz'];
const DIMENSION_UNITS = ['cm', 'm', 'mm', 'in'];
const TAX_DISPLAY = ['inclusive', 'exclusive'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get<{ data: SettingsMap }>('/settings');
        setSettings(data.data ?? {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleChange(key: keyof SettingsMap, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.post('/settings', settings as Record<string, string>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Configure your store settings" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your store settings">
        <Button onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save changes'}
            </>
          )}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Information</CardTitle>
              <CardDescription>Basic details shown to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name ?? ''}
                    onChange={(e) => handleChange('store_name', e.target.value)}
                    placeholder="My Store"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="store_email">Contact Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email ?? ''}
                    onChange={(e) => handleChange('store_email', e.target.value)}
                    placeholder="hello@mystore.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="store_tagline">Tagline</Label>
                <Input
                  id="store_tagline"
                  value={settings.store_tagline ?? ''}
                  onChange={(e) => handleChange('store_tagline', e.target.value)}
                  placeholder="Quality products delivered fast"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="store_phone">Phone</Label>
                <Input
                  id="store_phone"
                  value={settings.store_phone ?? ''}
                  onChange={(e) => handleChange('store_phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor="store_address">Address</Label>
                <Textarea
                  id="store_address"
                  value={settings.store_address ?? ''}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                  placeholder="123 Main St"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="store_city">City</Label>
                  <Input
                    id="store_city"
                    value={settings.store_city ?? ''}
                    onChange={(e) => handleChange('store_city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="store_country">Country (ISO code)</Label>
                  <Input
                    id="store_country"
                    value={settings.store_country ?? ''}
                    onChange={(e) => handleChange('store_country', e.target.value)}
                    placeholder="US"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional Settings</CardTitle>
              <CardDescription>Currency, units, and tax display.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="store_currency">Currency</Label>
                  <select
                    id="store_currency"
                    value={settings.store_currency ?? 'USD'}
                    onChange={(e) => handleChange('store_currency', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="store_timezone">Timezone</Label>
                  <Input
                    id="store_timezone"
                    value={settings.store_timezone ?? ''}
                    onChange={(e) => handleChange('store_timezone', e.target.value)}
                    placeholder="America/New_York"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="store_weight_unit">Weight Unit</Label>
                  <select
                    id="store_weight_unit"
                    value={settings.store_weight_unit ?? 'kg'}
                    onChange={(e) => handleChange('store_weight_unit', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {WEIGHT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="store_dimension_unit">Dimension Unit</Label>
                  <select
                    id="store_dimension_unit"
                    value={settings.store_dimension_unit ?? 'cm'}
                    onChange={(e) => handleChange('store_dimension_unit', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {DIMENSION_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="store_tax_display">Tax Display</Label>
                  <select
                    id="store_tax_display"
                    value={settings.store_tax_display ?? 'exclusive'}
                    onChange={(e) => handleChange('store_tax_display', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {TAX_DISPLAY.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Currency is stored as ISO 4217 code (e.g. USD, EUR). All prices are stored in cents internally.</p>
              <Separator />
              <p>Timezone affects how dates are displayed in reports and order management. Use IANA format (e.g. <code className="text-foreground">Asia/Singapore</code>).</p>
              <Separator />
              <p>Changes take effect immediately after saving. No restart required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
