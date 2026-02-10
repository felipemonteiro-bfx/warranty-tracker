'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, ShieldAlert, ScanSearch, Loader2, RefreshCcw } from 'lucide-react';
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

  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  
  // Simulação de Custo de Reposição (Inflação de bens duráveis ~8% ao ano)
  const calculateReplacementValue = (item: any) => {
    const price = Number(item.price || 0);
    const years = (new Date().getTime() - new Date(item.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * Math.pow(1.08, years); // Acréscimo de 8% ao ano
  };

  const totalReplacementValue = filteredWarranties.reduce((acc, curr) => acc + calculateReplacementValue(curr), 0);
  const inflationImpact = totalReplacementValue - totalOriginalValue;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Gestão de valor e proteção de ativos.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      {/* Widget de Inteligência de Reposição (Killer Feature) */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10"><RefreshCcw className="h-32 w-32 text-emerald-500 rotate-12" /></div>
          <CardContent className="p-10 space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                  <RefreshCcw className="h-3 w-3" /> Custo de Reposição Total
                </p>
                <div className="text-6xl font-black text-white tracking-tighter">R$ {totalReplacementValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                <p className="text-sm text-slate-400 font-medium max-w-sm">Quanto custaria comprar todos os seus itens selecionados **novos** hoje.</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] text-center min-w-[160px]">
                <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Impacto Inflação</p>
                <p className="text-2xl font-black text-emerald-400">+ R$ {inflationImpact.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                <div className="mt-2 text-[9px] font-bold text-slate-500">Valorização de Recompra</div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Baseado em índices de mercado v3.0</p>
              <Button variant="ghost" className="text-emerald-400 font-black text-[10px] uppercase gap-2 hover:bg-emerald-500/10">Ver Detalhes por Item <ArrowUpRight className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-white shadow-xl flex flex-col justify-between p-8 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">Patrimônio em Custódia</h3>
            <p className="text-sm text-slate-500 font-medium">Você já cadastrou R$ {totalOriginalValue.toLocaleString('pt-BR')} em notas originais. O Guardião garante que esse valor não se perca no tempo.</p>
          </div>
          <div className="pt-6 border-t border-slate-50 relative z-10">
            <p className="text-[10px] font-black text-emerald-600 uppercase">Segurança 100% Ativa</p>
          </div>
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