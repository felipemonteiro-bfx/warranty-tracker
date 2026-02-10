'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles } from 'lucide-react';
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
  const [categories, setCategories] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  useEffect(() => {
    if (warranties.length > 1) {
      const timer = setInterval(() => setCurrentAssetIndex((prev) => (prev + 1) % warranties.length), 5000);
      return () => clearInterval(timer);
    }
  }, [warranties.length]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: user.user_metadata?.full_name, is_premium: false });
      const { data: warrantyData } = await supabase.from('warranties').select('*').order('created_at', { ascending: false });
      if (warrantyData) {
        setWarranties(warrantyData);
        setFilteredWarranties(warrantyData);
        setCategories(Array.from(new Set(warrantyData.map(w => w.category).filter(Boolean))) as string[]);
        setFolders(Array.from(new Set(warrantyData.map(w => w.folder).filter(Boolean))) as string[]);
      }
    }
    setLoading(false);
  };

  const getDepreciatedValue = (item: any) => {
    const price = Number(item.price || 0);
    const yearsOwned = (new Date().getTime() - new Date(item.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  useEffect(() => {
    let result = warranties;
    if (selectedCategory !== 'all') result = result.filter(w => w.category === selectedCategory);
    if (selectedFolder !== 'all') result = result.filter(w => w.folder === selectedFolder);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w => w.name.toLowerCase().includes(query) || (w.category && w.category.toLowerCase().includes(query)) || (w.store && w.store.toLowerCase().includes(query)));
    }
    setFilteredWarranties(result);
  }, [selectedCategory, selectedFolder, searchQuery, warranties]);

  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalDebt = warranties.reduce((acc, curr) => acc + ((curr.total_installments - curr.paid_installments) * Number(curr.installment_value || 0)), 0);
  const netWorth = totalOriginalValue - totalDebt;
  const expiredCount = warranties.filter(w => getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months)) < 0).length;
  const safetyScore = warranties.length > 0 ? Math.round(((warranties.length - expiredCount) / warranties.length) * 100) : 0;

  // Itens com parcelas pendentes
  const itemsWithDebt = warranties.filter(w => w.paid_installments < w.total_installments);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
            {profile?.is_premium ? <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-200">Pro</span> : <Link href="/plans" className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-200 hover:bg-emerald-600 hover:text-white transition-all">Gratuito</Link>}
          </div>
          <p className="text-slate-500 font-medium">Patrimônio Líquido: <span className="text-slate-900 font-black">R$ {netWorth.toLocaleString('pt-BR')}</span>.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* NOVO: Smart AI Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[40px] bg-emerald-50 border border-emerald-100 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10"><Sparkles className="h-40 w-40 text-emerald-600" /></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200/50 shrink-0">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Resumo Executivo do Guardião</h3>
            <p className="text-emerald-800 font-medium leading-relaxed">
              {warranties.length === 0 ? "O Guardião está pronto para monitorar seus bens. Comece cadastrando sua primeira nota!" : 
              `Hoje, você possui ${warranties.length} bens sob custódia. ${expiredCount > 0 ? `Atenção: ${expiredCount} garantias já expiraram e precisam de revisão.` : "Todas as suas garantias estão ativas!"} Seu próximo pagamento de R$ ${itemsWithDebt[0]?.installment_value || 0} vence em breve.`}
            </p>
          </div>
          <div className="shrink-0">
            <Button variant="ghost" className="bg-white text-emerald-700 font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-2xl shadow-sm">Ver Detalhes IA</Button>
          </div>
        </div>
      </motion.div>

      {/* Widgets Financeiros */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-slate-900 text-white border-none overflow-hidden relative shadow-2xl">
          <CardContent className="p-8 space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Landmark className="h-3 w-3 text-emerald-500" /> Balanço Patrimonial</p>
                <div className="text-5xl font-black text-white">R$ {netWorth.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-slate-400 font-medium">Valor real dos seus bens (Patrimônio Líquido)</p>
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

        {/* Alertas de Pagamento */}
        <Card className="border-none shadow-xl bg-white flex flex-col p-8 overflow-hidden">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Próximos Pagamentos
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 flex-1">
            {itemsWithDebt.length === 0 ? (
              <div className="text-center py-8 text-slate-300 font-bold uppercase text-[10px]">Tudo Quitado!</div>
            ) : (
              itemsWithDebt.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{item.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{item.paid_installments + 1}ª de {item.total_installments}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">R$ {Number(item.installment_value).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-6 border-t border-slate-50 pt-4">Ver Fluxo de Caixa</Button>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input type="text" placeholder="Buscar produto, loja ou categoria..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-white border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 shadow-sm" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setSelectedFolder('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase ${selectedFolder === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todas</button>
          {folders.map(f => (<button key={f} onClick={() => setSelectedFolder(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase ${selectedFolder === f ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{f}</button>))}
        </div>
      </div>

      <AnimatePresence mode="popLayout"><motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
      </motion.div></AnimatePresence>
    </div>
  );
}
