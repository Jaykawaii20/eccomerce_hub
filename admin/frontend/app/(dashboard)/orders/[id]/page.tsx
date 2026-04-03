'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowLeft, User, MapPin, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponCode: string | null;
  customerNote: string | null;
  billingAddress: Record<string, string>;
  shippingAddress: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  items: Array<{
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes: Array<{
    id: string;
    note: string;
    isCustomerNote: boolean;
    createdAt: string;
  }>;
}

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
];

function formatAddress(a: Record<string, string>): string {
  return [a['line1'], a['line2'], a['city'], a['state'], a['postalCode'], a['country']]
    .filter(Boolean)
    .join(', ');
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ data: OrderDetail }>(`/orders/${id}`)
      .then((r) => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${id}/status`, { status });
      setOrder((prev) => (prev ? { ...prev, status } : prev));
      toast({ title: 'Status updated', description: `Order status changed to ${status}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Created ${formatDateTime(order.createdAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Select value={order.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — order items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.unitPrice, order.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.totalPrice, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="px-4 py-4 border-t space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount {order.couponCode && `(${order.couponCode})`}
                    </span>
                    <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shippingAmount === 0
                      ? 'Free'
                      : formatCurrency(order.shippingAmount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer notes */}
          {order.customerNote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}

          {/* Order notes */}
          {order.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.notes.map((n) => (
                  <div key={n.id} className="text-sm border-l-2 border-muted pl-3">
                    <p>{n.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(n.createdAt)}{' '}
                      {n.isCustomerNote && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          Customer
                        </Badge>
                      )}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — meta */}
        <div className="space-y-6">
          {order.user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">
                  {order.user.firstName} {order.user.lastName}
                </p>
                <p className="text-muted-foreground">{order.user.email}</p>
                <Button variant="link" className="p-0 h-auto text-xs" asChild>
                  <Link href={`/customers/${order.user.id}`}>View profile →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <p className="font-medium mb-1">Billing</p>
                <p className="text-muted-foreground leading-relaxed">
                  {formatAddress(order.billingAddress)}
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-1">Shipping</p>
                <p className="text-muted-foreground leading-relaxed">
                  {formatAddress(order.shippingAddress)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.paymentMethod ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                  className="text-xs"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
