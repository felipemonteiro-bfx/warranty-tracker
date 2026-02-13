'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { AuthForm } from '@/components/shared/AuthForm';
import { ShieldCheck } from 'lucide-react';

function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');

  useEffect(() => {
    // Log do erro mas não bloquear
    console.warn('Erro na página de login (Server Component):', error);
    
    // Se for erro de rate limit, não resetar automaticamente
    if (errorParam === 'rate_limit') {
      return;
    }
    
    // Para outros erros, tentar resetar após um tempo
    const timer = setTimeout(() => {
      try {
        reset();
      } catch {
        // Ignorar erros ao resetar
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [error, errorParam, reset]);

  // Se for erro de rate limit, mostrar mensagem específica mas ainda permitir login
  if (errorParam === 'rate_limit') {
    return (
      <div className="min-h-screen bg-teal-50/20 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Guardião.</h1>
          </div>

          <div className="glass p-8 rounded-3xl shadow-2xl shadow-emerald-500/5">
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                {messageParam || 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'}
              </p>
            </div>
            <AuthForm type="login" />
          </div>

          <p className="text-center text-sm font-bold text-slate-400">
            Proteção de dados auditada via IA • 2026
          </p>
        </div>
      </div>
    );
  }

  // Para outros erros, mostrar tela de erro mas permitir tentar novamente
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50/20 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Erro ao carregar página
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Tente novamente ou volte para a página inicial.
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} className="flex-1">
            Tentar Novamente
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-teal-50/20 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Carregando...
          </h1>
        </div>
      </div>
    }>
      <ErrorContent error={error} reset={reset} />
    </Suspense>
  );
}
