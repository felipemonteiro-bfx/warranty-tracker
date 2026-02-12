'use client';

import PanicProvider from './PanicProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PanicProvider>
        {children}
        <Toaster position="top-center" richColors />
      </PanicProvider>
    </ErrorBoundary>
  );
}
