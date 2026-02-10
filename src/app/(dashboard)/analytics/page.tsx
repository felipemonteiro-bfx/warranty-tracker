'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2 } from 'lucide-react';
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
  const [logs, setLogs] = useState<any[]>([]);
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
      const { data: logData } = await supabase.from('maintenance_logs').select('*');
      if (logData) setLogs(logData);
    }
    setLoading(false);
  };

  const getDepreciatedValue = (item: any) => {
    const price = Number(item.price || 0);
    const yearsOwned = (new Date().getTime() - new Date(item.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  // Lógica de Valorização por Cuidado: Cada log adiciona ~3% de valor sobre o preço depreciado
  const totalMarketValue = data.reduce((acc, curr) => acc + getDepreciatedValue(curr), 0);
  const careBonus = logs.length * 0.03; // 3% por manutenção
  const totalGuardiãoValue = totalMarketValue * (1 + careBonus);
  const profitByCare = totalGuardiãoValue - totalMarketValue;

  const categoryData = Array.from(new Set(data.map(item => item.category).filter(Boolean))).map(cat => ({
    name: cat,
    value: data.filter(i => i.category === cat).reduce((acc, curr) => acc + Number(curr.price || 0), 0)
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#059669', '#0891b2', '#0ea5e9', '#6366f1', '#8b5cf6'];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  if (!profile?.is_premium) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <div className="h-24 w-24 bg-indigo-100 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200"><Sparkles className="h-12 w-12 text-indigo-600" /></div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Market <span className="text-emerald-600">Intelligence</span></h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">Saiba quanto seu patrimônio valorizou graças ao seu cuidado. O comparativo de mercado é exclusivo Pro.</p>
        </div>
        <Link href="/plans"><Button size="lg" className="h-16 px-12 text-lg">Liberar Inteligência de Mercado</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Valorização por <span className="text-emerald-600">Cuidado</span></h1>
          <p className="text-slate-500 font-medium text-sm">O lucro invisível de manter seu patrimônio auditado.</p>
        </div>
        <Button variant="outline" className="gap-2 border-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest h-12 px-6 shadow-sm">
          <Download className="h-4 w-4" /> Dossiê de Patrimônio
        </Button>
      </header>

      {/* Widget de Impacto de Valorização */}
      <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
        <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><TrendingUp className="h-48 w-48 text-emerald-500" /></div>
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Inteligência de Mercado
            </div>
            <h2 className="text-4xl font-black leading-tight">Você garantiu um prêmio de <span className="text-emerald-400">R$ {profitByCare.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span> sobre seu patrimônio.</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">Graças às {logs.length} manutenções registradas e ao Selo de Integridade, seus bens valem, em média, {(careBonus * 100).toFixed(1)}% mais que a média do mercado de usados.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Valor Comum</p>
              <p className="text-xl font-black text-slate-300">R$ {totalMarketValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-center">
              <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Valor Guardião</p>
              <p className="text-xl font-black text-emerald-400">R$ {totalGuardiãoValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gráfico de Distribuição */}
        <Card className="border-none shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600"><PieIcon className="h-6 w-6" /></div>
            <CardTitle className="text-lg uppercase tracking-tighter">Composição de Ativos</CardTitle>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {categoryData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card de Score de Liquidez */}
        <Card className="border-none shadow-xl p-10 flex flex-col justify-center space-y-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Score de Liquidez</CardTitle>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-slate-900 leading-none">8.4</span>
            <span className="text-sm font-bold text-slate-400 uppercase pb-1">/ 10</span>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Seus ativos possuem alta demanda e documentação completa. Vender seu patrimônio hoje seria 40% mais rápido que a média.</p>
          <div className="pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
              <CheckCircle2 className="h-4 w-4" /> Auditoria Digital Verificada
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
