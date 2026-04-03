import { Skeleton } from '@/components/ui/skeleton';

export function DataTableSkeleton({
  columns = 5,
  rows = 8,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32 ml-auto" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="border-b bg-muted/30 flex gap-4 px-4 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-0">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
