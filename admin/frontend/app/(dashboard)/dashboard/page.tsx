import { Metadata } from 'next';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RevenueChart } from '@/components/dashboard/revenue-chart';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
