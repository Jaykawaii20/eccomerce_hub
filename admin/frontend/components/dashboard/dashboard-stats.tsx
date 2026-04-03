'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface Stats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  products: number;
}

const defaultStats: Stats = {
  revenue: 0, revenueChange: 0, orders: 0, ordersChange: 0,
  customers: 0, customersChange: 0, products: 0,
};

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ data: Stats }>('/reports/stats')
      .then((r) => setStats(r.data.data))
      .catch(() => {}) // endpoint not yet implemented — show zeros
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Orders',
      value: stats.orders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Customers',
      value: stats.customers.toLocaleString(),
      change: stats.customersChange,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Products',
      value: stats.products.toLocaleString(),
      change: null,
      icon: Package,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-full bg-muted ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-24 bg-muted animate-pulse rounded" /> : card.value}
              </div>
              {card.change !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(card.change)}% from last month
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
