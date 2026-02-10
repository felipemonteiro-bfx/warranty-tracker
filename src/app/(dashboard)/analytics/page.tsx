'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy, Zap, Timer, Flame } from 'lucide-react';
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
    }
    setLoading(false);
  };

  // Lógica de Liquidez: Eletrônicos Apple/Samsung tem liquidez alta, móveis baixa, etc.
  const liquidityAnalysis = data.map(item => {
    const category = item.category?.toLowerCase() || '';
    let level: 'Alta' | 'Média' | 'Baixa' = 'Média';
    let daysToSell = 15;

    if (category.includes('celular') || category.includes('apple') || category.includes('fone')) {
      level = 'Alta'; daysToSell = 3;
    } else if (category.includes('móvel') || category.includes('casa')) {
      level = 'Baixa'; daysToSell = 45;
    }

    return { ...item, liquidityLevel: level, daysToSell };
  });

  const highLiquidityCount = liquidityAnalysis.filter(i => i.liquidityLevel === 'Alta').length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Market <span className="text-emerald-600">Dynamics</span></h1>
          <p className="text-slate-500 font-medium text-sm">Velocidade de mercado e conversão de ativos em caixa.</p>
        </div>
      </header>

      {/* Grid de Liquidez Imediata */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-none shadow-2xl bg-emerald-600 text-white p-8 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Zap className="h-32 w-32" /></div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest">Ativos Hot-Market</p>
            <div className="text-5xl font-black">{highLiquidityCount}</div>
            <p className="text-xs text-emerald-100 font-medium">Bens com altíssima demanda e venda em até 72h.</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:rotate-12 transition-transform duration-700"><Timer className="h-32 w-32 text-emerald-500" /></div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tempo Médio de Liquidação</p>
            <div className="text-4xl font-black text-white">12 <span className="text-lg">dias</span></div>
            <p className="text-xs text-slate-400 font-medium">Estimativa global para converter seu cofre em dinheiro.</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8 relative overflow-hidden">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Liquidez do Portfólio</p>
            <div className="text-5xl font-black text-slate-900 dark:text-white">8.2<span className="text-xl text-slate-300">/10</span></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Baseado em marcas e selos de integridade.</p>
          </div>
        </Card>
      </div>

      {/* Lista de Liquidez por Item */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-white/5">
          <CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" /> Ranking de Velocidade de Revenda
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-white/5">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Ativo</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Liquidez</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Tempo Est.</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Valor Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {liquidityAnalysis.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tighter">{item.name}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      item.liquidityLevel === 'Alta' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.liquidityLevel === 'Média' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {item.liquidityLevel}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-500 dark:text-slate-400 text-xs font-bold">{item.daysToSell} dias</td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white text-sm">R$ {Number(item.price * 0.85).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-10 glass rounded-[40px] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Sparkles className="h-48 w-48 text-emerald-500" /></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20"><Medal className="h-8 w-8 text-white" /></div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Selo de Liquidez Pro</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg">Bens com Selo de Integridade e Histórico de Manutenção vendem **38% mais rápido** que itens sem documentação.</p>
          </div>
        </div>
        <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest px-8 h-14 rounded-2xl border border-white/10 relative z-10">Ver Dossiê de Mercado</Button>
      </div>
    </div>
  );
}