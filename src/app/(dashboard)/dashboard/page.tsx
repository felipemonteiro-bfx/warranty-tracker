'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2, ListChecks, ArrowRight, ShieldAlert } from 'lucide-react';
import { calculateExpirationDate, getDaysRemaining, formatDate } from '@/lib/utils/date-utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function DashboardPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredWarranties(warranties.filter(w => w.name.toLowerCase().includes(query) || (w.category && w.category.toLowerCase().includes(query))));
    } else {
      setFilteredWarranties(warranties);
    }
  }, [searchQuery, warranties]);

  // Lógica do Concierge: Gerar lista de ações pendentes
  const getPendingActions = () => {
    const actions = [];
    
    // 1. Garantias vencendo em 30 dias
    const expiring = warranties.filter(w => {
      const days = getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months));
      return days >= 0 && days <= 30;
    });
    expiring.forEach(w => actions.push({ id: `exp-${w.id}`, title: 'Garantia expirando', item: w.name, type: 'critical', link: `/products/${w.id}` }));

    // 2. Itens sem número de série (Segurança Baixa)
    const noSerial = warranties.filter(w => !w.serial_number);
    noSerial.slice(0, 2).forEach(w => actions.push({ id: `sn-${w.id}`, title: 'Falta Nº de Série', item: w.name, type: 'info', link: `/products/edit/${w.id}` }));

    // 3. Seguros vencendo
    const insuranceExp = warranties.filter(w => w.insurance_expires_at && getDaysRemaining(w.insurance_expires_at) <= 15);
    insuranceExp.forEach(w => actions.push({ id: `ins-${w.id}`, title: 'Renovar Seguro', item: w.name, type: 'warning', link: `/insurance/simulator/${w.id}` }));

    return actions;
  };

  const pendingActions = getPendingActions();
  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const expiredCount = warranties.filter(w => getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months)) < 0).length;
  const safetyScore = warranties.length > 0 ? Math.round(((warranties.length - expiredCount) / warranties.length) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Seu patrimônio está {safetyScore}% protegido hoje.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lado Esquerdo: Resumo Financeiro */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-500/10 skew-x-12 translate-x-10" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path className="text-slate-700" strokeDasharray="100, 100" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray={`${safetyScore}, 100`} strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{safetyScore}</span>
                  <span className="text-[8px] font-black uppercase text-emerald-400">Score</span>
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Patrimônio em Custódia</h3>
                <div className="text-4xl font-black">R$ {totalOriginalValue.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">Valor total documentado e protegido sob sua titularidade.</p>
              </div>
            </div>
          </Card>

          {/* NOVO: Concierge de Ações (To-do List inteligente) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Próximas Ações do Guardião</h3>
            </div>
            <div className="grid gap-4">
              {pendingActions.length === 0 ? (
                <div className="p-8 rounded-[32px] bg-emerald-50/50 border border-emerald-100 text-center">
                  <p className="text-sm font-bold text-emerald-700">Tudo em dia! Seu patrimônio está 100% monitorado e seguro.</p>
                </div>
              ) : (
                pendingActions.map(action => (
                  <motion.div key={action.id} whileHover={{ x: 10 }} className="flex items-center justify-between p-5 bg-white border border-teal-50 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${action.type === 'critical' ? 'bg-red-50 text-red-500' : action.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {action.type === 'critical' ? <ShieldAlert className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{action.title}</p>
                        <p className="text-sm font-black text-slate-900 uppercase">{action.item}</p>
                      </div>
                    </div>
                    <Link href={action.link}>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full text-slate-300 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar de Insights Rápidos */}
        <div className="space-y-6">
          <Card className="border-teal-50 bg-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-[-10px] top-[-10px] opacity-5"><TrendingUp className="h-32 w-32 text-emerald-600" /></div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" /> Insight IA</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {pendingActions.length > 0 
                  ? `Resolva as ${pendingActions.length} pendências ao lado para aumentar seu Score de Proteção para 100%.` 
                  : "Parabéns! Sua gestão patrimonial está no nível Pro."}
              </p>
              <Button variant="outline" className="w-full h-12 text-[10px] uppercase font-black tracking-widest border-teal-100 text-emerald-700">Ver Relatório Completo</Button>
            </div>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20 space-y-4">
            <Trophy className="h-10 w-10 text-white opacity-30" />
            <h4 className="text-xl font-black leading-tight">Membro Premium</h4>
            <p className="text-xs font-medium text-emerald-100 leading-relaxed">Você tem acesso a auditorias ilimitadas, dossiês jurídicos e monitoramento global de ativos.</p>
          </div>
        </div>
      </div>

      {/* Grid Principal de Cards */}
      <div className="pt-10 border-t border-teal-50">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Seus Ativos Cadastrados</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Filtrar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-white border border-teal-50 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-medium" />
          </div>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}