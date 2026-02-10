'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2 } from 'lucide-react';
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiFiltering, setAiFiltering] = useState(false);
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
        setCategories(Array.from(new Set(warrantyData.map(w => w.category).filter(Boolean))) as string[]);
        setFolders(Array.from(new Set(warrantyData.map(w => w.folder).filter(Boolean))) as string[]);
      }
    }
    setLoading(false);
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    if (!profile?.is_premium) {
      toast.error('Busca Inteligente por IA é um recurso Pro!');
      return;
    }

    setAiFiltering(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const productsData = warranties.map(w => ({ id: w.id, name: w.name, category: w.category, price: w.price, folder: w.folder }));
      
      const prompt = `Dada a lista de produtos abaixo e a pergunta do usuário, retorne APENAS um array JSON com os IDs dos produtos que correspondem ao pedido.
      Lista: ${JSON.stringify(productsData)}
      Pergunta: "${searchQuery}"
      Resposta (Array JSON de IDs):`;

      const result = await model.generateContent(prompt);
      const ids = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
      
      setFilteredWarranties(warranties.filter(w => ids.includes(w.id)));
      setIsAISearch(true);
      toast.success('Busca IA concluída!');
    } catch (err) {
      toast.error('Erro ao processar busca inteligente.');
    } finally {
      setAiFiltering(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredWarranties(warranties);
    setIsAISearch(false);
  };

  const getDepreciatedValue = (item: any) => {
    const price = Number(item.price || 0);
    const purchaseDate = new Date(item.purchase_date);
    const yearsOwned = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalCurrentValue = filteredWarranties.reduce((acc, curr) => acc + getDepreciatedValue(curr), 0);
  const totalWarranties = warranties.length;
  const expiredCount = warranties.filter(w => getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months)) < 0).length;
  const safetyScore = totalWarranties > 0 ? Math.round(((totalWarranties - expiredCount) / totalWarranties) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium text-sm">Seu patrimônio está {safetyScore}% protegido hoje.</p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      {/* Barra de Busca Inteligente (NLP) */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {aiFiltering ? <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" /> : <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600" />}
        </div>
        <input 
          type="text" 
          placeholder={profile?.is_premium ? "Pergunte ao Guardião (Ex: notas acima de R$ 500 da casa)..." : "Pesquisar por nome do produto..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
          className="w-full h-16 pl-14 pr-32 bg-white border-2 border-teal-50 rounded-[24px] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 shadow-xl shadow-emerald-500/5"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isAISearch && <Button variant="ghost" onClick={clearSearch} className="h-10 text-[10px] uppercase font-black text-red-500">Limpar</Button>}
          <Button 
            onClick={handleAISearch} 
            disabled={aiFiltering || !searchQuery}
            className="bg-slate-900 hover:bg-black text-white h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-emerald-400" /> IA Search
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" /> Valor sob Filtro
          </p>
          <div className="text-4xl font-black text-slate-900">R$ {totalOriginalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Baseado nos resultados atuais</p>
        </Card>
        
        <Card className="border-teal-100 bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden shadow-emerald-500/20">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Liquidez Atual</p>
            <div className="text-4xl font-black text-white">R$ {totalCurrentValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-emerald-100 font-bold uppercase mt-2">Valor de revenda estimado</p>
          </div>
        </Card>

        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Itens Listados</p>
          <div className="text-4xl font-black text-slate-900">{filteredWarranties.length}</div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">De um total de {warranties.length}</p>
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
