'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, ShieldAlert, ScanSearch, Loader2, RefreshCcw, Truck } from 'lucide-react';
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
    if (warranties) setFilteredWarranties(warranties);
  }, [warranties]);

  const exportMovingInventory = () => {
    if (!profile?.is_premium) {
      toast.error('Inventário de Mudança é um recurso Pro!');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(15, 23, 42); doc.text('Inventário Geral de Bens - Guia de Mudança', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text('Documento de controle de bens e valor para logística e transporte.', 14, 28);
    
    const tableData = warranties.map(w => [
      w.name,
      w.category || 'Geral',
      `R$ ${Number(w.price || 0).toLocaleString('pt-BR')}`,
      ' ( ) EMBALADO  ( ) CARREGADO'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item', 'Categoria', 'Valor Estimado', 'Checklist Logístico']],
      body: tableData,
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`checklist-mudanca-guardiao.pdf`);
    toast.success('Checklist de Mudança gerado com sucesso!');
  };

  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalWarranties = warranties.length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Controle total do seu patrimônio imobilizado.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportMovingInventory} className="gap-2 border-slate-200 text-slate-600 font-bold shadow-sm">
            <Truck className="h-4 w-4" /> Checklist Mudança
          </Button>
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* Stats Principais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Package className="h-4 w-4 text-emerald-600" /> Itens Totais</p>
          <div className="text-4xl font-black text-slate-900">{totalWarranties}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Bens catalogados</p>
        </Card>
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Patrimônio Declarado</p><div className="text-4xl font-black text-slate-900">R$ {totalOriginalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div><p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Soma de todas as notas</p></Card>
        <Card className="border-teal-100 bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden"><div className="relative z-10"><p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Score de Proteção</p><div className="text-4xl font-black">100%</div><p className="text-[10px] text-emerald-100 font-bold uppercase mt-2">Segurança máxima ativa</p></div></Card>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
