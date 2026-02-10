'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2, SendHorizonal, DownloadCloud, Fingerprint, Cloud, ListChecks, ArrowRight, ShieldAlert, Calendar, Target, Pencil } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [goal, setGoal] = useState(100000); // Meta Padrão: 100k
  const [isEditingGoal, setIsEditingGoal] = useState(false);
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
      if (warrantyData) setWarranties(warrantyData);
    }
    setLoading(false);
  };

  const totalOriginalValue = warranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const progressPercent = Math.min(Math.round((totalOriginalValue / goal) * 100), 100);

  const handleUpdateGoal = () => {
    setIsEditingGoal(false);
    toast.success('Sua nova meta patrimonial foi salva!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Seu patrimônio sob custódia digital.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 dark:shadow-none font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Widget de Meta Patrimonial (Psicologia de Conquista) */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Target className="h-32 w-32 text-emerald-600" /></div>
          <CardContent className="p-10 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest"><Target className="h-4 w-4" /> Meta de Patrimônio</div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">Você conquistou <span className="text-emerald-600">{progressPercent}%</span> da sua meta.</h2>
                <p className="text-sm text-slate-400 font-medium max-w-sm">Cadastre novos ativos para visualizar seu progresso real de independência patrimonial.</p>
              </div>
              <div className="shrink-0 space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Patrimônio Objetivo</p>
                {isEditingGoal ? (
                  <div className="flex items-center gap-2">
                    <input autoFocus type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-32 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-right font-black p-2" />
                    <Button onClick={handleUpdateGoal} size="sm" className="h-8 w-8 p-0 rounded-lg"><CheckCircle2 className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-end cursor-pointer group/goal" onClick={() => setIsEditingGoal(true)}>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {goal.toLocaleString('pt-BR')}</p>
                    <Pencil className="h-3 w-3 text-slate-300 opacity-0 group-hover/goal:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Progressão Atual</span><span>R$ {totalOriginalValue.toLocaleString('pt-BR')}</span></div>
              <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-1 border border-slate-50 dark:border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Global */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Trophy className="h-32 w-32" /></div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Score de Gestão</p>
            <div className="text-5xl font-black text-emerald-400 uppercase">Senior</div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 italic">Seu nível de organização está no topo 5% dos usuários.</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-500/20 space-y-4">
            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Sparkles className="h-6 w-6" /></div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Insights do Dia</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Você sabia? Manter o número de série registrado aumenta a velocidade de liquidação do bem em 40%.</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-10 border-t border-slate-100 dark:border-white/5">
          {warranties.map((w) => (<WarrantyCard key={w.id} warranty={w} />))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}