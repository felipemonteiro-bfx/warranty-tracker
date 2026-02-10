'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy, Zap, Timer, Flame, Globe } from 'lucide-react';
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
  const [profile, setProfile] = useState<any>(null);
  const [rates, setRates] = useState({ usd: 5.12, eur: 5.55 });
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
      const json = await res.json();
      setRates({
        usd: parseFloat(json.USDBRL.bid),
        eur: parseFloat(json.EURBRL.bid)
      });
    } catch (err) { console.error("Erro ao buscar câmbio"); }
  };

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      const { data: items } = await supabase.from('warranties').select('*');
      if (items) setData(items);
    }
    setLoading(false);
  };

  // Lógica: Eletrônicos importados valorizam com a alta do dólar
  const importedValue = data.filter(i => i.category?.toLowerCase().includes('eletr') || i.category?.toLowerCase().includes('foto'))
    .reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  
  const exchangeImpact = importedValue * (rates.usd / 5.00 - 1); // Baseando em um dólar médio de 5.00

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Currency <span className="text-emerald-600">Intelligence</span></h1>
          <p className="text-slate-500 font-medium text-sm">O impacto do mercado global no valor dos seus bens.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-teal-50 dark:border-white/5 flex items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase">Dólar Hoje</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">R$ {rates.usd.toFixed(2)}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-teal-50 dark:border-white/5 flex items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase">Euro Hoje</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">R$ {rates.eur.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Grid de Impacto Cambial */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Globe className="h-48 w-48 text-emerald-500" /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" /> Variação Cambial Acumulada
            </div>
            <h2 className="text-4xl font-black leading-tight">Seu patrimônio importado {exchangeImpact >= 0 ? 'valorizou' : 'oscilou'} <span className={exchangeImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {Math.abs(exchangeImpact).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">Como seus bens eletrônicos são indexados ao mercado global, a alta do dólar aumenta o seu custo de reposição imediata.</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center space-y-8 overflow-hidden relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Calculator className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Exposição Internacional</CardTitle>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Capital em Hard-Assets</p><p className="text-3xl font-black text-slate-900 dark:text-white">R$ {importedValue.toLocaleString('pt-BR')}</p></div>
              <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">Percentual do Cofre</p><p className="text-2xl font-black text-blue-600">{((importedValue / (data.reduce((acc, curr) => acc + Number(curr.price || 1), 0))) * 100).toFixed(1)}%</p></div>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(importedValue / (data.reduce((acc, curr) => acc + Number(curr.price || 1), 0))) * 100}%` }} transition={{ duration: 1.5 }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="p-10 glass rounded-[40px] bg-emerald-600 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><Sparkles className="h-48 w-48 text-white" /></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-xl text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Inteligência Pro</h3>
            <p className="text-emerald-50 text-sm font-medium leading-relaxed max-w-lg">O Guardião atualiza as cotações a cada 30 segundos para garantir que seu Dossiê de Sinistro reflita o valor real de mercado.</p>
          </div>
        </div>
        <Button variant="ghost" className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest px-8 h-14 rounded-2xl shadow-lg border-none relative z-10">Ver Cotações Detalhadas</Button>
      </div>
    </div>
  );
}
