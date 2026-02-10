'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, Umbrella } from 'lucide-react';
import { calculateExpirationDate, getDaysRemaining, formatDate } from '@/lib/utils/date-utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DashboardPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: user.user_metadata?.full_name, is_premium: false });
      const { data: warrantyData } = await supabase.from('warranties').select('*').order('created_at', { ascending: false });
      if (warrantyData) {
        setWarranties(warrantyData);
        setFilteredWarranties(warrantyData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    let result = warranties;
    if (selectedCategory !== 'all') result = result.filter(w => w.category === selectedCategory);
    if (selectedFolder !== 'all') result = result.filter(w => w.folder === selectedFolder);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w => w.name.toLowerCase().includes(query) || (w.category && w.category.toLowerCase().includes(query)));
    }
    setFilteredWarranties(result);
  }, [selectedCategory, selectedFolder, searchQuery, warranties]);

  const exportInsuranceInventory = () => {
    if (!profile?.is_premium) {
      toast.error('O Relatório de Inventário para Seguros é exclusivo para membros Pro!');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(8, 145, 178); // Cyan 600
    doc.text('Inventário Patrimonial para Fins de Seguro', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Proprietário: ${profile?.full_name || 'Usuário'}`, 14, 30);
    doc.text(`Pasta: ${selectedFolder === 'all' ? 'Todos os Ativos' : selectedFolder}`, 14, 35);
    
    const tableData = filteredWarranties.map(w => [
      w.name,
      w.category || 'Geral',
      w.store || '---',
      `R$ ${Number(w.price || 0).toLocaleString('pt-BR')}`,
      w.nfe_key ? 'SIM' : 'NÃO'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Item', 'Categoria', 'Loja', 'Valor de Nota', 'Chave NF-e']],
      body: tableData,
      headStyles: { fillColor: [8, 145, 178] }
    });

    doc.save(`inventario-seguro-${selectedFolder}.pdf`);
    toast.success('Relatório de Inventário gerado!');
  };

  const totalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalDebt = filteredWarranties.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
  const netWorth = totalValue - totalDebt;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Patrimônio Líquido sob custódia: <span className="text-slate-900 font-black">R$ {netWorth.toLocaleString('pt-BR')}</span>.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportInsuranceInventory} className="gap-2 border-cyan-100 text-cyan-700 font-bold shadow-sm">
            <Umbrella className="h-4 w-4" /> Relatório para Seguros
          </Button>
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* Widget de Patrimonio e Dividendos de Segurança */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-slate-900 text-white border-none overflow-hidden relative shadow-2xl">
          <CardContent className="p-8 space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Landmark className="h-3 w-3 text-emerald-500" /> Balanço Patrimonial</p>
                <div className="text-5xl font-black text-white">R$ {netWorth.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-slate-400 font-medium">Patrimônio Líquido (Ativos menos Dívidas)</p>
              </div>
              <div className="h-24 w-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={[{ value: netWorth }, { value: totalDebt }]} innerRadius={30} outerRadius={40} dataKey="value"><Cell fill="#059669" /><Cell fill="#334155" /></Pie></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500"><CheckCircle2 className="h-4 w-4" /></div>
                <div><p className="text-[9px] font-black uppercase text-slate-500">Quitado</p><p className="text-sm font-bold">R$ {netWorth.toLocaleString('pt-BR')}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400"><CreditCard className="h-4 w-4" /></div>
                <div><p className="text-[9px] font-black uppercase text-slate-500">Dívida</p><p className="text-sm font-bold">R$ {totalDebt.toLocaleString('pt-BR')}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-white shadow-xl flex flex-col justify-between p-8">
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600"><Sparkles className="h-6 w-6" /></div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">Insight do Guardião</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Você está {Math.round((netWorth / (totalValue || 1)) * 100)}% mais perto da quitação total dos seus bens duráveis.</p>
          </div>
          <Link href="/analytics"><Button variant="ghost" className="w-full text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-6">Ver Análise Completa</Button></Link>
        </Card>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}