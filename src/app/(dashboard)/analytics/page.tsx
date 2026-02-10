'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy, Zap, Timer, Flame, Globe, Repeat, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/lib/utils/date-utils';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      
      const { data: items } = await supabase.from('warranties').select('*');
      if (items) setData(items);

      const { data: subData } = await supabase.from('subscriptions').select('*').order('next_billing_date');
      if (subData) setSubscriptions(subData);
    }
    setLoading(false);
  };

  const totalMonthlySub = subscriptions.reduce((acc, curr) => acc + (curr.billing_cycle === 'monthly' ? Number(curr.price) : Number(curr.price) / 12), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Finance <span className="text-emerald-600">Guardian</span></h1>
          <p className="text-slate-500 font-medium text-sm">Gestão de ativos imobilizados e custos recorrentes.</p>
        </div>
      </header>

      {/* Widget de Assinaturas (New Feature) */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="h-1.5 w-full bg-blue-500" />
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
                <Repeat className="h-5 w-5 text-blue-500" /> Gestor de Assinaturas
              </CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle de renovações vinculadas aos seus bens</p>
            </div>
            <Button size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 mr-2" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="py-10 text-center space-y-4 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
                  <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-400 font-bold uppercase">Nenhuma assinatura registrada.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm">
                          <Zap className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tighter">{sub.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Renova em: {new Date(sub.next_billing_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white">R$ {Number(sub.price).toLocaleString('pt-BR')}</p>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Burn Rate */}
        <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Activity className="h-32 w-32 text-blue-500" /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
              <TrendingDown className="h-4 w-4" /> Fixed Burn Rate
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">R$ {totalMonthlySub.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custo Fixo Mensal de Ativos</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">Este valor representa a manutenção recorrente de softwares e seguros vinculados ao seu patrimônio.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><Landmark className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Patrimônio vs Gastos</CardTitle>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', valor: 42000, gasto: 150 },
                { name: 'Fev', valor: 45000, gasto: 180 },
                { name: 'Mar', valor: 48000, gasto: 210 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="valor" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-emerald-600 text-white border-none p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><ShieldCheck className="h-48 w-48 text-white" /></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter">Otimize sua <span className="text-emerald-100">Eficiência.</span></h3>
            <p className="text-emerald-50 text-sm font-medium leading-relaxed">Membros Pro economizam em média 15% cancelando assinaturas duplicadas ou esquecidas detectadas pelo Guardião.</p>
            <Button variant="ghost" className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest px-8 h-14 rounded-2xl border-none shadow-xl">Ver Sugestões de Corte</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}