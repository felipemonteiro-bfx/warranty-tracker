'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Capturar erros globais não tratados
    const handleError = (event: ErrorEvent) => {
      console.warn('Erro global capturado (não crítico):', event.error);
      // Não fazer nada - apenas logar
      event.preventDefault();
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn('Promise rejection capturada (não crítica):', event.reason);
      // Não fazer nada - apenas logar
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      {children}
      <Toaster position="top-center" richColors />
    </ErrorBoundary>
  );
}
