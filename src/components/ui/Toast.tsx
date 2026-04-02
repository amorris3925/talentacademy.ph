'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          'bg-white text-gray-900 border border-gray-200 shadow-lg rounded-lg text-sm',
      }}
    />
  );
}

export function showXpToast(amount: number, source: string) {
  toast.success(`+${amount} XP — ${source}`, {
    icon: <span aria-hidden="true">&#11088;</span>,
    duration: 3000,
  });
}
