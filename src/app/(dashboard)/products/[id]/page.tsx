'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, FileWarning, Coins, Hourglass } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addMonths, parseISO, isAfter, differenceInDays } from 'date-fns';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addingLog, setAddingLog] = useState(false);
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

  const calculateDepreciation = () => {
    const price = Number(warranty.price || 0);
    if (price === 0) return 0;
    const yearsOwned = (new Date().getTime() - new Date(warranty.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  const getUsageMetrics = () => {
    const purchaseDate = parseISO(warranty.purchase_date);
    const daysOwned = Math.max(1, differenceInDays(new Date(), purchaseDate));
    const totalCost = Number(warranty.price || 0) + logs.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const costPerDay = totalCost / daysOwned;
    return { daysOwned, totalCost, costPerDay };
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const { daysOwned, totalCost, costPerDay } = getUsageMetrics();
  const currentVal = calculateDepreciation();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold"><Pencil className="h-4 w-4" /> Editar Ativo</Button></Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Patrimônio Auditado</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      {/* Grid de ROI e Valor */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:rotate-12 transition-transform duration-700"><Coins className="h-48 w-48 text-emerald-500" /></div>
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Custo por Dia de Uso</p>
            <div className="text-4xl font-black">R$ {costPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Investimento amortizado em {daysOwned} dias</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white p-8 flex flex-col justify-center border-b-4 border-b-emerald-500">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-2"><TrendingDown className="h-3 w-3" /> Valor de Revenda</p>
          <div className="text-3xl font-black text-slate-900">R$ {currentVal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[9px] text-emerald-600 font-black uppercase mt-2 italic">Retenção de {Math.round((currentVal / Number(warranty.price || 1)) * 100)}% do valor</p>
        </Card>

        <Card className="border-none shadow-xl bg-white p-8 flex flex-col justify-center border-b-4 border-b-cyan-500">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-2"><Hourglass className="h-3 w-3 text-cyan-600" /> Tempo de Posse</p>
          <div className="text-3xl font-black text-slate-900">{Math.floor(daysOwned / 30)} <span className="text-sm">meses</span></div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Documentado desde {formatDate(warranty.purchase_date)}</p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white p-8">
            <div className="flex items-center gap-2 mb-8"><History className="h-5 w-5 text-emerald-600" /><CardTitle className="text-sm font-black uppercase text-slate-400">Diário de Vida do Produto</CardTitle></div>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-center py-12 text-slate-300 font-bold uppercase text-[10px]">Nenhum evento registrado.</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4 relative overflow-hidden">
            <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
            <h4 className="text-xl font-black leading-tight text-white">Guardião Intelligence</h4>
            <p className="text-xs font-medium text-emerald-100">Sua média de custo diário para este item é excelente. Isso prova que foi uma compra inteligente e bem aproveitada.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Comparativo de Categoria</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
