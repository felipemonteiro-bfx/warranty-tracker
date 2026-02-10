'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wrench, Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, Loader2, Info } from 'lucide-react';
import { formatDate, calculateExpirationDate } from '@/lib/utils/date-utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { addMonths, parseISO, isAfter, differenceInDays } from 'date-fns';

export default function MaintenanceSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    const { data } = await supabase.from('warranties').select('*');
    if (data) {
      const itemsWithSchedules = data.map(item => {
        const baseDate = item.last_maintenance_date ? parseISO(item.last_maintenance_date) : parseISO(item.purchase_date);
        const nextDate = addMonths(baseDate, item.maintenance_frequency_months || 6);
        const daysToNext = differenceInDays(nextDate, new Date());
        return { ...item, nextDate, daysToNext };
      }).sort((a, b) => a.daysToNext - b.daysToNext);
      
      setItems(itemsWithSchedules);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  const overdueItems = items.filter(i => i.daysToNext < 0);
  const upcomingItems = items.filter(i => i.daysToNext >= 0 && i.daysToNext <= 30);
  const healthyItems = items.filter(i => i.daysToNext > 30);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Cronograma de <span className="text-emerald-600">Manutenção</span></h1>
          <p className="text-slate-500 font-medium">Prolongue a vida útil do seu patrimônio com revisões preventivas.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sistema Auditado
          </div>
        </div>
      </header>

      {/* Seção de Alertas Críticos */}
      {overdueItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Revisões em Atraso ({overdueItems.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueItems.map(item => (
              <MaintenanceItemCard key={item.id} item={item} status="overdue" />
            ))}
          </div>
        </section>
      )}

      {/* Seção de Próximos 30 dias */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Agendadas para este Mês ({upcomingItems.length})
        </h3>
        {upcomingItems.length === 0 ? (
          <div className="p-8 rounded-3xl border-2 border-dashed border-slate-100 text-center text-slate-400 text-xs font-bold uppercase">Nenhuma revisão próxima.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingItems.map(item => (
              <MaintenanceItemCard key={item.id} item={item} status="upcoming" />
            ))}
          </div>
        )}
      </section>

      {/* Visão de Longo Prazo */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Planejamento de Longo Prazo
        </h3>
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Produto</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Pasta</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Frequência</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Próxima Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {healthyItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{item.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-xs">{item.folder}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-xs">{item.maintenance_frequency_months} meses</td>
                    <td className="px-6 py-4 font-black text-emerald-600 text-xs">{item.nextDate.toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <Link href={`/products/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-tighter">Detalhes</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function MaintenanceItemCard({ item, status }: { item: any, status: 'overdue' | 'upcoming' }) {
  const isOverdue = status === 'overdue';
  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className={`border-none shadow-lg overflow-hidden ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
        <div className={`h-1.5 w-full ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`} />
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 leading-tight">{item.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.folder}</p>
            </div>
            <div className={`p-2 rounded-xl ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Previsão</p>
            <p className={`text-lg font-black ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
              {item.nextDate.toLocaleDateString('pt-BR')}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase italic">
              {isOverdue ? `Atrasado há ${Math.abs(item.daysToNext)} dias` : `Faltam ${item.daysToNext} dias`}
            </p>
          </div>
          <Link href={`/products/${item.id}`}>
            <Button className={`w-full h-10 text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}>
              Resolver Agora
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
