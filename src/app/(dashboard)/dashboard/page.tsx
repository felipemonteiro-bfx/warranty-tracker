'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, Umbrella, FlameKindling } from 'lucide-react';
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const totalOriginalValue = warranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalDebt = warranties.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
  const netWorth = totalOriginalValue - totalDebt;
  
  // Cálculo de Risco: Custo de reposição total hoje (inflação estimada de 15% nos eletrônicos)
  const totalReplacementRisk = totalOriginalValue * 1.15;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
            {profile?.is_premium ? <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-200 shadow-sm">Membro Pro</span> : <Link href="/plans" className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-200 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Upgrade para Pro</Link>}
          </div>
          <p className="text-slate-500 font-medium text-sm">Seu patrimônio sob custódia do Guardião.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      {/* NOVO: Widget de Risco Financeiro (Custo de Perda Total) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-[40px] p-1 shadow-2xl shadow-red-500/20">
          <div className="bg-slate-900 rounded-[38px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] opacity-10"><FlameKindling className="h-48 w-48 text-white rotate-12" /></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-16 w-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20"><AlertCircle className="h-8 w-8 text-white animate-pulse" /></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Exposição ao Risco</p>
                <h3 className="text-3xl font-black text-white leading-tight">
                  Seu custo de reposição hoje é <span className="text-red-500">R$ {totalReplacementRisk.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </h3>
                <p className="text-slate-400 text-sm font-medium">Em caso de perda total, este é o valor necessário para recomprar todos os seus bens novos.</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10 shrink-0">
              <Link href="/plans"><Button variant="ghost" className="text-white hover:bg-white/10 font-bold border border-white/10 px-8 h-14 rounded-2xl uppercase text-[10px] tracking-widest">Ver Coberturas</Button></Link>
              <Button className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 h-14 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 gap-2">
                <Umbrella className="h-4 w-4" /> Simular Seguro
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Widgets Financeiros */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2"><Landmark className="h-4 w-4 text-emerald-600" /> Patrimônio Líquido</p>
          <div className="text-4xl font-black text-slate-900">R$ {netWorth.toLocaleString('pt-BR')}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Valor acumulado quitado</p>
        </Card>
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Dívida Patrimonial</p><div className="text-4xl font-black text-red-500">R$ {totalDebt.toLocaleString('pt-BR')}</div><p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Parcelas a vencer</p></Card>
        <Card className="border-teal-100 bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left relative overflow-hidden"><div className="relative z-10"><p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2"><ShieldCheck className="h-4 w-4" /> Score de Proteção</p><div className="text-4xl font-black">100%</div><p className="text-[10px] text-emerald-100 font-bold uppercase mt-2">Segurança máxima ativa</p></div></Card>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}