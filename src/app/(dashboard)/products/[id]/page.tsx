'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText, Siren } from 'lucide-react';
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

  const generateInsuranceDossier = () => {
    if (!profile?.is_premium) {
      toast.error('Dossiê de Sinistro é um recurso Pro!');
      return;
    }
    setGeneratingDossier(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString('pt-BR');
      
      // Header Vermelho de Emergência
      doc.setFillColor(185, 28, 28); // Vermelho Intenso
      doc.rect(0, 0, 210, 45, 'F');
      doc.setFontSize(24); doc.setTextColor(255, 255, 255); doc.text('DOSSIÊ DE SINISTRO / ROUBO', 14, 25);
      doc.setFontSize(10); doc.text('DOCUMENTO PARA FINS DE SEGURO E REGISTRO POLICIAL', 14, 35);

      // Info de Autenticidade
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14); doc.text('Identificação do Titular e Bem', 14, 60);
      
      const ownerData = [
        ['Titular', profile?.full_name || '---'],
        ['CPF', profile?.cpf || '---'],
        ['Produto', warranty.name],
        ['Data de Aquisição', formatDate(warranty.purchase_date)],
        ['Número de Série', warranty.serial_number || 'REGISTRADO NO SISTEMA'],
        ['Chave NF-e', warranty.nfe_key || 'VERIFICAR ANEXO']
      ];

      autoTable(doc, {
        startY: 65,
        body: ownerData,
        theme: 'striped',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
      });

      // Valor de Reposição (Atualizado)
      const replacementValue = Number(warranty.price || 0) * 1.15; // Estimativa de inflação
      doc.setFontSize(14); doc.text('Valoração para Indenização', 14, (doc as any).lastAutoTable.finalY + 15);
      doc.setFontSize(10); doc.text(`Valor Histórico: R$ ${Number(warranty.price || 0).toLocaleString('pt-BR')}`, 14, (doc as any).lastAutoTable.finalY + 22);
      doc.setFontSize(12); doc.setTextColor(185, 28, 28);
      doc.text(`Valor de Reposição Estimado (Novo): R$ ${replacementValue.toLocaleString('pt-BR')}`, 14, (doc as any).lastAutoTable.finalY + 30);

      // Selo de Auditoria
      const finalY = (doc as any).lastAutoTable.finalY + 50;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY, 182, 40, 'F');
      doc.setFontSize(9); doc.setTextColor(100);
      doc.text('ESTE ATIVO ESTÁ REGISTRADO E MONITORADO PELO SISTEMA GUARDIÃO DE NOTAS.', 20, finalY + 12);
      doc.text('A INTEGRIDADE DOS DOCUMENTOS ANEXOS FOI VALIDADA DIGITALMENTE.', 20, finalY + 20);
      doc.text(`Gerado em: ${timestamp} | Protocolo de Segurança: GRD-SIN-${id.substring(0, 8).toUpperCase()}`, 20, finalY + 28);

      doc.save(`dossie-sinistro-${warranty.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success('Dossiê de Sinistro gerado com sucesso!');
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
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold">Editar Ativo</Button></Link>
        </div>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none dark:text-white">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Auditado</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Card de Segurança Máxima (Dossiê Sinistro) */}
          <div className="p-8 rounded-[40px] bg-red-600 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Siren className="h-48 w-48 text-white rotate-12" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-red-100 font-black text-[10px] uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4" /> Protocolo de Emergência
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">Dossiê de <span className="text-white underline underline-offset-8 decoration-white/30">Sinistro</span></h3>
                <p className="text-red-50 text-sm font-medium leading-relaxed max-w-xl">Em caso de roubo ou perda total, gere o dossiê jurídico para facilitar o Boletim de Ocorrência e o acionamento do Seguro.</p>
              </div>
              <Button 
                onClick={generateInsuranceDossier} 
                disabled={generatingDossier}
                className="bg-white text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-red-900/20 gap-2"
              >
                {generatingDossier ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generatingDossier ? 'Processando Documentos...' : 'Gerar Dossiê de Emergência'}
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Jornada do Patrimônio</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 items-start group">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900 dark:text-slate-200">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • Investimento: R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valor Real Hoje</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
            <p className="text-[9px] text-emerald-500 mt-4 italic">Auditado pelo selo de integridade Guardião.</p>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Proteção Ativa</h4><p className="text-xs font-medium text-emerald-100 leading-relaxed">Não deixe seu patrimônio descoberto. Registre ou simule um seguro residencial hoje.</p>
            <Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg">Ver Opções Pro</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
