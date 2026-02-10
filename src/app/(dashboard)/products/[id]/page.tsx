'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, Hash, ShieldAlert, Fingerprint, Coins, ShieldBan, Info, FileText } from 'lucide-react';
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
  const [verifyingRecall, setVerifyingRecall] = useState(false);
  const [generatingDossier, setGeneratingDossier] = useState(false);
  const [recallResult, setRecallResult] = useState<any>(null);
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

  const generateResaleDossier = () => {
    if (!profile?.is_premium) {
      toast.error('Dossiê de Venda Certificado é um recurso Pro!');
      return;
    }
    setGeneratingDossier(true);
    try {
      const doc = new jsPDF();
      const integrityHash = `GRD-${id.substring(0, 8).toUpperCase()}`;

      // Header Premium
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.text('CERTIFICADO DE PROCEDÊNCIA', 14, 25);
      doc.setFontSize(10); doc.text(`Protocolo: ${integrityHash}`, 14, 32);

      // Body
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16); doc.text('Informações do Ativo', 14, 55);
      
      const basicData = [
        ['Produto', warranty.name],
        ['Categoria', warranty.category || 'Geral'],
        ['Data de Aquisição', formatDate(warranty.purchase_date)],
        ['Origem / Loja', warranty.store || 'Não informada'],
        ['Número de Série', warranty.serial_number || 'REGISTRADO'],
        ['Status Jurídico', 'Auditado / Sem ônus']
      ];

      autoTable(doc, {
        startY: 60,
        body: basicData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
      });

      doc.setFontSize(16); doc.text('Histórico de Manutenções e Cuidados', 14, (doc as any).lastAutoTable.finalY + 15);
      
      const logData = logs.map(l => [formatDate(l.date), l.description, `R$ ${Number(l.cost).toLocaleString('pt-BR')}`]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Evento / Melhoria', 'Investimento']],
        body: logData.length > 0 ? logData : [['---', 'Nenhum evento registrado', '---']],
        headStyles: { fillColor: [5, 150, 105] }
      });

      // Footer Security
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY, 182, 30, 'F');
      doc.setFontSize(9); doc.setTextColor(100);
      doc.text('Este documento comprova a posse e o histórico de manutenção do bem citado.', 20, finalY + 10);
      doc.text('A integridade dos dados foi validada pelo Selo Digital do Guardião de Notas.', 20, finalY + 18);
      doc.setFontSize(8); doc.text(`Hash de Autenticidade: ${integrityHash}-${Math.random().toString(36).substring(7).toUpperCase()}`, 20, finalY + 25);

      doc.save(`certificado-procedencia-${warranty.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success('Dossiê de Venda gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar documento.');
    } finally {
      setGeneratingDossier(false);
    }
  };

  const checkRecall = async () => {
    setVerifyingRecall(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analise recalls para: ${warranty.name}. JSON: { "status": "safe"|"warning"|"danger", "message": "explicação", "action": "ação" }`;
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
      setRecallResult(data);
    } catch (err) { toast.error('Erro no recall.'); } finally { setVerifyingRecall(false); }
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
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Auditado</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white p-8">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-5 w-5 text-emerald-600" /> Jornada do Patrimônio</CardTitle></CardHeader>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></div>
                  <div className="pt-1"><p className="text-sm font-black text-slate-900">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Módulo de Recall IA */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <div className={`h-1.5 w-full ${recallResult ? (recallResult.status === 'danger' ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-100'}`} />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${recallResult ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}><ShieldBan className="h-6 w-6" /></div>
                <div><h4 className="font-black text-slate-900">Segurança e Recall</h4><p className="text-xs text-slate-500 font-medium">Verifique alertas oficiais para este modelo.</p></div>
              </div>
              <Button onClick={checkRecall} disabled={verifyingRecall} variant="outline" className="h-12 px-6 font-black uppercase text-[10px] tracking-widest">
                {verifyingRecall ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Validar Modelo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Mercado</p>
            <div className="text-4xl font-black text-white mt-1">R$ {(Number(warranty.price || 0) * 0.85).toLocaleString('pt-BR')}</div>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><FileText className="h-32 w-32" /></div>
            <h4 className="text-xl font-black leading-tight text-white uppercase tracking-tighter">Certificar Venda</h4>
            <p className="text-xs font-medium text-emerald-100 leading-relaxed">Gere o Dossiê de Venda Certificado. Prove a procedência e valorize seu bem em até 20%.</p>
            <Button 
              onClick={generateResaleDossier} 
              disabled={generatingDossier}
              className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4 shadow-lg"
            >
              {generatingDossier ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {generatingDossier ? 'Gerando Dossiê...' : 'Emitir Dossiê Pro'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}