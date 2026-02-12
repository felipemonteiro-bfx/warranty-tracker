'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <Toaster position="top-center" richColors />
    </ErrorBoundary>
  );
}
