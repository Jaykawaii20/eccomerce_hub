'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Search, Eye } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
}

const ORDER_STATUS_COLORS: Record<
  string,
  'default' | 'success' | 'secondary' | 'warning' | 'destructive'
> = {
  COMPLETED: 'success',
  PROCESSING: 'default',
  PENDING: 'warning',
  ON_HOLD: 'secondary',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
  FAILED: 'destructive',
};

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      const { data } = await apiClient.get<{ data: Order[] }>(`/orders?${params}`);
      setOrders(data.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage customer orders" />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or customer…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <DataTableSkeleton columns={6} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableEmpty>No orders found.</TableEmpty>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-medium">#{o.orderNumber}</TableCell>
                    <TableCell>
                      {o.user ? (
                        <div>
                          <p className="font-medium text-sm">
                            {o.user.firstName} {o.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{o.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Guest</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ORDER_STATUS_COLORS[o.status]}>
                        {o.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(o.total, o.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(o.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${o.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
