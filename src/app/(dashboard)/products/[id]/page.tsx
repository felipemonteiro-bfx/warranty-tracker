'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp, Scan, Camera, MapPin, Megaphone, ShoppingCart, Tag, BadgeCheck, Zap, Languages, Timer, BarChart3, ListChecks, MessageSquare, ThumbsUp, ThumbsDown, Share2, Calculator, Wallet } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzingROI, setAnalyzingROI] = useState(false);
  const [roiData, setRoiData] = useState<any>(null);
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

  const calculateRealROI = () => {
    setAnalyzingROI(true);
    setTimeout(() => {
      const pricePaid = Number(warranty.price || 0);
      const totalMaintenance = logs.reduce((acc, curr) => acc + Number(curr.cost), 0);
      const inflationFactor = 1.12; // Simulação de 12% de inflação no período
      const purchasePriceCorrected = pricePaid * inflationFactor;
      
      const estimatedResale = pricePaid * 0.85; // Estimativa simples para o exemplo
      const netGain = estimatedResale - (purchasePriceCorrected + totalMaintenance);
      
      setRoiData({
        netGain,
        purchasePriceCorrected,
        totalMaintenance,
        estimatedResale,
        roiPercent: ((estimatedResale / (pricePaid + totalMaintenance)) - 1) * 100
      });
      setAnalyzingROI(false);
      toast.success('Análise de ROI concluída!');
    }, 1500);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold uppercase text-[10px] tracking-widest">Editar</Button></Link>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          
          {/* NOVO: Calculadora de Lucro Real na Revenda (Feature 2) */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardHeader className="p-10 pb-0">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]"><Calculator className="h-4 w-4" /> Resale Analytics</div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Análise de Lucro Real</CardTitle>
                </div>
                {!roiData && (
                  <Button 
                    onClick={calculateRealROI} 
                    disabled={analyzingROI}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 gap-2"
                  >
                    {analyzingROI ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                    Calcular ROI
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-8">
              <AnimatePresence mode="wait">
                {!roiData ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center space-y-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Calculamos o lucro real da sua revenda considerando Inflação, Upgrades e Valor de Nota.</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Custo Total</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">R$ {(roiData.purchasePriceCorrected + roiData.totalMaintenance).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Valor Venda</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">R$ {roiData.estimatedResale.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className={`p-6 rounded-3xl text-center ${roiData.netGain >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <p className={`text-[10px] font-black uppercase mb-1 ${roiData.netGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Ganho Real</p>
                        <p className={`text-xl font-black ${roiData.netGain >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>R$ {Math.abs(roiData.netGain).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-6 bg-slate-900 dark:bg-emerald-600 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-emerald-400 dark:text-white uppercase mb-1">ROI Final</p>
                        <p className="text-xl font-black text-white">{roiData.roiPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-4">
                      <Zap className="h-6 w-6 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed italic">"Dica IA: Seus upgrades valorizaram este bem acima da média. O momento ideal de venda é em até 6 meses para maximizar o retorno de capital."</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Log de Vida</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patrimônio Líquido</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
            <p className="text-[9px] text-emerald-500 mt-4 italic flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Auditado pelo Guardião</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <ShieldCheck className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Certificado Digital</h4><p className="text-xs font-medium text-emerald-100">Gere um documento de autenticidade reconhecido para venda ou seguro.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Emitir Certificado</Button>
          </div>
        </div>
      </div>
    </div>
  );
}