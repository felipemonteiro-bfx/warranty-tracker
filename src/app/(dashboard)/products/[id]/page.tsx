'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock, Sparkles, NotebookPen, HeartHandshake, ArrowLeft, Pencil, History, Plus, Loader2, Trash2, Umbrella, Scale, CalendarPlus, TrendingDown, Wrench, CheckCircle2, AlertTriangle, Key, Globe, CreditCard, ArrowUpRight, CircleDot } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining, generateICalLink } from '@/lib/utils/date-utils';
import Link from 'next/navigation';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addMonths, parseISO, isAfter } from 'date-fns';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [addingLog, setAddingLog] = useState(false);
  const [warranty, setWarranty] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
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

  const calculateDepreciation = () => {
    const price = Number(warranty.price || 0);
    if (price === 0) return 0;
    const purchaseDate = new Date(warranty.purchase_date);
    const yearsOwned = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return price * 0.9 * Math.pow(0.85, yearsOwned);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLog(true);
    try {
      const { error } = await supabase.from('maintenance_logs').insert({ warranty_id: id, description: newLog.description, cost: Number(newLog.cost) || 0, date: newLog.date });
      if (error) throw error;
      await supabase.from('warranties').update({ last_maintenance_date: newLog.date }).eq('id', id);
      toast.success('Histórico atualizado!');
      setNewLog({ description: '', cost: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err: any) { toast.error('Erro ao salvar.'); } finally { setAddingLog(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;
  if (!warranty) notFound();

  const currentEstimatedValue = calculateDepreciation();
  const nextMaintenance = warranty.last_maintenance_date ? addMonths(parseISO(warranty.last_maintenance_date), warranty.maintenance_frequency_months || 6) : null;
  const isMaintenanceOverdue = nextMaintenance ? isAfter(new Date(), nextMaintenance) : false;

  // Organizar eventos para a Timeline
  const timelineEvents = [
    { date: warranty.purchase_date, title: 'Aquisição do Bem', desc: `Comprado na loja ${warranty.store || 'não informada'}`, icon: <Package className="h-4 w-4" />, type: 'purchase' },
    ...logs.map(l => ({ date: l.date, title: 'Manutenção realizada', desc: l.description, icon: <Wrench className="h-4 w-4" />, type: 'maintenance', cost: l.cost })),
    { date: calculateExpirationDate(warranty.purchase_date, warranty.warranty_months), title: 'Fim da Garantia de Fábrica', desc: 'A partir desta data, o produto não terá mais cobertura gratuita.', icon: <ShieldAlert className="h-4 w-4" />, type: 'expiry' }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Link href={`/products/edit/${warranty.id}`}><Button variant="outline" size="sm" className="gap-2 border-teal-100 font-bold"><Pencil className="h-4 w-4" /> Editar</Button></Link>
        </div>
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
          {/* Timeline de Vida do Patrimônio */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6"><CardTitle className="text-sm font-black uppercase text-slate-400 flex items-center gap-2"><History className="h-4 w-4 text-emerald-600" /> Linha do Tempo de Propriedade</CardTitle></CardHeader>
            <CardContent className="p-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-slate-200 before:to-slate-50">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                      {event.icon}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-black text-slate-900 text-sm">{event.title}</div>
                        <time className="font-bold text-[10px] text-emerald-600 uppercase whitespace-nowrap">{formatDate(event.date)}</time>
                      </div>
                      <div className="text-slate-500 text-xs font-medium">{event.desc}</div>
                      {event.cost && <div className="mt-2 text-[10px] font-black text-slate-900 uppercase">Investimento: R$ {Number(event.cost).toLocaleString('pt-BR')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-xl relative overflow-hidden ${isMaintenanceOverdue ? 'bg-amber-50' : 'bg-white'}`}>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${isMaintenanceOverdue ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><Wrench className="h-8 w-8" /></div>
                <div><p className="text-xs font-black uppercase text-slate-400 tracking-widest">Próxima Revisão</p><h3 className="text-2xl font-black text-slate-900">{nextMaintenance ? nextMaintenance.toLocaleDateString('pt-BR') : 'Não agendada'}</h3></div>
              </div>
              <Button onClick={() => setAddingLog(true)} variant="outline" className="border-teal-100 font-black text-xs uppercase tracking-widest px-6 h-12">Nova Manutenção</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 relative overflow-hidden shadow-2xl">
            <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor de Mercado Atual</p><div className="text-4xl font-black text-white mt-1">R$ {currentEstimatedValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Investimento Total</span>
                <span className="text-sm font-bold">R$ {(Number(warranty.price) + logs.reduce((a, b) => a + Number(b.cost), 0)).toLocaleString('pt-BR')}</span>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 font-black text-[10px] uppercase tracking-widest py-4 gap-2"><ArrowUpRight className="h-4 w-4" /> Anunciar Venda</Button>
            </div>
          </Card>
          
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl space-y-4 relative overflow-hidden">
            <Umbrella className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
            <h4 className="text-xl font-black leading-tight text-white">Proteção Residencial</h4>
            <p className="text-xs font-medium text-indigo-100 leading-relaxed">Inclua este bem em sua apólice de seguro e evite prejuízos com furtos ou danos elétricos.</p>
            <Link href={`/insurance/simulator/${warranty.id}`} className="block"><Button variant="ghost" className="w-full bg-white text-indigo-700 font-black text-[10px] uppercase py-4 shadow-lg shadow-indigo-900/20">Simular Proteção</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
