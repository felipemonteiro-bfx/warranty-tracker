'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock } from 'lucide-react';
import { calculateExpirationDate, getDaysRemaining, formatDate } from '@/lib/utils/date-utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [showTravelQR, setShowTravelQR] = useState(false);
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
        checkAndNotify(warrantyData, user.id);
      }
    }
    setLoading(false);
  };

  const checkAndNotify = async (items: any[], userId: string) => {
    const expiringSoon = items.filter(w => {
      const exp = calculateExpirationDate(w.purchase_date, w.warranty_months);
      const days = getDaysRemaining(exp);
      return days >= 0 && days <= 15;
    });
    for (const item of expiringSoon) {
      const { data: existing } = await supabase.from('notifications').select('id').eq('user_id', userId).ilike('message', `%${item.name}%`).limit(1);
      if (!existing || existing.length === 0) {
        await supabase.from('notifications').insert({ user_id: userId, title: 'Alerta de Expiração', message: `A garantia de "${item.name}" vence em ${getDaysRemaining(calculateExpirationDate(item.purchase_date, item.warranty_months))} dias.`, type: 'warning' });
      }
    }
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

  const toggleSelect = (id: string) => {
    if (!profile?.is_premium && selectedItems.length >= 2) {
      toast.error('O Modo de Viagem gratuito é limitado a 2 itens. Faça upgrade para seleção ilimitada!');
      return;
    }
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exportPDF = (items = filteredWarranties) => {
    if (!profile?.is_premium && items.length > 5) {
      toast.error('O plano gratuito permite exportar dossiês de no máximo 5 itens. Faça upgrade!');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105);
    doc.text('Guardião - Dossiê de Proteção', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Proprietário: ${profile?.full_name || 'Usuário'} | CPF: ${profile?.cpf || '---'}`, 14, 30);
    const tableData = items.map(w => [w.name, w.store || '---', formatDate(w.purchase_date), formatDate(calculateExpirationDate(w.purchase_date, w.warranty_months)), `R$ ${Number(w.price || 0).toLocaleString('pt-BR')}`]);
    autoTable(doc, { startY: 40, head: [['Produto', 'Loja', 'Compra', 'Expiração', 'Valor']], body: tableData, headStyles: { fillColor: [5, 150, 105] } });
    doc.save(`dossie-guardiao.pdf`);
    toast.success('Dossiê Gerado!');
  };

  const totalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalSaved = warranties.reduce((acc, curr) => acc + (Number(curr.total_saved) || 0), 0);
  const totalWarranties = warranties.length;
  const expiredCount = warranties.filter(w => getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months)) < 0).length;
  const safetyScore = totalWarranties > 0 ? Math.round(((totalWarranties - expiredCount) / totalWarranties) * 100) : 0;

  const folderData = Array.from(new Set(warranties.map(w => w.folder))).map(folder => ({
    name: folder,
    valor: warranties.filter(w => w.folder === folder).reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  })).sort((a, b) => b.valor - a.valor);

  const nextExpiring = [...warranties]
    .filter(w => getDaysRemaining(calculateExpirationDate(w.purchase_date, w.warranty_months)) >= 0)
    .sort((a, b) => getDaysRemaining(calculateExpirationDate(a.purchase_date, a.warranty_months)) - getDaysRemaining(calculateExpirationDate(b.purchase_date, b.warranty_months)))[0];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl animate-float"><MessageCircle className="h-7 w-7" /></a>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
            {profile?.is_premium ? (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">Pro</span>
            ) : (
              <Link href="/plans" className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-emerald-600 hover:text-white transition-all">Gratuito</Link>
            )}
          </div>
          <p className="text-slate-500 font-medium">Seu patrimônio está {safetyScore}% protegido hoje.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportPDF()} className="gap-2 border-emerald-100 text-emerald-700 font-bold shadow-sm">
            <FileDown className="h-4 w-4" /> Dossiê Completo
          </Button>
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* Barra de Ações em Massa (Modo de Viagem) */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl">
            <div className="bg-slate-900 text-white rounded-[32px] p-4 shadow-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-4 ml-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center font-black">{selectedItems.length}</div>
                <div className="hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Selecionados</p>
                  <p className="text-[10px] text-slate-400 font-bold">Modo de Viagem Ativo</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowTravelQR(true)} className="text-white hover:bg-white/10 gap-2 font-bold"><QrCode className="h-4 w-4" /> QR Pass</Button>
                <Button variant="outline" onClick={() => exportPDF(warranties.filter(w => selectedItems.includes(w.id)))} className="border-white/20 text-white hover:bg-white/10 gap-2 font-bold"><Plane className="h-4 w-4" /> Dossiê Viagem</Button>
                <Button variant="ghost" onClick={() => setSelectedItems([])} className="text-slate-400 h-10 w-10 p-0 rounded-full"><X className="h-5 w-5" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de QR Code de Viagem */}
      <AnimatePresence>
        {showTravelQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
              {!profile?.is_premium && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Lock className="h-2 w-2" /> Trial de 24h
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <div className="bg-emerald-50 p-3 rounded-2xl"><Plane className="h-6 w-6 text-emerald-600" /></div>
                <button onClick={() => setShowTravelQR(false)} className="p-2 bg-slate-50 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Passaporte Digital de Bens</h3>
              <p className="text-sm text-slate-500 font-medium">Apresente este QR para acesso verificado às notas fiscais dos itens selecionados.</p>
              <div className="bg-slate-50 p-6 rounded-3xl inline-block border-2 border-slate-100">
                <QRCodeSVG value={`${window.location.origin}/travel-check?items=${selectedItems.join(',')}`} size={200} />
              </div>
              {!profile?.is_premium && (
                <Link href="/plans">
                  <Button variant="ghost" className="w-full text-emerald-600 font-black text-[10px] uppercase gap-2">Garanta acesso vitalício ao Pro <Crown className="h-3 w-3" /></Button>
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gráficos e Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-slate-900 text-white border-none overflow-hidden relative shadow-2xl">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-500/10 skew-x-12 translate-x-10" />
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative h-32 w-32 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-700" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray={`${safetyScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black">{safetyScore}</span><span className="text-[8px] font-black uppercase text-emerald-400">Score</span></div>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <div><h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2"><Trophy className="h-5 w-5 text-amber-400" /> Nível de Proteção</h3><p className="text-sm text-slate-400 font-medium">Patrimônio monitorado: <span className="text-emerald-400 font-black">R$ {totalValue.toLocaleString('pt-BR')}</span></p></div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-left"><p className="text-[10px] font-black uppercase text-slate-500">Notas Ativas</p><p className="text-lg font-black text-white">{totalWarranties - expiredCount}</p></div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-left"><p className="text-[10px] font-black uppercase text-slate-500">Economia Total</p><p className="text-lg font-black text-pink-400">R$ {totalSaved.toLocaleString('pt-BR')}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Alocação por Pasta */}
        <Card className="border-teal-100 bg-white shadow-xl overflow-hidden">
          <CardHeader className="pb-0 bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><BarChart3 className="h-3 w-3 text-emerald-600" /> Alocação por Pasta</CardTitle>
          </CardHeader>
          <CardContent className="h-48 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={folderData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
                <Bar dataKey="valor" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-2 mt-2">
              {folderData.slice(0, 3).map((f, i) => (
                <span key={i} className="text-[8px] font-black text-slate-400 uppercase">{f.name}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input type="text" placeholder="Buscar produto, loja ou categoria..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-white border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 shadow-sm" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-teal-50 shadow-sm overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-[10px] whitespace-nowrap uppercase tracking-tighter"><FolderOpen className="h-3.5 w-3.5" /> Pastas:</div>
            <button onClick={() => setSelectedFolder('all')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase ${selectedFolder === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todas</button>
            {folders.map(folder => (
              <button key={folder} onClick={() => setSelectedFolder(folder)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase ${selectedFolder === folder ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{folder}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-teal-50 shadow-sm overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-[10px] whitespace-nowrap uppercase tracking-tighter"><Filter className="h-3.5 w-3.5" /> Categorias:</div>
            <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase ${selectedCategory === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todas</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((warranty) => (
            <div key={warranty.id} className="relative group">
              <button onClick={() => toggleSelect(warranty.id)} className={`absolute -top-2 -left-2 z-20 h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${selectedItems.includes(warranty.id) ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-lg' : 'bg-white border-slate-200 opacity-0 group-hover:opacity-100'}`}>{selectedItems.includes(warranty.id) && <CheckCircle2 className="h-4 w-4 text-white" />}</button>
              <WarrantyCard warranty={warranty} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
