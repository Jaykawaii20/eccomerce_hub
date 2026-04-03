'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalesByDay {
  date: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

interface ReportsApiResponse {
  data: {
    salesByDay?: SalesByDay[];
    rows?: SalesByDay[];
  };
}

interface TopProductsApiResponse {
  data: TopProduct[];
}

type PeriodKey = 'today' | '7d' | '30d' | '90d';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: 'today', label: 'Today', days: 0 },
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
];

function getDateRange(periodKey: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  const period = PERIODS.find((p) => p.key === periodKey)!;
  if (period.days === 0) {
    return { from: to, to };
  }
  const from = new Date(now);
  from.setDate(from.getDate() - period.days);
  return { from: from.toISOString().split('T')[0], to };
}

export default function SalesPage() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [salesData, setSalesData] = useState<SalesByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { from, to } = getDateRange(period);
    try {
      const { data } = await apiClient.get<ReportsApiResponse>(
        `/reports/sales?from=${from}&to=${to}&groupBy=day`
      );
      const rows: SalesByDay[] =
        data.data?.salesByDay ?? data.data?.rows ?? [];
      setSalesData(rows.sort((a, b) => (a.date < b.date ? 1 : -1)));
    } catch {
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const fetchTopProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { from, to } = getDateRange(period);
    try {
      const { data } = await apiClient.get<TopProductsApiResponse>(
        `/reports/top-products?from=${from}&to=${to}`
      );
      setTopProducts(data.data ?? []);
    } catch {
      setTopProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSales();
    fetchTopProducts();
  }, [fetchSales, fetchTopProducts]);

  const totalRevenue = salesData.reduce((sum, row) => sum + row.revenue, 0);
  const totalOrders = salesData.reduce((sum, row) => sum + row.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxRevenue = salesData.length > 0 ? Math.max(...salesData.map((r) => r.revenue)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" description="Detailed sales transactions by date" />

      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <Button
            key={p.key}
            variant={period === p.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground mb-1">Orders</p>
          <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground mb-1">Avg. Order Value</p>
          <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
        </Card>
      </div>

      {/* Sales by date table */}
      {loading ? (
        <DataTableSkeleton columns={3} rows={10} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="w-1/3">Relative</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.length === 0 ? (
                <TableEmpty>No sales data for this period.</TableEmpty>
              ) : (
                salesData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
                    <TableCell className="text-sm">{row.orders}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {maxRevenue > 0 ? Math.round((row.revenue / maxRevenue) * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Top products */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Top Products</h2>
        {loadingProducts ? (
          <DataTableSkeleton columns={4} rows={5} />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableEmpty>No product data for this period.</TableEmpty>
                ) : (
                  topProducts.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Badge
                          variant={
                            idx === 0
                              ? 'default'
                              : idx === 1
                              ? 'secondary'
                              : 'outline'
                          }
                          className="w-7 h-7 flex items-center justify-center p-0 rounded-full font-bold"
                        >
                          {idx + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.unitsSold}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(p.revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
