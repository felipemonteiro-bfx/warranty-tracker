'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Algo deu errado
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            O erro foi registrado. Nossa equipe será notificada.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="block text-sm text-slate-500 hover:text-emerald-600"
          >
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  );
}
