'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warranty, setWarranty] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
    }
    const { data: warrantyData } = await supabase.from('warranties').select('*').eq('id', id).single();
    if (!warrantyData) return setWarranty(null);
    setWarranty(warrantyData);
    const { data: logData } = await supabase.from('maintenance_logs').select('*').eq('warranty_id', id).order('date', { ascending: false });
    setLogs(logData || []);
    setLoading(false);
  };

  const calculateFinancialMetrics = () => {
    const price = Number(warranty.price || 0);
    const purchaseDate = new Date(warranty.purchase_date);
    const yearsOwned = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Depreciação: 15% ao ano
    const resaleValue = price * 0.9 * Math.pow(0.85, yearsOwned);
    
    // Reposição: 8% inflação anual estimada para eletrônicos
    const replacementValue = price * Math.pow(1.08, yearsOwned);
    
    return { resaleValue, replacementValue };
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const { resaleValue, replacementValue } = calculateFinancialMetrics();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar Dados</Button></Link>
        </div>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none dark:text-white uppercase">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm">Patrimônio Auditado</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      {/* NOVO: Grid de Inteligência Financeira Avançada */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:rotate-12 transition-transform duration-700"><TrendingDown className="h-32 w-32" /></div>
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Revenda</p>
            <div className="text-3xl font-black text-slate-900 dark:text-white">R$ {resaleValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-emerald-600 font-black uppercase mt-2">Liquidez Imediata</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:-rotate-12 transition-transform duration-700"><ArrowUpRight className="h-32 w-32 text-emerald-500" /></div>
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Custo de Reposição (Novo)</p>
            <div className="text-3xl font-black text-emerald-400">R$ {replacementValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Impacto por Inflação</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-emerald-600 text-white p-8 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10"><ShieldCheck className="h-32 w-32" /></div>
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest">Déficit de Proteção</p>
            <div className="text-3xl font-black text-white">R$ {(replacementValue - (Number(warranty.price) || 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-emerald-100 font-bold uppercase mt-2">Valor "Descoberto"</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center gap-2 mb-8"><History className="h-5 w-5 text-emerald-600" /><CardTitle className="text-sm font-black uppercase text-slate-400">Jornada do Ativo</CardTitle></div>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-white border border-teal-50 dark:bg-slate-900 dark:border-white/5 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Gap Financeiro</h4>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">Se este produto sofrer um sinistro hoje, você precisaria desembolsar **R$ {(replacementValue - resaleValue).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}** extras para comprar um novo igual. </p>
            <Link href="/plans" className="block"><Button className="w-full h-12 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20">Proteger Patrimônio</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
