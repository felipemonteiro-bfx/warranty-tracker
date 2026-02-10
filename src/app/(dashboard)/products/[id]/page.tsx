'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp, Scan, Camera, MapPin, Megaphone, ShoppingCart, Tag, BadgeCheck, Zap, Languages, Timer, BarChart3, ListChecks, MessageSquare, ThumbsUp, ThumbsDown, Share2, Calculator, Wallet, Search } from 'lucide-react';
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
  const [trackingPrice, setTrackingPrice] = useState(false);
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

  const trackLowestPrice = async () => {
    setTrackingPrice(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Você é um rastreador de preços em tempo real. Pesquise o menor preço atual nas grandes lojas brasileiras (Amazon, ML, Magalu) para: ${warranty.name}.
      Responda em JSON: { "lowest_price": valor_numerico, "store": "nome_da_loja", "link": "url_pesquisa" }`;

      const result = await model.generateContent(prompt);
      const priceData = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

      const { error } = await supabase
        .from('warranties')
        .update({ 
          lowest_price_found: priceData.lowest_price,
          price_updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setWarranty({ ...warranty, lowest_price_found: priceData.lowest_price, price_updated_at: new Date().toISOString() });
      toast.success('Varredura de preços concluída!');
    } catch (err) { toast.error('Erro ao rastrear preços.'); } finally { setTrackingPrice(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const priceDrop = Number(warranty.price) - Number(warranty.lowest_price_found || warranty.price);
  const isEligibleForRefund = priceDrop > 0 && (new Date().getTime() - new Date(warranty.purchase_date).getTime()) < (30 * 24 * 60 * 60 * 1000);

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
          
          {/* Módulo de Proteção de Preço Live (Feature 3) */}
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative group">
            <div className={`h-1.5 w-full ${priceDrop > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <CardHeader className="p-10 pb-0">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]"><Search className="h-4 w-4" /> Price Watchdog</div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Monitor de Reembolso</CardTitle>
                </div>
                <Button 
                  onClick={trackLowestPrice} 
                  disabled={trackingPrice}
                  className="bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg gap-2"
                >
                  {trackingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                  Check Prices
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-8">
              <AnimatePresence mode="wait">
                {priceDrop > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] border border-emerald-100 dark:border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">Oportunidade de Cash!</h4>
                        <p className="text-sm font-medium text-emerald-600 max-w-sm">Encontramos o mesmo produto por **R$ {Number(warranty.lowest_price_found).toLocaleString('pt-BR')}**.</p>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Reembolso Estimado</p>
                        <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400">R$ {priceDrop.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {isEligibleForRefund ? (
                      <div className="p-6 bg-slate-900 text-white rounded-[32px] flex items-center justify-between gap-6 shadow-xl">
                        <div className="flex items-center gap-4">
                          <ShieldCheck className="h-8 w-8 text-emerald-400" />
                          <p className="text-sm font-medium leading-tight">Você está no prazo de 30 dias! Acione agora o seguro do seu cartão **{warranty.card_brand}**.</p>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 h-12 px-6 text-[10px] font-black uppercase">Como Reclamar</Button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold uppercase text-center italic">Prazo de 30 dias da bandeira do cartão expirado para este item.</p>
                    )}
                  </motion.div>
                ) : (
                  <div className="py-10 text-center space-y-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Monitoramos o mercado em busca de preços menores para que você receba a diferença via seguro do cartão.</p>
                    {warranty.price_updated_at && <p className="text-[9px] font-black text-slate-300 uppercase">Último check: {formatDate(warranty.price_updated_at)}</p>}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Histórico Técnico</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-10 relative overflow-hidden group shadow-2xl text-center">
            <div className="h-24 w-24 rounded-[40px] bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Coins className="h-12 w-12 text-emerald-500" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter">Savings Monitor</h4>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">Proteção de Preço Ativa</p>
          </Card>
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <TrendingUp className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">ROI Patrimonial</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">O Guardião já ajudou usuários a recuperarem mais de R$ 1.2M em proteções de preço este ano.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Cases Pro</Button>
          </div>
        </div>
      </div>
    </div>
  );
}