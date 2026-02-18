'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, ShieldAlert, Wrench, Calendar, Loader2, ChevronRight, Mail, Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { addMonths, parseISO, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type AlertType = 'warranty_expiring' | 'maintenance_due' | 'lending_overdue';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  warrantyId: string;
  warrantyName: string;
  daysUntil: number;
  date: string;
}

export default function SmartAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: items } = await supabase.from('warranties').select('*').eq('user_id', user.id);
    if (!items) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const list: Alert[] = [];

    for (const w of items) {
      const exp = addMonths(parseISO(w.purchase_date), w.warranty_months);
      const days = differenceInDays(exp, now);

      if (days <= 30 && days >= 0) {
        list.push({
          id: `${w.id}-exp`,
          type: 'warranty_expiring',
          title: 'Garantia vence em breve',
          description: `A garantia de ${w.name} vence em ${days} dias.`,
          warrantyId: w.id,
          warrantyName: w.name,
          daysUntil: days,
          date: format(exp, "dd/MM/yyyy", { locale: ptBR }),
        });
      }

      const freq = w.maintenance_frequency_months || 12;
      const last = w.last_maintenance_date ? parseISO(w.last_maintenance_date) : parseISO(w.purchase_date);
      const nextMaintenance = addMonths(last, freq);
      const daysMaintenance = differenceInDays(nextMaintenance, now);

      if (daysMaintenance <= 30 && daysMaintenance >= 0) {
        list.push({
          id: `${w.id}-maint`,
          type: 'maintenance_due',
          title: 'Manutenção programada',
          description: `Revisão recomendada para ${w.name} em ${daysMaintenance} dias.`,
          warrantyId: w.id,
          warrantyName: w.name,
          daysUntil: daysMaintenance,
          date: format(nextMaintenance, "dd/MM/yyyy", { locale: ptBR }),
        });
      }
    }

    list.sort((a, b) => a.daysUntil - b.daysUntil);
    setAlerts(list);
    setLoading(false);
  };

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'warranty_expiring': return <ShieldAlert className="h-5 w-5 text-amber-600" />;
      case 'maintenance_due': return <Wrench className="h-5 w-5 text-blue-600" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getBgColor = (type: AlertType) => {
    switch (type) {
      case 'warranty_expiring': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800';
      case 'maintenance_due': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-900/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            Alertas <span className="text-emerald-600">Inteligentes</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Notificações 30, 15 e 7 dias antes do vencimento de garantias e manutenções.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20">
          <Bell className="h-4 w-4" /> {alerts.length} alertas
        </div>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-500" />
              <span className="font-medium">E-mail</span>
            </div>
            <button
              onClick={() => { setEmailEnabled(!emailEnabled); toast.success(emailEnabled ? 'E-mail desativado' : 'E-mail ativado'); }}
              className={`relative w-12 h-7 rounded-full transition-colors ${emailEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${emailEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-slate-500" />
              <span className="font-medium">Push no celular</span>
            </div>
            <button
              onClick={() => { setPushEnabled(!pushEnabled); toast.info('Push em breve!'); }}
              className={`relative w-12 h-7 rounded-full transition-colors ${pushEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Alertas Ativos</h2>
        {alerts.length === 0 ? (
          <Card className="border-none shadow-xl p-12 text-center">
            <Check className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum alerta no momento.</p>
            <p className="text-slate-400 text-sm mt-1">Você será notificado 30, 15 e 7 dias antes de vencimentos.</p>
            <Link href="/maintenance">
              <Button variant="outline" className="mt-6">Configurar Manutenções</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/products/${a.warrantyId}`}>
                  <Card className={`border-none shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${getBgColor(a.type)}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                        {getIcon(a.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white">{a.title}</p>
                        <p className="text-sm text-slate-500 truncate">{a.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{a.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{a.daysUntil}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">dias</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
