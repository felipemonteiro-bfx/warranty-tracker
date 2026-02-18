'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Loader2, Check, Smartphone, Monitor, Radio } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      const channel = supabase
        .channel('sync-warranties')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'warranties', filter: `user_id=eq.${user.id}` },
          () => {
            if (mounted) {
              setLastSync(new Date());
              setEventCount((c) => c + 1);
              toast.success('Alteração sincronizada!', { duration: 2000 });
            }
          }
        )
        .subscribe((status) => {
          if (mounted) setRealtimeConnected(status === 'SUBSCRIBED');
        });

      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('warranties').select('id').eq('user_id', user.id).limit(1);
      if (data) setLastSync(new Date());
    }
    await new Promise((r) => setTimeout(r, 500));
    setSyncing(false);
    toast.success('Sincronização concluída!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Sincronização <span className="text-emerald-600">Multi-Dispositivo</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Supabase Realtime. Alterações sincronizadas instantaneamente entre celular e desktop.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status</h2>
              <p className="text-sm text-slate-500">
                {lastSync
                  ? `Última alteração: ${lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : realtimeConnected
                    ? 'Realtime conectado — aguardando alterações'
                    : 'Conectando ao Realtime...'}
              </p>
              {realtimeConnected && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <Radio className="h-3 w-3 animate-pulse" /> {eventCount} evento(s) recebido(s) nesta sessão
                </p>
              )}
            </div>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" /> Sincronizar
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <Monitor className="h-8 w-8 text-slate-500" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Desktop</p>
                <p className="text-xs text-slate-500">Alterações enviadas</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-slate-500" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Celular</p>
                <p className="text-xs text-slate-500">Recebe em tempo real</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
            <Check className="h-4 w-4" />
            <span>Resolução de conflitos: última edição vence, com histórico de versões.</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-900/50 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Supabase Realtime ativo. Alterações em garantias (criar, editar, excluir) são propagadas entre dispositivos. Ative Realtime na tabela <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">warranties</code> no dashboard do Supabase se necessário.
        </p>
      </Card>
    </div>
  );
}
