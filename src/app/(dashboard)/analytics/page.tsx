'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack, ClipboardCheck, Copy } from 'lucide-react';
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
  const [showIRPF, setShowIRPF] = useState(false);
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

  const generateIRPFText = () => {
    return data.map(item => (
      `${item.name.toUpperCase()} - Adquirido em ${formatDate(item.purchase_date)} pelo valor de R$ ${Number(item.price).toLocaleString('pt-BR')}${item.store ? ` na loja ${item.store}` : ''}. Chave NF-e: ${item.nfe_key || 'Não informada'}. Bem auditado via Guardião de Notas.`
    )).join('\n\n');
  };

  const totalAssetsValue = data.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalDebt = data.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
  const netWorth = totalAssetsValue - totalDebt;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Private <span className="text-emerald-600">Wealth</span></h1>
          <p className="text-slate-500 font-medium text-sm">Governança patrimonial e obrigações fiscais.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowIRPF(true)} className="gap-2 border-emerald-100 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 shadow-2xl shadow-emerald-500/20">
            <ClipboardCheck className="h-4 w-4 text-emerald-400" /> Declaração IRPF
          </Button>
        </div>
      </header>

      {/* Modal de IRPF */}
      <AnimatePresence>
        {showIRPF && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-2xl w-full text-left space-y-6 shadow-2xl relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl text-emerald-600"><Landmark className="h-5 w-5" /></div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Dados para Bens e Direitos</h3>
                </div>
                <button onClick={() => setShowIRPF(false)} className="p-2 bg-slate-50 dark:bg-white/5 rounded-full"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <p className="text-sm text-slate-500 font-medium">Copie os textos abaixo e cole no campo "Discriminação" do seu IRPF 2026.</p>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5 max-h-[350px] overflow-y-auto no-scrollbar font-mono text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {generateIRPFText()}
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => { navigator.clipboard.writeText(generateIRPFText()); toast.success('Relatório copiado!'); }}
                  className="flex-1 h-14 gap-2 font-black uppercase text-xs tracking-widest"
                >
                  <Copy className="h-4 w-4" /> Copiar Tudo
                </Button>
                <Button variant="outline" onClick={() => setShowIRPF(false)} className="flex-1 h-14 font-black uppercase text-xs tracking-widest border-slate-200 dark:border-white/10">Fechar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Patrimônio Líquido</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {netWorth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Capital Auditado</p>
        </Card>

        <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><TrendingUp className="h-32 w-32" /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Volume Gerido</p>
          <div className="text-4xl font-black text-white tracking-tighter">R$ {totalAssetsValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase mt-4 italic">Total de {data.length} ativos em custódia</p>
        </Card>

        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Dívida Patrimonial</p>
          <div className="text-5xl font-black text-red-500 tracking-tighter">R$ {totalDebt.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Parcelas a vencer de ativos</p>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><Landmark className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Alocação de Valor</CardTitle>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Quitado', valor: netWorth, fill: '#059669' },
                { name: 'Dívida', valor: totalDebt, fill: '#ef4444' }
              ]}>
                <XAxis dataKey="name" fontSize={10} fontVariant="black" axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-slate-900 text-white border-none p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter">Sua liberdade é o seu <span className="text-emerald-400">Patrimônio.</span></h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Cada item documentado no Guardião de Notas compõe seu rastro de riqueza e segurança jurídica.</p>
            <div className="pt-6 border-t border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
              <div><p className="text-[10px] font-black uppercase text-emerald-400">Status Fiscal</p><p className="text-xs font-bold text-white">Relatórios em dia</p></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
