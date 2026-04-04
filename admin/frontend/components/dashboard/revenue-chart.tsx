'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useStoreSettings } from '@/hooks/use-store-settings';

// Placeholder data until /reports/revenue endpoint is implemented
const placeholderData = [
  { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 }, { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
  { month: 'Jul', revenue: 0 }, { month: 'Aug', revenue: 0 },
  { month: 'Sep', revenue: 0 }, { month: 'Oct', revenue: 0 },
  { month: 'Nov', revenue: 0 }, { month: 'Dec', revenue: 0 },
];

export function RevenueChart() {
  const { currency } = useStoreSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={placeholderData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(258, 100%, 69%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(258, 100%, 69%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v, currency)} tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value), currency), 'Revenue']} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(258, 100%, 69%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
