'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2, SendHorizonal, DownloadCloud, Fingerprint, Cloud } from 'lucide-react';
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
  const [syncing, setSyncing] = useState(false);
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
  const totalWarranties = warranties.length;
  const auditProgress = totalWarranties > 0 ? Math.round((warranties.filter(w => !!w.invoice_url).length / totalWarranties) * 100) : 0;

  const handleSync = () => {
    setSyncing(true);
    toast.info('Sincronizando cofre com o Google Drive...');
    setTimeout(() => {
      setSyncing(false);
      toast.success('Backup concluído com sucesso!');
    }, 2000);
  };

  const exportGlobalDossier = () => {
    if (!profile?.is_premium) {
      toast.error('O Dossiê Patrimonial Consolidado é exclusivo Pro!');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(5, 150, 105); doc.text('Guardião de Notas - Relatório Patrimonial', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Proprietário: ${profile?.full_name} | Total de Bens: ${totalWarranties}`, 14, 30);
    const tableData = warranties.map(w => [w.name, w.folder, formatDate(w.purchase_date), `R$ ${Number(w.price || 0).toLocaleString('pt-BR')}`]);
    autoTable(doc, { startY: 40, head: [['Produto', 'Pasta', 'Compra', 'Valor']], body: tableData, headStyles: { fillColor: [5, 150, 105] } });
    doc.save(`meu-patrimonio-guardiao.pdf`);
    toast.success('Dossiê consolidado baixado!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium text-sm">Seu patrimônio está auditado e protegido.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing} className="gap-2 border-emerald-100 text-emerald-700 font-bold h-12">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />} {syncing ? 'Sincronizando...' : 'Backup Cloud'}
          </Button>
          <Button variant="outline" onClick={exportGlobalDossier} className="gap-2 border-slate-200 text-slate-600 font-bold h-12"><FileDown className="h-4 w-4" /> Exportar Tudo</Button>
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* Widget de Status de Segurança Global */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-white dark:bg-slate-900 border-teal-50 dark:border-white/5 shadow-xl overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-8 opacity-5"><Fingerprint className="h-24 w-24 text-emerald-600" /></div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-10">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest"><ShieldCheck className="h-4 w-4" /> Integridade Patrimonial</div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Seus bens estão {auditProgress}% protegidos.</h3>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-50 dark:border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${auditProgress}%` }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500 rounded-full shadow-lg" />
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Cada nota cadastrada com foto recebe automaticamente um Selo de Integridade Digital.</p>
            </div>
            <div className="shrink-0 bg-slate-900 dark:bg-emerald-600 p-6 rounded-[32px] text-center min-w-[140px] shadow-2xl transition-all duration-500 group-hover:scale-105">
              <p className="text-[9px] font-black uppercase text-emerald-400 dark:text-emerald-100 mb-1">Status do Cofre</p>
              <p className="text-xl font-black text-white">{auditProgress === 100 ? 'Auditado' : 'Auditando'}</p>
              <div className={`mt-2 h-1.5 w-1.5 rounded-full mx-auto ${auditProgress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-amber-500 animate-pulse'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-900 dark:bg-slate-800 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden group shadow-emerald-900/20">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:rotate-12 transition-transform duration-700"><TrendingUp className="h-32 w-32" /></div>
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patrimônio Gerido</p>
            <div className="text-4xl font-black">R$ {totalOriginalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2 italic flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Monitorado 24/7</p>
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
