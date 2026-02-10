'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, ArrowUpRight, TrendingUp, Scan, Camera, MapPin } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
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

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('warranties')
        .update({ last_checkin_at: now })
        .eq('id', id);

      if (error) throw error;

      // Registrar no histórico também
      await supabase.from('maintenance_logs').insert({
        warranty_id: id,
        description: 'Check-in de Auditoria Física realizado com sucesso.',
        date: now.split('T')[0],
        cost: 0
      });

      toast.success('Check-in realizado! Integridade física confirmada.');
      fetchData();
    } catch (err) {
      toast.error('Erro ao realizar check-in.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar</Button></Link>
        </div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{warranty.name}</h1>
          <div className="flex flex-wrap gap-2">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Patrimônio Auditado</div>
            {warranty.last_checkin_at && (
              <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-100 flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" /> Visto em {new Date(warranty.last_checkin_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
        
        {/* Botão de Check-in de Auditoria */}
        <Button 
          onClick={handleCheckIn} 
          disabled={checkingIn}
          className="bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-16 px-10 rounded-[24px] shadow-2xl shadow-slate-200 dark:shadow-none gap-3 shrink-0"
        >
          {checkingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scan className="h-5 w-5 text-emerald-400" />}
          {checkingIn ? 'Auditando...' : 'Realizar Check-in Físico'}
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card de Status de Auditoria */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="h-20 w-20 rounded-[32px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Custódia Verificada</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  O check-in físico confirma que o objeto está em boas condições e sob sua posse. Isso invalida tentativas de fraude e acelera processos de seguro.
                </p>
                {warranty.last_checkin_at ? (
                  <p className="text-[10px] font-black text-emerald-600 uppercase mt-4 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Última Verificação: {formatDate(warranty.last_checkin_at)} às {new Date(warranty.last_checkin_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-amber-500 uppercase mt-4">Nenhuma verificação física realizada ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Diário de Vida do Ativo</CardTitle></CardHeader>
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
          <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-xl space-y-6 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><MapPin className="h-32 w-32" /></div>
            <h4 className="text-xl font-black leading-tight uppercase tracking-tighter">Localização</h4>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">Este item está registrado na sua pasta **{warranty.folder}**. Em caso de mudança, atualize a pasta para manter o histórico de localização preciso.</p>
            <Button variant="ghost" className="w-full bg-white/10 text-white font-black text-[10px] uppercase py-4 border border-white/10 hover:bg-white/20">Alterar Localização</Button>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-teal-50 dark:border-white/5 shadow-xl p-8 relative overflow-hidden">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Real Hoje</p>
            <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}