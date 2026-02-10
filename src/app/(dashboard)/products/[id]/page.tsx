'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp, Scan, Camera, MapPin, Megaphone, ShoppingCart, Tag, BadgeCheck, Zap, Languages, Timer, BarChart3, ListChecks, MessageSquare, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
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
  const [writingAd, setWritingAd] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<any>(null);
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

  const generateAdCopy = async () => {
    setWritingAd(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const logSummary = logs.map(l => `- ${l.description} em ${formatDate(l.date)}`).join('\n');
      const prompt = `Crie um anúncio de venda premium para: ${warranty.name}.
      Use estes diferenciais:
      - Nota Fiscal disponível
      - Histórico de manutenção:\n${logSummary || 'Item muito bem conservado'}
      - Selo de integridade digital do Guardião de Notas.
      Retorne em JSON: { "title": "título", "description": "descrição", "price": ${warranty.price * 0.8} }`;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
      setGeneratedAd(data);
      toast.success('Anúncio estratégico gerado!');
    } catch (err) { toast.error('Erro na IA de Vendas.'); } finally { setWritingAd(false); }
  };

  const handlePublishListing = async () => {
    setPublishing(true);
    try {
      const { error } = await supabase.from('marketplace_listings').insert({
        warranty_id: id,
        user_id: profile.id,
        listing_price: generatedAd.price,
        description: generatedAd.description
      });
      if (error) throw error;
      toast.success('Seu item agora está visível no Marketplace do Guardião!');
      router.push('/marketplace');
    } catch (err) {
      toast.error('Erro ao publicar anúncio.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar Ativo</Button></Link>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Módulo de Venda Real (Feature 2) */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
            <div className="h-1.5 w-full bg-emerald-600" />
            <CardContent className="p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[24px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shadow-sm"><Megaphone className="h-8 w-8" /></div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Vender no Marketplace</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">Anuncie para a comunidade do Guardião com garantia de procedência.</p>
                  </div>
                </div>
                <Button 
                  onClick={generateAdCopy} 
                  disabled={writingAd}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl gap-2 shadow-xl shadow-emerald-500/20"
                >
                  {writingAd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {writingAd ? 'Gerando Anúncio...' : 'Preparar Venda IA'}
                </Button>
              </div>

              <AnimatePresence>
                {generatedAd && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-10 p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-6 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Título do Anúncio</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{generatedAd.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Preço Sugerido</p>
                        <p className="text-2xl font-black text-emerald-600">R$ {Number(generatedAd.price).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Descrição Baseada em Auditoria</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">{generatedAd.description}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handlePublishListing} disabled={publishing} className="flex-1 h-14 bg-slate-900 text-white gap-2 font-black uppercase text-xs tracking-widest">
                        {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                        Publicar no Marketplace
                      </Button>
                      <Button variant="outline" className="flex-1 h-14 border-slate-200" onClick={() => setGeneratedAd(null)}>Cancelar</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Log de Auditoria</CardTitle></CardHeader>
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
            <div className="h-24 w-24 rounded-[40px] bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30">
              <ShieldCheck className="h-12 w-12 text-emerald-500" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter">Status: Auditado</h4>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">Integridade Digital Verificada</p>
          </Card>
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <TrendingUp className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Este bem está documentado e auditado pelo Guardião. Gere dossiês para sinistros ou vendas rápidas.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Baixar Dossiê Master</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
