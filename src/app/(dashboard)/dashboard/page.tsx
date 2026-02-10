'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, ShieldAlert, ScanSearch, Loader2, RefreshCcw, Leaf } from 'lucide-react';
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
  const totalSaved = warranties.reduce((acc, curr) => acc + (Number(curr.total_saved) || 0), 0);
  
  // Cálculo de Impacto Ambiental (Simulação: 1 conserto evita ~2kg de CO2 e 5kg de lixo eletrônico)
  const consertosRealizados = warranties.filter(w => Number(w.total_saved) > 0).length;
  const co2Avoided = consertosRealizados * 2.5; // kg
  const wasteAvoided = consertosRealizados * 5.2; // kg

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium">Gestão inteligente e sustentável de patrimônio.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      {/* Grid de Stats Financeiras e Ecológicas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Valor Protegido</p>
          <div className="text-4xl font-black text-slate-900">R$ {totalOriginalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Investimento Total</p>
        </Card>

        <Card className="border-teal-100 bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden shadow-emerald-500/20">
          <div className="absolute right-[-10px] top-[-10px] opacity-10"><HeartHandshake className="h-32 w-32 rotate-12" /></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Economia Total</p>
            <div className="text-4xl font-black">R$ {totalSaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[10px] text-emerald-100 font-bold uppercase mt-2">Dinheiro recuperado</p>
          </div>
        </Card>

        {/* NOVO: Widget Eco-Score */}
        <Card className="border-cyan-100 bg-cyan-900 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden shadow-cyan-500/20">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Leaf className="h-32 w-32 -rotate-12 text-cyan-400" /></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-2 flex items-center gap-2"><Leaf className="h-4 w-4" /> Eco-Impacto</p>
            <div className="text-4xl font-black">{wasteAvoided.toFixed(1)} <span className="text-lg">kg</span></div>
            <p className="text-[10px] text-cyan-200 font-bold uppercase mt-2">Resíduos evitados ao consertar</p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input type="text" placeholder="Buscar produto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-white border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 shadow-sm" />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}