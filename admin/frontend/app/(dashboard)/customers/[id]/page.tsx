'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Mail, Calendar, ShoppingBag } from 'lucide-react';

interface CustomerDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    type: string;
    line1: string;
    city: string;
    country: string;
  }>;
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

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: CustomerDetail }>(`/customers/${id}`)
      .then((r) => setCustomer(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center py-20 text-muted-foreground">Customer not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={customer.email}
        action={
          <Button variant="outline" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                <span>{customer.orders.length} orders</span>
              </div>
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {customer.role}
                  </Badge>
                  {customer.emailVerified && (
                    <Badge variant="success" className="text-xs">
                      Verified
                    </Badge>
                  )}
                  {!customer.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {customer.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {customer.addresses.map((a) => (
                  <div key={a.id} className="space-y-0.5">
                    <p className="font-medium capitalize">{a.type.toLowerCase()}</p>
                    <p className="text-muted-foreground">
                      {a.line1}, {a.city}, {a.country}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.length === 0 ? (
                    <TableEmpty>No orders yet.</TableEmpty>
                  ) : (
                    customer.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono font-medium">#{o.orderNumber}</TableCell>
                        <TableCell>
                          <Badge variant={ORDER_STATUS_COLORS[o.status]} className="text-xs">
                            {o.status.replace('_', ' ')}
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
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
