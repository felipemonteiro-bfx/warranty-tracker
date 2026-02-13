'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log do erro mas não bloquear
    console.warn('Erro no dashboard (Server Component):', error);
  }, [error]);

  // Não mostrar tela de erro - apenas redirecionar ou resetar silenciosamente
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Erro ao carregar dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Tente novamente ou faça login novamente.
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} className="flex-1">
            Tentar Novamente
          </Button>
          <Button onClick={() => router.push('/login')} variant="outline" className="flex-1">
            Ir para Login
          </Button>
        </div>
      </div>
    </div>
  );
}
