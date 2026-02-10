'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generatingDossier, setGeneratingDossier] = useState(false);
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

  const generateTechnicalDossier = () => {
    if (!profile?.is_premium) {
      toast.error('Dossiê Técnico é um recurso Pro!');
      return;
    }
    setGeneratingDossier(true);
    try {
      const doc = new jsPDF();
      doc.setFillColor(5, 150, 105); // Verde Esmeralda
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.text('DOSSIÊ TÉCNICO DE MANUTENÇÃO', 14, 25);
      doc.setFontSize(10); doc.text(`Equipamento: ${warranty.name} | S/N: ${warranty.serial_number || '---'}`, 14, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14); doc.text('Histórico de Intervenções e Revisões', 14, 55);
      
      const tableData = logs.map(l => [
        formatDate(l.date),
        l.description,
        `R$ ${Number(l.cost).toLocaleString('pt-BR')}`,
        'CERTIFICADO'
      ]);

      autoTable(doc, {
        startY: 60,
        head: [['Data', 'Serviço / Manutenção', 'Investimento', 'Status']],
        body: tableData.length > 0 ? tableData : [['---', 'Nenhuma manutenção registrada', '---', '---']],
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12); doc.text('Resumo de Investimento em Conservação', 14, finalY);
      const totalInvested = logs.reduce((acc, curr) => acc + Number(curr.cost), 0);
      doc.setFontSize(10); doc.text(`Total investido em manutenções: R$ ${totalInvested.toLocaleString('pt-BR')}`, 14, finalY + 8);

      doc.save(`dossie-tecnico-${warranty.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success('Dossiê técnico gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar documento.');
    } finally {
      setGeneratingDossier(false);
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
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none dark:text-white uppercase">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Auditado</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card de Dossiê Técnico */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
            <div className="h-2 w-full bg-emerald-500" />
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <Hammer className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Dossiê de Manutenção</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">Exporte o histórico técnico completo de todas as revisões e melhorias feitas neste item.</p>
                </div>
              </div>
              <Button 
                onClick={generateTechnicalDossier} 
                disabled={generatingDossier}
                className="bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-14 px-8 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none gap-2 shrink-0"
              >
                {generatingDossier ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generatingDossier ? 'Gerando Relatório...' : 'Baixar Dossiê Pro'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Histórico Evolutivo</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • Investimento: R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-3xl text-slate-300 font-bold uppercase text-[10px]">Nenhum evento técnico registrado.</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valor Líquido Atual</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
            <p className="text-[9px] text-emerald-500 mt-4 italic">Auditado via selo de integridade Guardião.</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção Ativa</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Não deixe seu patrimônio descoberto. Ative um seguro residencial ou de portáteis hoje.</p>
            <Link href="/plans" className="block"><Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Opções de Seguro</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}