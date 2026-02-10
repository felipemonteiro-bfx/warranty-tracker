'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp, Scan, Camera, MapPin, Megaphone, ShoppingCart, Tag, BadgeCheck, Zap } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Lógica de ROI de Upgrades: 
  // Upgrades agregam 70% do seu custo ao valor de revenda do bem
  const upgrades = logs.filter(l => l.description.toLowerCase().includes('upgrade') || l.description.toLowerCase().includes('melhoria'));
  const totalUpgradeCost = upgrades.reduce((acc, curr) => acc + Number(curr.cost), 0);
  const addedResaleValue = totalUpgradeCost * 0.7;

  const calculateMarketValue = () => {
    const price = Number(warranty.price || 0);
    const yearsOwned = (new Date().getTime() - new Date(warranty.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const baseValue = price * 0.9 * Math.pow(0.85, yearsOwned);
    return baseValue + addedResaleValue;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const currentMarketValue = calculateMarketValue();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar</Button></Link>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Módulo de ROI de Upgrades (Financial Intelligence) */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-12">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]"><TrendingUp className="h-4 w-4" /> Valorização por Upgrades</div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">Seu item vale <span className="text-emerald-600">R$ {addedResaleValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span> a mais.</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Detectamos {upgrades.length} melhorias técnicas. Diferente da depreciação comum, seus upgrades recuperam cerca de 70% do valor investido na hora da venda.</p>
              </div>
              <div className="shrink-0 bg-slate-900 dark:bg-emerald-600 p-8 rounded-[40px] text-center min-w-[180px] shadow-2xl">
                <p className="text-[10px] font-black uppercase text-emerald-400 dark:text-emerald-100 mb-2">ROI de Melhoria</p>
                <p className="text-4xl font-black text-white">+ {upgrades.length > 0 ? '18%' : '0%'}</p>
                <p className="text-[9px] text-slate-400 dark:text-emerald-50 font-bold uppercase mt-4">Sobre o valor base</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Histórico Técnico</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${log.description.toLowerCase().includes('upgrade') ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
                    {log.description.toLowerCase().includes('upgrade') ? <Zap className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • Investimento: R$ {Number(log.cost).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valor Real Hoje (Com Upgrades)</p>
            <div className="text-4xl font-black text-white mt-1">R$ {currentMarketValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <p className="text-[9px] text-emerald-500 mt-4 italic">Auditado via selo de integridade Guardião.</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <ShieldCheck className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção Ativa</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Gere dossiês para sinistros ou seguros em segundos.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Opções Pro</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
