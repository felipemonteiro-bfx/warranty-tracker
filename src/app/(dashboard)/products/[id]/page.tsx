'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren, Hammer, Gavel, Scale as ScaleIcon } from 'lucide-react';
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

  const generateLegalDossier = () => {
    if (!profile?.is_premium) {
      toast.error('O Dossiê Jurídico é exclusivo para membros Pro!');
      return;
    }
    setGeneratingDossier(true);
    try {
      const doc = new jsPDF();
      const integrityHash = `GRD-JEC-${id.substring(0, 8).toUpperCase()}`;

      // Capa Jurídica
      doc.setFillColor(30, 41, 59); // Dark Slate
      doc.rect(0, 0, 210, 50, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.text('DOSSIÊ PROBATÓRIO JURÍDICO', 14, 25);
      doc.setFontSize(10); doc.text('DOCUMENTO AUXILIAR PARA AÇÕES DE CONSUMIDOR (JEC / PROCON)', 14, 35);
      doc.text(`Protocolo de Auditoria: ${integrityHash}`, 14, 42);

      // Dados do Reclamante
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14); doc.text('1. Identificação das Partes', 14, 65);
      const partsData = [
        ['Consumidor', profile?.full_name || '---'],
        ['CPF', profile?.cpf || '---'],
        ['Produto Reclamado', warranty.name],
        ['Fornecedor / Loja', warranty.store || 'Verificar Nota Fiscal'],
        ['Nota Fiscal / Chave', warranty.nfe_key || 'Anexo Probatório']
      ];
      autoTable(doc, { startY: 70, body: partsData, theme: 'plain', styles: { fontSize: 10 } });

      // Histórico de Fatos
      doc.setFontSize(14); doc.text('2. Linha do Tempo e Evidências', 14, (doc as any).lastAutoTable.finalY + 15);
      const eventData = logs.map(l => [formatDate(l.date), l.description, 'Fato Comprovado']);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Evento / Tentativa de Solução', 'Natureza da Prova']],
        body: eventData.length > 0 ? eventData : [['---', 'Nenhuma tentativa de solução registrada no sistema', '---']],
        headStyles: { fillColor: [30, 41, 59] }
      });

      // Embasamento
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('3. Declaração de Integridade', 14, finalY);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('O Sistema Guardião de Notas certifica que os dados acima foram inseridos e auditados digitalmente.', 14, finalY + 8);
      doc.text('Este documento possui fé pública digital e serve como sumário probatório de posse e cuidado.', 14, finalY + 14);

      doc.save(`dossie-juridico-${warranty.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success('Dossiê Jurídico gerado! Pronto para o JEC.');
    } catch (err) {
      toast.error('Erro ao gerar dossiê.');
    } finally {
      setGeneratingDossier(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Painel</button>
        <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar</Button></Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none dark:text-white uppercase">{warranty.name}</h1>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          {/* NOVO: Card de Dossiê Jurídico (Small Claims Helper) */}
          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Gavel className="h-48 w-48 text-emerald-500 rotate-12" /></div>
            <CardContent className="p-10 relative z-10 space-y-8">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <ScaleIcon className="h-4 w-4" /> Proteção de Direitos
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black leading-tight">Dossiê para o <span className="text-emerald-400">Pequenas Causas</span>.</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">Vai processar o fabricante? Gere o dossiê probatório completo com nota fiscal, histórico de manutenções e auditoria digital para agilizar sua ação judicial.</p>
              </div>
              <Button 
                onClick={generateLegalDossier} 
                disabled={generatingDossier}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-emerald-900/20 gap-2"
              >
                {generatingDossier ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generatingDossier ? 'Redigindo Dossiê...' : 'Gerar Prova Jurídica Pro'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Histórico Consolidado</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-teal-50 dark:border-white/5 shadow-xl p-8 relative overflow-hidden">
            <TrendingDown className="h-8 w-8 text-red-100 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Mercado</p>
            <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
            <p className="text-[9px] text-emerald-600 font-black uppercase mt-4 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Auditado pelo Guardião</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Seguro Ativo</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Este bem está protegido sob custódia digital. Gere certificados para seguradoras em segundos.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Certificados</Button>
          </div>
        </div>
      </div>
    </div>
  );
}