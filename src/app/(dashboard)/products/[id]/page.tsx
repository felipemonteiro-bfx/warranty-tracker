'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, MailSearch, Copy, X, SendHorizonal, UserPlus } from 'lucide-react';
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
  const [transferring, setTransferring] = useState(false);
  const [warranty, setWarranty] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [transferCode, setTransferCode] = useState<string | null>(null);
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

  const handleGenerateTransfer = async () => {
    if (!profile?.is_premium) {
      toast.error('Transferência Digital é um recurso Pro!');
      router.push('/plans');
      return;
    }
    setTransferring(true);
    try {
      const code = `TRF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error } = await supabase.from('asset_transfers').insert({
        warranty_id: id,
        sender_id: profile.id,
        transfer_code: code
      });
      if (error) throw error;
      setTransferCode(code);
      toast.success('Código de transferência gerado!');
    } catch (err) {
      toast.error('Erro ao gerar transferência.');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold text-teal-700">Editar Dados</Button></Link>
        </div>
      </div>

      {/* Modal de Transferência */}
      <AnimatePresence>
        {transferCode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
              <button onClick={() => setTransferCode(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="h-5 w-5 text-slate-400" /></button>
              <div className="h-20 w-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200/50"><SendHorizonal className="h-10 w-10" /></div>
              <h3 className="text-2xl font-black text-slate-900">Pronto para Transferir</h3>
              <p className="text-sm text-slate-500 font-medium">Envie este código ao novo dono. Ele poderá importar todo o histórico e nota fiscal para a conta dele.</p>
              <div className="p-6 bg-slate-900 rounded-3xl border-4 border-emerald-500/30">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Código Único</p>
                <p className="text-4xl font-black text-white tracking-widest font-mono">{transferCode}</p>
              </div>
              <Button onClick={() => { navigator.clipboard.writeText(transferCode); toast.success('Código copiado!'); }} className="w-full h-14 gap-2 font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20"><Copy className="h-4 w-4" /> Copiar Código</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Card de Transferência Patrimonial (Killer Feature) */}
          <Card className="border-none shadow-xl bg-white overflow-hidden group">
            <div className="h-2 w-full bg-slate-900" />
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"><UserPlus className="h-8 w-8" /></div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">Vendeu este produto?</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Transfira a "certidão digital" do bem para o novo dono. Isso aumenta a confiança e o valor da sua venda.</p>
                </div>
              </div>
              <Button 
                onClick={handleGenerateTransfer} 
                disabled={transferring}
                className="bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-14 px-8 rounded-2xl shrink-0"
              >
                {transferring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SendHorizonal className="h-4 w-4 mr-2" />}
                Gerar Transferência
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Linha do Tempo</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000" />
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Revenda</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.82).toLocaleString('pt-BR')}</div>
            <p className="text-[9px] text-emerald-600 font-black uppercase mt-4 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Auditado pelo Guardião</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção Ativa</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Simule um seguro residencial para proteger este e outros bens da sua casa.</p>
            <Link href={`/insurance/simulator/${warranty.id}`} className="block"><Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Simular Seguro</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}