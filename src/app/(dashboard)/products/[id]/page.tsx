'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, HandHelping, UserCircle, Phone } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addingLog, setAddingLog] = useState(false);
  const [addingLend, setAddingLend] = useState(false);
  const [warranty, setWarranty] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [lendingLogs, setLendingLogs] = useState<any[]>([]);
  const [newLog, setNewLog] = useState({ description: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [newLend, setNewLend] = useState({ borrower_name: '', borrower_contact: '', expected_return_date: '' });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: warrantyData } = await supabase.from('warranties').select('*').eq('id', id).single();
    if (!warrantyData) return setWarranty(null);
    setWarranty(warrantyData);

    const { data: logData } = await supabase.from('maintenance_logs').select('*').eq('warranty_id', id).order('date', { ascending: false });
    setLogs(logData || []);

    const { data: lendData } = await supabase.from('lending_logs').select('*').eq('warranty_id', id).order('lent_at', { ascending: false });
    setLendingLogs(lendData || []);
    
    setLoading(false);
  };

  const handleAddLend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('lending_logs').insert({
        warranty_id: id,
        ...newLend
      });
      if (error) throw error;
      toast.success('Empréstimo registrado!');
      setNewLend({ borrower_name: '', borrower_contact: '', expected_return_date: '' });
      setAddingLend(false);
      fetchData();
    } catch (err) { toast.error('Erro ao registrar.'); }
  };

  const handleReturn = async (lendId: string) => {
    const { error } = await supabase
      .from('lending_logs')
      .update({ status: 'returned', returned_at: new Date().toISOString().split('T')[0] })
      .eq('id', lendId);
    if (!error) {
      toast.success('Item marcado como devolvido!');
      fetchData();
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const activeLend = lendingLogs.find(l => l.status === 'active');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold text-teal-700">Editar Ativo</Button></Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0 ${activeLend ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {activeLend ? `Emprestado para ${activeLend.borrower_name}` : 'Em sua posse'}
          </div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Módulo de Empréstimos (Lending Guard) */}
          <Card className="border-none shadow-xl bg-white overflow-hidden relative">
            <div className={`h-2 w-full ${activeLend ? 'bg-amber-500' : 'bg-slate-900'}`} />
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-900">
                <HandHelping className="h-5 w-5 text-emerald-600" /> Controle de Empréstimo
              </CardTitle>
              {!activeLend && (
                <Button size="sm" onClick={() => setAddingLend(!addingLend)} className="h-8 rounded-lg px-4 text-[10px] font-black uppercase">Novo Empréstimo</Button>
              )}
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <AnimatePresence>
                {addingLend && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleAddLend} className="mb-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-4 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Quem pegou emprestado?" placeholder="Nome da pessoa" value={newLend.borrower_name} onChange={(e) => setNewLend({...newLend, borrower_name: e.target.value})} required />
                      <Input label="Contato (WhatsApp/Email)" placeholder="(11) 9..." value={newLend.borrower_contact} onChange={(e) => setNewLend({...newLend, borrower_contact: e.target.value})} />
                      <Input label="Previsão de Devolução" type="date" value={newLend.expected_return_date} onChange={(e) => setNewLend({...newLend, expected_return_date: e.target.value})} />
                    </div>
                    <div className="flex gap-2"><Button type="submit" className="flex-1">Confirmar Empréstimo</Button><Button variant="ghost" onClick={() => setAddingLend(false)}>Cancelar</Button></div>
                  </motion.form>
                )}
              </AnimatePresence>

              {activeLend ? (
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm"><UserCircle className="h-8 w-8" /></div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{activeLend.borrower_name}</p>
                      <p className="text-xs font-medium text-slate-500">{activeLend.borrower_contact || 'Sem contato'}</p>
                      <p className="text-[10px] font-black text-amber-600 uppercase mt-1">Emprestado em {formatDate(activeLend.lent_at)}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleReturn(activeLend.id)} className="bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase px-8 h-12 rounded-xl">Marcar como Devolvido</Button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-50 rounded-3xl">Este item está com você.</div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Manutenções */}
          <Card className="border-none shadow-xl bg-white p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Diário de Vida</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Revenda</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <ShieldCheck className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Certificado Digital</h4><p className="text-xs font-medium text-emerald-100">Gere um documento de autenticidade para venda ou seguro.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Emitir Certificado</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
