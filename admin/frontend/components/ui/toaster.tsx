'use client';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg bg-background',
            toast.variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground'
          )}
        >
          <div className="flex-1">
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            {toast.description && <p className="text-sm mt-1 opacity-80">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
