'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign } from 'lucide-react';

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number | null;
  ordersChange: number | null;
}

interface SalesRow {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  name: string;
  totalRevenue: number;
  totalQuantity: number;
}

const PERIOD_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
];

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
  currency = 'USD',
}: {
  title: string;
  value: number;
  change?: number | null;
  icon: React.ElementType;
  format?: 'number' | 'currency';
  currency?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {format === 'currency' ? formatCurrency(value, currency) : value.toLocaleString()}
            </p>
            {change !== undefined && (
              <div className="mt-1">
                <ChangeIndicator value={change ?? null} />
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback(() => {
    const to = new Date();
    const from = new Date(to.getTime() - periodDays * 24 * 60 * 60 * 1000);
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }, [periodDays]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { from, to } = getDateRange();
    const params = `from=${from}&to=${to}`;
    try {
      const [summaryRes, salesRes, topRes] = await Promise.all([
        apiClient.get<{ data: Summary }>(`/reports/summary?${params}`),
        apiClient.get<{ data: SalesRow[] }>(`/reports/sales?${params}&groupBy=day`),
        apiClient.get<{ data: TopProduct[] }>(`/reports/top-products?${params}`),
      ]);
      setSummary(summaryRes.data.data);
      setSalesData(salesRes.data.data ?? []);
      setTopProducts(topRes.data.data ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const maxRevenue = Math.max(...salesData.map((r) => r.revenue), 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Sales performance and business analytics">
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.days}
              size="sm"
              variant={periodDays === opt.days ? 'default' : 'outline'}
              onClick={() => setPeriodDays(opt.days)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Revenue"
              value={summary.totalRevenue}
              change={summary.revenueChange}
              icon={DollarSign}
              format="currency"
            />
            <StatCard
              title="Orders"
              value={summary.totalOrders}
              change={summary.ordersChange}
              icon={ShoppingCart}
            />
            <StatCard title="Customers" value={summary.totalCustomers} icon={Users} />
            <StatCard title="Active Products" value={summary.totalProducts} icon={Package} />
          </div>

          {/* Revenue chart — simple CSS bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No sales data for this period.</p>
              ) : (
                <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
                  {salesData.map((row) => {
                    const height = Math.max((row.revenue / maxRevenue) * 100, 2);
                    return (
                      <div key={row.date} className="flex-1 min-w-[8px] flex flex-col items-center gap-1 group">
                        <div
                          className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-default relative"
                          style={{ height: `${height}%` }}
                          title={`${formatCurrency(row.revenue)} · ${row.orders} orders`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No product data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, idx) => {
                    const maxRev = topProducts[0]?.totalRevenue ?? 1;
                    const pct = (product.totalRevenue / maxRev) * 100;
                    return (
                      <div key={product.productId}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="w-6 h-6 p-0 justify-center text-xs">
                              {idx + 1}
                            </Badge>
                            <span className="text-sm font-medium truncate max-w-[200px]">{product.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">{formatCurrency(product.totalRevenue)}</p>
                            <p className="text-xs text-muted-foreground">{product.totalQuantity} sold</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
