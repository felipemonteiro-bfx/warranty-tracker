'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy, Zap, Timer, Flame, Globe, Repeat, Plus, Trash2, FileBadge, ReceiptText, ChartCandlestick } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ComposedChart
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/lib/utils/date-utils';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [rates, setRates] = useState({ usd: 5.12, history: [] });
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
    fetchRatesHistory();
  }, []);

  const fetchRatesHistory = async () => {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/15');
      const json = await res.json();
      const history = json.map((day: any) => ({
        date: new Date(day.timestamp * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        usd: parseFloat(day.bid),
        assetFactor: parseFloat(day.bid) * 1.2 // Simulação de impacto no valor de reposição
      })).reverse();
      
      setRates({ usd: parseFloat(json[0].bid), history });
    } catch (err) { console.error("Erro ao buscar histórico de câmbio"); }
  };

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: items } = await supabase.from('warranties').select('*');
      if (items) setData(items);
    }
    setLoading(false);
  };

  const importedValue = data.filter(i => i.category?.toLowerCase().includes('eletr') || i.category?.toLowerCase().includes('foto'))
    .reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Market <span className="text-emerald-600">Intelligence</span></h1>
          <p className="text-slate-500 font-medium text-sm">Análise macroeconômica e impacto cambial no patrimônio.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
          <Globe className="h-4 w-4 text-emerald-400" /> Dólar Real-time: R$ {rates.usd.toFixed(2)}
        </div>
      </header>

      {/* Gráfico Híbrido: Câmbio vs Valor de Reposição */}
      <Card className="border-none shadow-2xl p-10 space-y-8 bg-white dark:bg-slate-900 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><ChartCandlestick className="h-48 w-48 text-emerald-500 rotate-12" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <CardTitle className="text-xl uppercase tracking-tighter">Correlação Cambial</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto da flutuação do dólar no custo de reposição dos seus bens (Últimos 15 dias)</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rates.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                />
                <Area type="monotone" dataKey="assetFactor" fill="#10b981" fillOpacity={0.05} stroke="none" />
                <Line type="monotone" dataKey="usd" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl bg-slate-900 text-white p-10 flex flex-col justify-center space-y-6 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700"><ShieldCheck className="h-48 w-48 text-emerald-500" /></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest"><Zap className="h-4 w-4" /> Global Asset Monitor</div>
            <h2 className="text-3xl font-black leading-tight uppercase tracking-tighter">Sua exposição ao Dólar é de <span className="text-emerald-400">{((importedValue / (data.reduce((acc, curr) => acc + Number(curr.price || 1), 0))) * 100).toFixed(1)}%</span></h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Isso significa que grande parte do seu patrimônio está "dolarizada". Uma alta na moeda valoriza o seu preço de revenda, mas encarece o seu seguro residencial.</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Landmark className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Valor de Reposição Global</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {(importedValue * (rates.usd / 5.0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo para comprar tudo novo hoje</p>
          </div>
          <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-[9px] font-black text-emerald-600 uppercase">Dados atualizados há 1 min</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
