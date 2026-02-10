'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, ArrowUpRight, ShoppingCart, Tag } from 'lucide-center';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addMonths, parseISO, isAfter } from 'date-fns';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addingLog, setAddingLog] = useState(false);
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  // Simulação de recomendações inteligentes baseadas na categoria
  const recommendations = [
    { title: 'Capa de Proteção Premium', price: 'R$ 89,90', icon: <ShieldCheck className="h-4 w-4" /> },
    { title: 'Kit de Limpeza Especializado', price: 'R$ 45,00', icon: <Sparkles className="h-4 w-4" /> },
    { title: 'Extensão de Garantia +1 Ano', price: 'R$ 199,00', icon: <Plus className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold"><Pencil className="h-4 w-4" /> Editar Ativo</Button></Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">{warranty.name}</h1>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">Patrimônio Ativo</div>
        </div>
        <p className="text-xl text-slate-500 font-medium">{warranty.category || 'Geral'} • {warranty.folder}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Marketplace Inteligente (Upgrade Center) */}
          <Card className="border-none shadow-xl bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10"><ShoppingCart className="h-32 w-32 text-emerald-600 rotate-12" /></div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" /> Melhore sua Experiência
              </CardTitle>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Sugestões para o seu {warranty.name}</h3>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      {rec.icon}
                    </div>
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-tight mb-1">{rec.title}</p>
                    <p className="text-xs font-bold text-emerald-600">{rec.price}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase text-center mt-4">Ofertas exclusivas para membros do Guardião de Notas</p>
            </CardContent>
          </Card>

          {/* Histórico de Manutenção */}
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="border-b border-slate-50 p-6"><CardTitle className="flex items-center gap-2 text-slate-900"><History className="h-5 w-5 text-emerald-600" /> Diário de Vida do Bem</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {logs.length === 0 ? <div className="text-center py-8 text-slate-400 italic">Nenhum registro.</div> : logs.map((log) => (<div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 border border-teal-50 rounded-2xl group"><div className="flex items-center gap-4"><div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 className="h-5 w-5" /></div><div><p className="text-sm font-black text-slate-800">{log.description}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(log.date)} • R$ {Number(log.cost).toLocaleString('pt-BR')}</p></div></div></div>))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Pago Original</p><div className="text-4xl font-black text-white mt-1">R$ {Number(warranty.price || 0).toLocaleString('pt-BR')}</div>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
            <Umbrella className="h-8 w-8 opacity-20" /><h4 className="text-xl font-black leading-tight text-white">Seguro Inteligente</h4><p className="text-xs font-medium text-emerald-100">Proteja este bem contra danos e imprevistos com nossa simulação instantânea.</p>
            <Link href={`/insurance/simulator/${warranty.id}`} className="block"><Button variant="ghost" className="w-full bg-white text-emerald-700 font-black text-[10px] uppercase py-4">Simular Seguro</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from 'lucide-react';