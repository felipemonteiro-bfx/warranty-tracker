'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

export default function SentryTestPage() {
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  const throwClientError = () => {
    const err = new Error('Erro de teste do Sentry (cliente) - [Sentry Test Page]');
    Sentry.captureException(err);
    setApiStatus('Erro enviado ao Sentry! Verifique em sentry.io');
  };

  const captureMessage = () => {
    Sentry.captureMessage('Mensagem de teste do Sentry', 'info');
    setApiStatus('Mensagem enviada! Verifique em sentry.io');
  };

  const testApiError = async () => {
    setApiStatus('Testando...');
    try {
      const res = await fetch('/api/sentry-test');
      const data = await res.json();
      setApiStatus(res.ok ? 'API OK' : data.error || 'Erro');
    } catch (e) {
      setApiStatus('Falha na requisição');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
          ← Voltar ao Dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">
        Teste do Sentry
      </h1>
      <p className="text-slate-500">
        Use os botões abaixo para verificar se o monitoramento de erros está funcionando.
        Acesse{' '}
        <a
          href="https://sentry.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:underline"
        >
          sentry.io
        </a>{' '}
        para ver os eventos.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Erro no cliente</h2>
            <p className="text-sm text-slate-500">
              Dispara um erro que será capturado pelo Sentry no navegador.
            </p>
            <Button onClick={throwClientError} variant="danger">
              Lançar erro de teste
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Mensagem informativa</h2>
            <p className="text-sm text-slate-500">
              Envia uma mensagem customizada (aparece em Issues).
            </p>
            <Button onClick={captureMessage} variant="outline">
              Enviar mensagem
            </Button>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Erro na API (servidor)</h2>
            <p className="text-sm text-slate-500">
              Chama uma rota API que dispara um erro no servidor.
            </p>
            <Button onClick={testApiError}>Testar erro na API</Button>
            {apiStatus && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Status: {apiStatus}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        Esta página só deve ser acessada em desenvolvimento ou por administradores.
        Em produção, proteja ou remova esta rota.
      </p>
    </div>
  );
}
