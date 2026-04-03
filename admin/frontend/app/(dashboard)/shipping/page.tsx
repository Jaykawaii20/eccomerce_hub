'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Plus, Truck, Globe } from 'lucide-react';

interface ShippingMethod {
  id: string;
  name: string;
  type: string;
  cost: number;
  isActive: boolean;
  minOrderAmount: number | null;
}

interface ShippingZone {
  id: string;
  name: string;
  isDefault: boolean;
  regions: Array<{ id: string; countryCode: string; stateCode: string | null }>;
  methods: ShippingMethod[];
}

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: ShippingZone[] }>('/shipping/zones')
      .then((r) => setZones(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Configure shipping zones and rates"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No shipping zones configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a shipping zone to start setting up delivery rates.
          </p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </Card>
      ) : (
        zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{zone.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {zone.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {zone.regions.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {zone.regions.map((r) => r.countryCode).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit Zone
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground mb-3">Shipping Methods</p>
              {zone.methods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No methods configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {zone.methods.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.type.replace('_', ' ')}
                          {m.minOrderAmount != null &&
                            ` — Free over ${formatCurrency(m.minOrderAmount)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">
                          {m.cost === 0 ? 'Free' : formatCurrency(m.cost)}
                        </span>
                        <Badge variant={m.isActive ? 'success' : 'secondary'}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-3 w-3 mr-1" />
                Add Method
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
