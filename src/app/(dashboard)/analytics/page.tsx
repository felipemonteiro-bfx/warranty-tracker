'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy, Zap, Timer, Flame, Globe, Repeat, Plus, Trash2, FileBadge, ReceiptText, Building2, Briefcase } from 'lucide-react';
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

  // Lógica Business: Depreciação Contábil Linear (Receita Federal)
  const getAccountingValue = (item: any) => {
    const price = Number(item.price || 0);
    const purchaseDate = new Date(item.purchase_date);
    const monthsOwned = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Regra: Eletrônicos depreciam 20% ao ano (1.66% ao mês). Outros 10% ao ano (0.83% ao mês).
    const isTech = item.category?.toLowerCase().includes('eletr') || item.category?.toLowerCase().includes('comput');
    const monthlyRate = isTech ? 0.0166 : 0.0083;
    
    const totalDepreciation = monthsOwned * monthlyRate * price;
    const residualValue = Math.max(price * 0.1, price - totalDepreciation); // Valor residual mínimo de 10%
    
    return { residualValue, totalDepreciation };
  };

  const businessMetrics = data.reduce((acc, curr) => {
    const { residualValue, totalDepreciation } = getAccountingValue(curr);
    acc.totalBookValue += residualValue;
    acc.accumulatedDepreciation += totalDepreciation;
    return acc;
  }, { totalBookValue: 0, accumulatedDepreciation: 0 });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  const isBusiness = profile?.profile_type === 'business';

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            {isBusiness ? 'Business' : 'Private'} <span className="text-emerald-600">Intelligence</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {isBusiness ? `Gestão de Ativos Imobilizados: ${profile.company_name}` : 'Governança patrimonial e financeira.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isBusiness && (
            <Button variant="outline" className="gap-2 border-blue-100 text-blue-700 font-black text-[10px] uppercase h-12 px-6 shadow-sm">
              <Briefcase className="h-4 w-4" /> Relatório Contábil
            </Button>
          )}
          <Button className="gap-2 bg-slate-900 text-white font-black text-[10px] uppercase h-12 px-8 shadow-2xl shadow-emerald-500/20">
            <FileStack className="h-4 w-4 text-emerald-400" /> Master Wealth Report
          </Button>
        </div>
      </header>

      {/* Grid de Ativos Business vs Pessoal */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Valor {isBusiness ? 'Contábil' : 'de Aquisição'}</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            R$ {(isBusiness ? businessMetrics.totalBookValue : data.reduce((acc, curr) => acc + Number(curr.price || 0), 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Capital Auditado</p>
        </Card>

        <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
            {isBusiness ? <Building2 className="h-32 w-32 text-blue-500" /> : <TrendingUp className="h-32 w-32 text-emerald-500" />}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">{isBusiness ? 'Depreciação Acumulada' : 'Volume Gerido'}</p>
          <div className="text-4xl font-black text-white tracking-tighter">
            R$ {(isBusiness ? businessMetrics.accumulatedDepreciation : data.length).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase mt-4 italic">{isBusiness ? 'Cálculo de Amortização Mensal' : `${data.length} ativos em custódia`}</p>
        </Card>

        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Eficiência de Ativos</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">8.4<span className="text-xl text-slate-300">/10</span></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Saúde técnica acima da média</p>
        </Card>
      </div>

      {isBusiness && (
        <Card className="border-none shadow-2xl bg-blue-600 text-white p-12 relative overflow-hidden group rounded-[48px]">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><Briefcase className="h-64 w-64 text-white" /></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-2 text-blue-100 font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> Inteligência Corporativa
              </div>
              <h2 className="text-4xl font-black leading-tight max-w-xl uppercase tracking-tighter">Seu balanço de <span className="text-white underline decoration-blue-400 underline-offset-8">Imobilizados</span> está em dia.</h2>
              <p className="text-blue-50 text-lg font-medium leading-relaxed max-w-2xl">O Guardião aplica automaticamente as taxas de depreciação da Receita Federal. Exporte o relatório mensal e envie direto para o seu contador.</p>
            </div>
            <Button variant="ghost" className="h-16 px-12 bg-white text-blue-700 hover:bg-blue-50 font-black uppercase text-xs tracking-widest shadow-2xl shrink-0 rounded-2xl gap-3 border-none">
              <Download className="h-5 w-5" /> Exportar Balanço Mensal
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><Landmark className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Composição de Portfólio</CardTitle>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={Array.from(new Set(data.map(i => i.folder))).map(cat => ({ 
                    name: cat, 
                    value: data.filter(i => i.folder === cat).reduce((acc, curr) => acc + Number(curr.price || 0), 0) 
                  }))} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {[1,2,3,4,5].map((_, index) => (<Cell key={index} fill={['#059669', '#0891b2', '#0ea5e9', '#6366f1', '#8b5cf6'][index % 5]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-slate-900 text-white border-none p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter">Otimize o seu <span className="text-emerald-400">Fluxo de Caixa.</span></h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Saber o valor residual contábil dos seus equipamentos permite planejar a hora exata da renovação tecnológica sem perdas financeiras.</p>
            <div className="pt-6 border-t border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
              <div><p className="text-[10px] font-black uppercase text-emerald-400">Governança Business</p><p className="text-xs font-bold text-white">Status: Compliance Total</p></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}