'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plane, ShieldCheck, FileDown, ArrowLeft, Loader2, CheckCircle2, QrCode, Smartphone, Camera, Laptop, Watch } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/lib/utils/date-utils';

export default function TravelModePage() {
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      const { data } = await supabase.from('warranties').select('*').order('name');
      if (data) setWarranties(data);
    }
    setLoading(false);
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const generateCustomsPDF = () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione ao menos um item para a mala.');
      return;
    }
    const doc = new jsPDF();
    const itemsToExport = warranties.filter(w => selectedItems.includes(w.id));

    doc.setFontSize(20); doc.setTextColor(15, 23, 42); doc.text('Declaração de Bens em Viagem Internacional', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Proprietário: ${profile?.full_name || '---'} | CPF: ${profile?.cpf || '---'}`, 14, 28);
    doc.text('Documento auxiliar para comprovação de procedência perante a Receita Federal.', 14, 33);

    const tableData = itemsToExport.map(w => [
      w.name,
      w.serial_number || 'Não informado',
      `R$ ${Number(w.price).toLocaleString('pt-BR')}`,
      formatDate(w.purchase_date),
      w.store || '---'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Item', 'Número de Série (S/N)', 'Valor Pago', 'Data Compra', 'Loja']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
      theme: 'grid'
    });

    doc.setFontSize(8);
    doc.text('Autenticado Digitalmente pelo Sistema Guardião de Notas', 14, (doc as any).lastAutoTable.finalY + 10);
    
    doc.save(`declaracao-alfandega-guardiao.pdf`);
    toast.success('Declaração para alfândega gerada!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full hover:bg-emerald-50"><ArrowLeft className="h-5 w-5 text-emerald-600" /></Button></Link>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Modo <span className="text-emerald-600">Viagem</span></h1>
          </div>
          <p className="text-slate-500 font-medium ml-11">Prepare sua mala e evite problemas com a alfândega brasileira.</p>
        </div>
        <Button onClick={generateCustomsPDF} className="gap-2 h-14 px-8 font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-200">
          <FileDown className="h-5 w-5" /> Gerar Guia Alfândega
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {warranties.map((w) => (
              <motion.div 
                key={w.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleItem(w.id)}
                className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${selectedItems.includes(w.id) ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border-teal-50 hover:border-emerald-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${selectedItems.includes(w.id) ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {w.category?.toLowerCase().includes('celular') ? <Smartphone className="h-6 w-6" /> : 
                     w.category?.toLowerCase().includes('foto') ? <Camera className="h-6 w-6" /> :
                     w.category?.toLowerCase().includes('note') ? <Laptop className="h-6 w-6" /> :
                     <Watch className="h-6 w-6" />}
                  </div>
                  {selectedItems.includes(w.id) && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{w.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">S/N: {w.serial_number || 'Não registrado'}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 p-8 opacity-10"><Plane className="h-32 w-32 text-white rotate-12" /></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> Checklist de Viagem
              </div>
              <h3 className="text-2xl font-black leading-tight">Sua mala está com <span className="text-emerald-400">{selectedItems.length}</span> itens.</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Levar a nota fiscal e o número de série registrado é a única forma de não pagar imposto ao trazer seus bens de volta para casa.</p>
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase text-slate-500">Valor Protegido na Mala</p>
                <p className="text-3xl font-black text-white mt-1">R$ {warranties.filter(w => selectedItems.includes(w.id)).reduce((acc, curr) => acc + Number(curr.price), 0).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </Card>

          <div className="p-8 rounded-[40px] bg-emerald-50 border-2 border-emerald-100 space-y-4">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><QrCode className="h-6 w-6" /></div>
            <h4 className="text-lg font-black text-slate-900">QR Code na Mala</h4>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">Dica Pro: Imprima pequenas etiquetas com QR Code do Guardião para colar nos seus equipamentos. Facilita a auditoria rápida na Receita.</p>
          </div>
        </div>
      </div>
    </div>
  );
}