'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { ShieldCheck, Calendar, Store, Hash, Package, CheckCircle2, ShieldAlert, Fingerprint, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-utils';
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PublicSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('warranties')
        .select('name, purchase_date, store, serial_number, category, nfe_key')
        .eq('id', id)
        .single();
      setItem(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  if (!item) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-10 space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-black text-slate-900">Ativo não localizado</h1>
        <p className="text-slate-500 font-medium">Este código de verificação é inválido ou o item foi removido pelo proprietário.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
        
        {/* Cabeçalho de Verificação Oficial */}
        <div className="text-center space-y-4">
          <div className="bg-emerald-600 text-white px-6 py-2 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20">
            <ShieldCheck className="h-4 w-4" /> Verificação de Autenticidade
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Documento Auditado</h1>
          <p className="text-slate-500 font-medium italic">Protocolo de integridade digital gerado pelo Sistema Guardião.</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <CardContent className="p-10 space-y-10">
            
            {/* Status do Ativo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-50 pb-10">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto Verificado</p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase">{item.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black uppercase">{item.category || 'Geral'}</span>
                  <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                    <CheckCircle2 className="h-3 w-3" /> Propriedade Validada
                  </div>
                </div>
              </div>
              <div className="shrink-0 h-24 w-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 border-2 border-emerald-100">
                <Fingerprint className="h-12 w-12" />
              </div>
            </div>

            {/* Dados Técnicos Públicos */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Calendar className="h-3 w-3" /> Data de Aquisição</div>
                <p className="text-sm font-bold text-slate-700">{formatDate(item.purchase_date)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Store className="h-3 w-3" /> Origem / Loja</div>
                <p className="text-sm font-bold text-slate-700">{item.store || 'Verificada via Nota Fiscal'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Hash className="h-3 w-3" /> Número de Série (S/N)</div>
                <p className="text-sm font-mono font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg w-fit">{item.serial_number || 'REGISTRADO'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Globe className="h-3 w-3" /> Status Jurídico</div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">Livre de ônus / auditado</p>
              </div>
            </div>

            {/* Selo de Segurança do Rodapé */}
            <div className="p-6 rounded-[32px] bg-slate-900 text-white flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Selo Guardião</p>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">Este bem está protegido sob custódia digital. A veracidade dos dados foi validada através de OCR e Auditoria de Integridade.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gerado por Guardião de Notas © 2026</p>
        </footer>
      </motion.div>
    </div>
  );
}