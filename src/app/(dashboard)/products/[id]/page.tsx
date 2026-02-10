'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining } from '@/lib/utils/date-utils';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addingLog, setAddingLog] = useState(false);
  const [warranty, setWarranty] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [newLog, setNewLog] = useState({ description: '', cost: '', date: new Date().toISOString().split('T')[0] });
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

  const generateLegalPDF = () => {
    if (!profile?.is_premium) {
      toast.error('O Dossiê Jurídico é exclusivo para usuários Pro. Faça o upgrade!');
      router.push('/plans');
      return;
    }

    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('DOSSIÊ JURÍDICO DE RECLAMAÇÃO', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Documento Verificado e Auditado por Guardião de Notas', 105, 35, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('1. DADOS DO PROPRIETÁRIO', 14, 65);
    doc.setFontSize(10);
    doc.text(`Nome: ${profile?.full_name || '---'}`, 14, 75);
    doc.text(`CPF: ${profile?.cpf || '---'}`, 14, 80);

    doc.setFontSize(14);
    doc.text('2. DADOS DO PRODUTO', 14, 95);
    doc.setFontSize(10);
    doc.text(`Produto: ${warranty.name}`, 14, 105);
    doc.text(`Loja de Origem: ${warranty.store || '---'}`, 14, 110);
    doc.text(`Data de Compra: ${formatDate(warranty.purchase_date)}`, 14, 115);
    doc.text(`Valor Original: R$ ${Number(warranty.price || 0).toLocaleString('pt-BR')}`, 14, 120);

    doc.setFontSize(14);
    doc.text('3. HISTÓRICO DE MANUTENÇÃO (PROVA DE CUIDADO)', 14, 135);
    const tableData = logs.map(l => [formatDate(l.date), l.description, `R$ ${Number(l.cost).toLocaleString('pt-BR')}`]);
    autoTable(doc, {
      startY: 140,
      head: [['Data', 'Serviço Realizado', 'Investimento']],
      body: tableData.length > 0 ? tableData : [['---', 'Nenhuma manutenção registrada', '---']],
      headStyles: { fillColor: [15, 23, 42] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('4. RECOMENDAÇÕES TÉCNICAS (IA)', 14, finalY);
    doc.setFontSize(10);
    doc.text(warranty.care_tips || 'Nenhuma dica processada.', 14, finalY + 10, { maxWidth: 180 });

    doc.save(`dossie-juridico-${warranty.name}.pdf`);
    toast.success('Dossiê Jurídico gerado com sucesso!');
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLog(true);
    try {
      const { error } = await supabase.from('maintenance_logs').insert({
        warranty_id: id,
        description: newLog.description,
        cost: Number(newLog.cost) || 0,
        date: newLog.date
      });
      if (error) throw error;
      toast.success('Registro de manutenção adicionado!');
      setNewLog({ description: '', cost: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err: any) {
      toast.error('Erro ao salvar log.');
    } finally {
      setAddingLog(false);
    }
  };

  const deleteLog = async (logId: string) => {
    const { error } = await supabase.from('maintenance_logs').delete().eq('id', logId);
    if (!error) {
      toast.success('Registro removido.');
      fetchData();
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const expirationDate = calculateExpirationDate(warranty.purchase_date, warranty.warranty_months);
  const daysRemaining = getDaysRemaining(expirationDate);
  const isExpired = daysRemaining < 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 font-bold mb-4">
          <ArrowLeft className="h-4 w-4" /> Painel Geral
        </Button>
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {isExpired ? 'Expirada' : 'Protegida'}
            </div>
          </div>
          <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Categoria Geral'}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}>
            <Button variant="outline" className="gap-2 border-teal-100 font-bold">
              <Pencil className="h-4 w-4" /> Editar
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-none bg-white shadow-sm p-4"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pago</p><p className="text-base font-black text-slate-900">R$ {Number(warranty.price || 0).toLocaleString('pt-BR')}</p></Card>
            <Card className="border-none bg-white shadow-sm p-4"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Economia</p><p className="text-base font-black text-pink-600">R$ {Number(warranty.total_saved || 0).toLocaleString('pt-BR')}</p></Card>
            <Card className="border-none bg-white shadow-sm p-4"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Manutenção</p><p className="text-base font-black text-cyan-600">R$ {logs.reduce((acc, curr) => acc + Number(curr.cost), 0).toLocaleString('pt-BR')}</p></Card>
            <Card className="border-none bg-white shadow-sm p-4"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p><p className={`text-base font-black ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>{isExpired ? 'Expirada' : 'Ativa'}</p></Card>
          </div>

          <Card className="border-none shadow-xl">
            <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between p-6">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <History className="h-5 w-5 text-emerald-600" /> Diário de Vida do Produto
              </CardTitle>
              <Button size="sm" onClick={() => setAddingLog(!addingLog)} className="h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest">
                {addingLog ? 'Fechar' : 'Novo Registro'}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {addingLog && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddLog} 
                    className="mb-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-4 overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="O que foi feito?" placeholder="Ex: Limpeza técnica, troca de bateria" value={newLog.description} onChange={(e) => setNewLog({...newLog, description: e.target.value})} required />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Custo (R$)" type="number" step="0.01" value={newLog.cost} onChange={(e) => setNewLog({...newLog, cost: e.target.value})} />
                        <Input label="Data" type="date" value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} required />
                      </div>
                    </div>
                    <Button type="submit" disabled={addingLog} className="w-full">Salvar no Histórico</Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium italic">Nenhum registro de manutenção ainda.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-teal-50 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{log.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-emerald-800"><Sparkles className="h-5 w-5" /> Inteligência do Guardião</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-6 pt-0">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 italic text-emerald-800 font-medium leading-relaxed">
                "{warranty.care_tips || 'A IA ainda não processou dicas para este produto.'}"
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Proteção Ativa</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-emerald-400 uppercase"><span>Vencimento</span><span>{isExpired ? 'Expirado' : `${daysRemaining} dias`}</span></div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, (daysRemaining / (warranty.warranty_months * 30)) * 100))}%` }} />
                </div>
              </div>
              <Link href={`/insurance/simulator/${warranty.id}`} className="block">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 gap-2 font-black text-xs uppercase tracking-widest py-4"><Umbrella className="h-4 w-4" /> Simular Seguro</Button>
              </Link>
              {warranty.invoice_url && (
                <a href={warranty.invoice_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 border border-white/10">Abrir Nota Fiscal <ExternalLink className="h-4 w-4" /></a>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-500/20 space-y-4 relative overflow-hidden">
            <Scale className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 -rotate-12" />
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-2 rounded-xl"><Scale className="h-5 w-5 text-white" /></div>
              <h4 className="text-xl font-black leading-tight text-white">Dossiê Jurídico</h4>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">Gere um documento formal com selo de verificação para apresentar ao Procon ou Pequenas Causas.</p>
            <Button onClick={generateLegalPDF} variant="ghost" className="w-full bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest py-4">Gerar Dossiê Jurídico</Button>
            {!profile?.is_premium && <p className="text-[8px] text-center text-amber-400 font-black uppercase tracking-tighter">Recurso Exclusivo Plano Pro</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
