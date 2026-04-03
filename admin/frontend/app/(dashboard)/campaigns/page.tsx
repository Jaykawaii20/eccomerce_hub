'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-muted-foreground/60">{value}</p>
    </Card>
  );
}

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Email and promotional campaigns to engage your customers"
        action={
          <div className="flex flex-col items-end gap-1">
            <Button disabled>
              <Megaphone className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Campaigns" value="0" />
        <StatCard label="Total Reach" value="—" />
        <StatCard label="Avg. Open Rate" value="—" />
      </div>

      {/* Empty state card */}
      <Card className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="rounded-full bg-muted p-5 mb-5">
          <Megaphone className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No campaigns yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create email and promotional campaigns to engage your customers. This feature is
          coming soon.
        </p>
      </Card>

      {/* Recent activity skeleton preview */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-muted-foreground">Recent Activity</h2>
        <Card>
          <div className="border-b bg-muted/30 flex gap-4 px-4 py-3">
            {['Campaign', 'Status', 'Sent', 'Open Rate'].map((col) => (
              <span key={col} className="flex-1 text-xs font-medium text-muted-foreground">
                {col}
              </span>
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-0 opacity-40">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
