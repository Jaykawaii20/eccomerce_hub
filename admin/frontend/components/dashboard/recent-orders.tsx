'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  COMPLETED: 'success',
  PROCESSING: 'default',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
};

export function RecentOrders() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
          <p>No orders yet.</p>
          <p className="text-xs mt-1">Orders will appear here once customers start purchasing.</p>
        </div>
      </CardContent>
    </Card>
  );
}
