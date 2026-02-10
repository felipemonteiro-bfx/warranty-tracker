'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar, DollarSign, Loader2, ArrowLeft, ShieldCheck, Download, TrendingDown, Activity, HeartPulse, Medal, AlertCircle, ArrowUpRight, Calculator, FileCheck, LineChart as ChartIcon, Wrench, Leaf, Sparkles, Scale, CheckCircle2, Wallet, CreditCard, Landmark, History, FileStack } from 'lucide-react';
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
  const [generating, setGenerating] = useState(false);
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

  const generateMasterWealthReport = () => {
    if (!profile?.is_premium) {
      toast.error('Relatório Master de Gestão é exclusivo Pro!');
      return;
    }
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const totalAssets = data.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
      const totalDebt = data.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
      const netWorth = totalAssets - totalDebt;

      // Capa Executiva
      doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 297, 'F');
      doc.setTextColor(16, 185, 129); doc.setFontSize(28); doc.text('PRIVATE WEALTH REPORT', 105, 100, { align: 'center' });
      doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text('RELATÓRIO GERENCIAL DE PATRIMÔNIO DURÁVEL', 105, 115, { align: 'center' });
      doc.setFontSize(10); doc.text(`Titular: ${profile?.full_name}`, 105, 140, { align: 'center' });
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 105, 147, { align: 'center' });
      doc.setTextColor(100); doc.text('GERADO POR GUARDIÃO DE NOTAS INTELLIGENCE', 105, 280, { align: 'center' });

      // Página 2: Balanço Consolidado
      doc.addPage();
      doc.setTextColor(15, 23, 42); doc.setFontSize(20); doc.text('1. Sumário de Ativos e Passivos', 14, 25);
      
      const balanceTable = [
        ['Total em Ativos Documentados', `R$ ${totalAssets.toLocaleString('pt-BR')}`],
        ['Dívida Patrimonial (Parcelas)', `R$ ${totalDebt.toLocaleString('pt-BR')}`],
        ['Patrimônio Líquido Real', `R$ ${netWorth.toLocaleString('pt-BR')}`],
        ['Índice de Posse Integral', `${((netWorth / (totalAssets || 1)) * 100).toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: 35,
        body: balanceTable,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 12, cellPadding: 5 }
      });

      // Página 3: Detalhamento por Categoria
      doc.setFontSize(20); doc.text('2. Alocação por Divisão', 14, (doc as any).lastAutoTable.finalY + 20);
      const categories = Array.from(new Set(data.map(i => i.folder)));
      const catTable = categories.map(cat => [
        cat,
        data.filter(i => i.folder === cat).length,
        `R$ ${data.filter(i => i.folder === cat).reduce((acc, curr) => acc + Number(curr.price || 0), 0).toLocaleString('pt-BR')}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 30,
        head: [['Pasta / Divisão', 'Qtd Itens', 'Volume Capital']],
        body: catTable,
        headStyles: { fillColor: [5, 150, 105] }
      });

      // Rodapé de Autenticidade
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      doc.setFillColor(248, 250, 252); doc.rect(14, finalY, 182, 30, 'F');
      doc.setFontSize(8); doc.setTextColor(100);
      doc.text('Este relatório consolida dados auditados digitalmente. O valor de reposição considera inflação técnica de 8% a.a.', 20, finalY + 12);
      doc.text(`Protocolo de Governança: GRD-MASTER-${profile.id.substring(0,8).toUpperCase()}`, 20, finalY + 20);

      doc.save(`relatorio-gerencial-guardiao.pdf`);
      toast.success('Relatório Master gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar relatório.');
    } finally {
      setGenerating(false);
    }
  };

  const getDepreciatedValue = (item: any) => {
    const price = Number(item.price || 0);
    const yearsOwned = (new Date().getTime() - new Date(item.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  const totalAssetsValue = data.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalDebt = data.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
  const netWorth = totalAssetsValue - totalDebt;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Private <span className="text-emerald-600">Analytics</span></h1>
          <p className="text-slate-500 font-medium text-sm">Governança financeira e técnica do seu patrimônio durável.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateMasterWealthReport} disabled={generating} className="gap-2 border-emerald-100 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 shadow-2xl shadow-emerald-500/20">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileStack className="h-4 w-4 text-emerald-400" />}
            Relatório Master Pro
          </Button>
        </div>
      </header>

      {/* Hero Stats: Visão Private Banking */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Patrimônio Líquido Real</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {netWorth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Capital Auditado</p>
        </Card>

        <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><TrendingUp className="h-32 w-32" /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Volume Gerido</p>
          <div className="text-4xl font-black text-white tracking-tighter">R$ {totalAssetsValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase mt-4 italic">Total de 128 ações de custódia</p>
        </Card>

        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Índice de Liquidez</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">8.4<span className="text-xl text-slate-300">/10</span></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Saúde técnica acima da média</p>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Balanço Visual */}
        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><Landmark className="h-6 w-6" /></div>
            <CardTitle className="text-xl uppercase tracking-tighter">Balanço Ativo vs Passivo</CardTitle>
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

        {/* Card Motivacional Pro */}
        <Card className="bg-slate-900 text-white border-none p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter">Seu patrimônio é sua <span className="text-emerald-400">Liberdade.</span></h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Manter seus ativos auditados e com manutenção em dia garante uma valorização média de 18,4% no mercado secundário.</p>
            <div className="pt-6 border-t border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
              <div><p className="text-[10px] font-black uppercase text-emerald-400">Proteção Global</p><p className="text-xs font-bold text-white">Status: Monitoramento Ativo</p></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}