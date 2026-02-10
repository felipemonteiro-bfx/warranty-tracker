'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins } from 'lucide-react';
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

  const getPriceProtectionStatus = () => {
    if (!warranty.card_brand) return null;
    const brand = warranty.card_brand.toLowerCase();
    if (brand.includes('visa gold') || brand.includes('visa platinum') || brand.includes('visa infinite') || brand.includes('mastercard gold')) {
      return {
        title: 'Benefício Detectado!',
        desc: `Seu cartão ${warranty.card_brand} pode ter Seguro Proteção de Preço. Se este produto baixar de preço em 30 dias, você pode receber a diferença de volta!`,
        link: brand.includes('visa') ? 'https://www.visa.com.br/pay-with-visa/portal-de-beneficios.html' : 'https://www.mastercard.com.br/pt-br/consumidores/encontre-seu-cartao/guia-de-beneficios.html'
      };
    }
    return null;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const protection = getPriceProtectionStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar Dados</Button></Link>
      </div>

      {protection && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Coins className="h-6 w-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-black">{protection.title}</h3>
              <p className="text-sm font-medium text-blue-50 max-w-xl">{protection.desc}</p>
            </div>
          </div>
          <a href={protection.link} target="_blank" rel="noopener noreferrer">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-black text-[10px] uppercase h-12 px-8 rounded-xl shadow-lg">Abrir Portal de Benefícios</Button>
          </a>
        </motion.div>
      )}

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600" /> Dados Financeiros</CardTitle></CardHeader>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-1"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Original</p><p className="text-xl font-black text-slate-900">R$ {Number(warranty.price || 0).toLocaleString('pt-BR')}</p></div>
              <div className="space-y-1"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cartão Utilizado</p><p className="text-sm font-bold text-slate-700 flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-600" /> {warranty.card_brand || 'Não informado'}</p></div>
              <div className="space-y-1"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loja</p><p className="text-sm font-bold text-slate-700">{warranty.store || '---'}</p></div>
            </div>
          </Card>

          <Card className="border-none shadow-xl bg-white p-8">
            <div className="flex items-center gap-2 mb-8"><History className="h-5 w-5 text-emerald-600" /><CardTitle className="text-sm font-black uppercase text-slate-400">Jornada do Ativo</CardTitle></div>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start"><div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div><div><p className="text-sm font-black text-slate-900">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div></div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Este bem está documentado e auditado pelo Guardião. Gere dossiês para sinistros ou vendas.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Emitir Dossiê Pro</Button>
          </div>
        </div>
      </div>
    </div>
  );
}