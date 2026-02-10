'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2, SendHorizonal, DownloadCloud } from 'lucide-react';
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
  const [rescuing, setRescuing] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  const [showRescueModal, setShowRescueModal] = useState(false);
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

  const handleRescueTransfer = async () => {
    if (!transferCode.trim()) return;
    setRescuing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Acesse sua conta para importar');

      // 1. Verificar se o código existe e está pendente
      const { data: transfer, error: fetchError } = await supabase
        .from('asset_transfers')
        .select('*')
        .eq('transfer_code', transferCode.toUpperCase())
        .eq('status', 'pending')
        .single();

      if (fetchError || !transfer) throw new Error('Código inválido ou já utilizado.');

      // 2. Transferir a garantia para o novo dono
      const { error: updateError } = await supabase
        .from('warranties')
        .update({ user_id: user.id })
        .eq('id', transfer.warranty_id);

      if (updateError) throw updateError;

      // 3. Marcar transferência como concluída
      await supabase
        .from('asset_transfers')
        .update({ status: 'completed' })
        .eq('id', transfer.id);

      toast.success('Bem importado com sucesso para seu patrimônio!');
      setShowRescueModal(false);
      setTransferCode('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRescuing(false);
    }
  };

  const totalOriginalValue = filteredWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalWarranties = warranties.length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium text-sm">Gerencie seu patrimônio e conquistas.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowRescueModal(true)} className="gap-2 border-emerald-100 text-emerald-700 font-bold shadow-sm">
            <DownloadCloud className="h-4 w-4" /> Resgatar Bem
          </Button>
          <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
        </div>
      </header>

      {/* Modal de Resgate de Transferência */}
      <AnimatePresence>
        {showRescueModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
              <button onClick={() => setShowRescueModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"><X className="h-5 w-5 text-slate-400" /></button>
              <div className="h-20 w-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200/50"><DownloadCloud className="h-10 w-10" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Resgatar Patrimônio</h3>
                <p className="text-sm text-slate-500 font-medium">Insira o código enviado pelo vendedor para importar o bem e seu histórico completo.</p>
              </div>
              <input 
                type="text" 
                placeholder="Ex: TRF-A1B2C3" 
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value.toUpperCase())}
                className="w-full h-16 text-center text-2xl font-black tracking-widest text-emerald-600 bg-slate-50 border-2 border-teal-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase"
              />
              <Button onClick={handleRescueTransfer} disabled={rescuing || !transferCode} className="w-full h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20">
                {rescuing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                {rescuing ? 'Processando...' : 'Confirmar Importação'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Valor sob Custódia</p>
          <div className="text-4xl font-black text-slate-900">R$ {totalOriginalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Patrimônio acumulado</p>
        </Card>
        <Card className="border-teal-100 bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden shadow-emerald-500/20"><div className="relative z-10"><p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Score de Proteção</p><div className="text-4xl font-black">100%</div><p className="text-[10px] text-emerald-100 font-bold uppercase mt-2">Segurança máxima ativa</p></div></Card>
        <Card className="border-teal-100 bg-white shadow-xl p-8 flex flex-col justify-center text-center md:text-left"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Itens Totais</p><div className="text-4xl font-black text-slate-900">{totalWarranties}</div><p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Notas documentadas</p></Card>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((w) => (<div key={w.id} className="relative group"><WarrantyCard warranty={w} /></div>))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
