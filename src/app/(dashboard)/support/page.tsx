'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Scale, MessageCircle, FileText, ShieldCheck, ArrowRight, Loader2, Info, Gavel, Search, HelpCircle, ChevronDown, ChevronUp, Sparkles, Send, Landmark, Balance, PhoneIncoming, Clock, AlertCircle, CheckCircle2, History, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      
      const { data: claimData } = await supabase.from('claims').select('*, warranties(name)').order('created_at', { ascending: false });
      setClaims(claimData || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-500';
      case 'legal_action': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-amber-500';
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Support <span className="text-emerald-600">& Legal</span></h1>
          <p className="text-slate-500 font-medium">Gestão de conflitos, garantias e assistência VIP.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/consultant">
            <Button className="gap-2 h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20">
              <Sparkles className="h-4 w-4" /> Consultoria IA
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Lado Esquerdo: Gestão de Casos Ativos */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
              <History className="h-6 w-6 text-emerald-600" /> Casos em Resolução
            </h3>
            <Button size="sm" variant="ghost" className="text-emerald-600 font-black text-[10px] uppercase gap-2">
              <Plus className="h-4 w-4" /> Abrir Novo Caso
            </Button>
          </div>

          <div className="space-y-4">
            {claims.length === 0 ? (
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-12 text-center space-y-4">
                <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto" />
                <p className="text-sm text-slate-400 font-bold uppercase">Nenhum sinistro ativo ou disputa aberta.</p>
              </Card>
            ) : (
              claims.map((claim) => (
                <Card key={claim.id} className="border-none shadow-lg overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-all">
                  <div className={`h-1.5 w-full ${getStatusColor(claim.status)}`} />
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        claim.status === 'legal_action' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {claim.status === 'legal_action' ? <Gavel className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tighter">{claim.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase ${getStatusColor(claim.status)}`}>{claim.status}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Item: {claim.warranties?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Protocolo: <span className="font-mono font-black">{claim.protocol_number || '---'}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Prazo de Resposta</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{claim.deadline_date ? formatDate(claim.deadline_date) : 'Imediato'}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-black uppercase border-slate-100 dark:border-white/10">Atualizar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="border-none shadow-2xl bg-slate-900 text-white p-10 relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><Balance className="h-48 w-48 text-emerald-500 rotate-12" /></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em]"><AlertCircle className="h-4 w-4" /> Alerta de Prazo</div>
              <h2 className="text-3xl font-black leading-tight max-w-xl uppercase tracking-tighter">O fabricante tem <span className="text-emerald-400">30 dias</span> para consertar seu bem.</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Passado esse prazo, conforme o Art. 18 do CDC, você tem direito à substituição do produto, restituição do valor ou abatimento proporcional.</p>
              <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase h-12 border border-white/10 px-8">Ler meus Direitos (CDC)</Button>
            </div>
          </Card>
        </div>

        {/* Lado Direito: VIP Channel e FAQ */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-emerald-600 text-white p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><PhoneIncoming className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest">Canal Exclusivo</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">VIP Legal Concierge</h3>
              <p className="text-xs text-emerald-50 leading-relaxed font-medium">Conecte-se com advogados especialistas em Direito do Consumidor e resolva seu caso com prioridade.</p>
              <Button className="w-full h-14 bg-white text-emerald-700 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest shadow-xl border-none">Falar com Especialista</Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Perguntas Frequentes</h4>
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="font-black text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-tight">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                <AnimatePresence>{openFaq === idx && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-4 pt-0 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-white/5">{faq.a}</div>
                  </motion.div>
                )}</AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}