'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from 'lucide-react';

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Manage product brands"
        action={
          <Button disabled>
            <Store className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        }
      />

      <Card className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="rounded-full bg-muted p-5 mb-5">
          <Store className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Brand management coming soon</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Brands will be linked to products for better catalog organization. This feature is
          in development.
        </p>
      </Card>

      {/* Visual preview of upcoming brand cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 opacity-40">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
