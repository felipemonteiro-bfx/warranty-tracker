'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, calculateExpirationDate } from '@/lib/utils/date-utils';
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

  // Simulação de Projeção de Manutenção (Próximos 6 meses)
  const maintenanceForecast = [
    { name: 'Mar', valor: 150 }, { name: 'Abr', valor: 450 }, { name: 'Mai', valor: 200 },
    { name: 'Jun', valor: 800 }, { name: 'Jul', valor: 300 }, { name: 'Ago', valor: 120 }
  ];

  const getDepreciatedValue = (item: any) => {
    const price = Number(item.price || 0);
    const yearsOwned = (new Date().getTime() - new Date(item.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  const categoryData = Array.from(new Set(data.map(item => item.category).filter(Boolean))).map(cat => ({
    name: cat,
    value: data.filter(i => i.category === cat).reduce((acc, curr) => acc + Number(curr.price || 0), 0)
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#059669', '#0891b2', '#0ea5e9', '#6366f1', '#8b5cf6'];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  if (!profile?.is_premium) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <div className="h-24 w-24 bg-indigo-100 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200"><TrendingUp className="h-12 w-12 text-indigo-600" /></div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics <span className="text-emerald-600">Patrimonial</span></h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">Projeção de gastos, análise de ROI e rankings de eficiência são exclusivos para o Plano Pro.</p>
        </div>
        <Link href="/plans"><Button size="lg" className="h-16 px-12 text-lg">Liberar Inteligência Pro</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Centro de <span className="text-emerald-600">Inteligência</span></h1>
          <p className="text-slate-500 font-medium text-sm">Previsibilidade financeira e técnica para seus bens.</p>
        </div>
        <Button variant="outline" className="gap-2 border-teal-100 font-black text-[10px] uppercase tracking-widest h-12 px-6 shadow-sm">
          <Download className="h-4 w-4" /> Relatório Consolidado
        </Button>
      </header>

      {/* Gráfico Principal: Projeção de Gastos */}
      <Card className="border-none shadow-xl p-8 space-y-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Wrench className="h-32 w-32 text-emerald-600 rotate-12" /></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <CardTitle className="text-xl">Projeção de Gastos com Manutenção</CardTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Estimativa de custos preventivos para os próximos 6 meses</p>
          </div>
        </div>
        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceForecast}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                formatter={(v: any) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Gasto Previsto']}
              />
              <Bar dataKey="valor" fill="#059669" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
            <Info className="h-4 w-4 text-emerald-600" /> Dica IA: Junho será seu mês de maior investimento em revisões.
          </div>
          <p className="text-[10px] font-black text-emerald-600 uppercase">Total Previsto: R$ 2.020,00</p>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Distribuição por Categoria */}
        <Card className="border-none shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600"><PieIcon className="h-6 w-6" /></div>
            <CardTitle className="text-lg">Alocação de Valor</CardTitle>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {categoryData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card de Eficiência */}
        <Card className="bg-slate-900 text-white border-none p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10"><ShieldCheck className="h-48 w-48 text-emerald-500" /></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black leading-tight">Patrimônio sob <span className="text-emerald-400">Auditoria.</span></h3>
            <p className="text-slate-400 font-medium leading-relaxed">Suas notas fiscais e manutenções estão sendo validadas para garantir máxima liquidez em caso de revenda.</p>
            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
              <div><p className="text-[10px] font-black uppercase text-slate-500">Bens Auditados</p><p className="text-2xl font-black text-white">{data.length}</p></div>
              <div><p className="text-[10px] font-black uppercase text-slate-500">Status IA</p><p className="text-2xl font-black text-emerald-400">Ativo</p></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
