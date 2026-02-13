'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

export default function DevBypassPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se está em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  const enableBypass = () => {
    // Criar cookie de bypass
    document.cookie = 'dev-bypass=true; path=/; max-age=86400'; // 24 horas
    router.push('/dashboard');
  };

  const disableBypass = () => {
    // Remover cookie de bypass
    document.cookie = 'dev-bypass=; path=/; max-age=0';
    router.push('/login');
  };

  const isBypassActive = typeof document !== 'undefined' && document.cookie.includes('dev-bypass=true');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-yellow-500 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            Modo Desenvolvimento
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Permite acesso ao sistema sem autenticação para desenvolvimento
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {isBypassActive ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-bold text-green-600 dark:text-green-400">Bypass ATIVO</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-bold text-red-600 dark:text-red-400">Bypass INATIVO</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isBypassActive 
                ? 'Você pode acessar todas as rotas sem autenticação.'
                : 'Você precisa fazer login para acessar o sistema.'}
            </p>
          </div>

          <div className="space-y-2">
            {!isBypassActive ? (
              <Button 
                onClick={enableBypass}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-black"
              >
                Ativar Bypass de Autenticação
              </Button>
            ) : (
              <Button 
                onClick={disableBypass}
                variant="outline"
                className="w-full h-12 border-red-500 text-red-600 hover:bg-red-50 font-black"
              >
                Desativar Bypass
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              ⚠️ Este modo só funciona em desenvolvimento (NODE_ENV=development)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
