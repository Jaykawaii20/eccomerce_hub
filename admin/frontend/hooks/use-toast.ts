'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Simple global toast state using module-level variable
let toastState: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  listeners.forEach((l) => l([...toastState]));
}

export function toast(opts: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  toastState = [...toastState, { ...opts, id }];
  notify();
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState);

  const subscribe = useCallback((fn: (toasts: Toast[]) => void) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);

  useState(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  });

  const dismiss = useCallback((id: string) => {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }, []);

  return { toasts, dismiss, toast };
}
