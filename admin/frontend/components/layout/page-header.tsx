import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  const actionSlot = action ?? children;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {actionSlot && <div className="shrink-0">{actionSlot}</div>}
    </div>
  );
}
