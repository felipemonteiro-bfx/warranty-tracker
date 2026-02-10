'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Landmark, ShieldCheck, Zap, Search, Plus, Loader2, ArrowRight, CheckCircle2, ShoppingCart, Smartphone, Laptop, Tv, Coffee, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function OpenFinanceImportPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);
  const router = useRouter();

  const simulateConnection = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
      toast.success('Conexão segura estabelecida!');
    }, 2500);
  };

  const simulateScan = () => {
    setLoading(true);
    setTimeout(() => {
      setDetectedItems([
        { id: 't1', name: 'iPhone 15 Pro', store: 'Apple SP', price: 7200, date: '2025-01-10', icon: <Smartphone className="h-5 w-5" /> },
        { id: 't2', name: 'Smart TV 55"', store: 'Amazon Brasil', price: 3500, date: '2024-12-15', icon: <Tv className="h-5 w-5" /> },
        { id: 't3', name: 'Nespresso Vertuo', store: 'Nespresso', price: 890, date: '2025-02-05', icon: <Coffee className="h-5 w-5" /> },
      ]);
      setStep(3);
      setLoading(false);
      toast.success('3 novos ativos detectados no seu extrato!');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Smart <span className="text-emerald-600">Import</span></h1>
        <p className="text-slate-500 font-medium">Detecte compras de bens duráveis automaticamente via extrato bancário.</p>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden text-center p-12 space-y-8">
              <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[40px] flex items-center justify-center mx-auto shadow-xl">
                <Landmark className="h-12 w-12 text-emerald-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Conecte seu Banco</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Use a tecnologia Open Finance para escanear compras passadas e organizar seu cofre sem digitar nada.</p>
              </div>
              <Button onClick={simulateConnection} disabled={loading} className="h-16 px-12 text-lg font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 gap-3">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                {loading ? 'Estabelecendo Conexão...' : 'Conectar via Open Finance'}
              </Button>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criptografia de ponta a ponta AES-256</p>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-none shadow-2xl bg-slate-900 text-white p-12 text-center space-y-8">
              <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500 animate-pulse">
                <Search className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Analisando Transações</h3>
                <p className="text-slate-400 font-medium">Nossa IA está procurando por compras de eletrônicos, móveis e outros bens de valor nos últimos 12 meses...</p>
              </div>
              {!loading && (
                <Button onClick={simulateScan} className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-10">Iniciar Varredura IA</Button>
              )}
              {loading && <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />}
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" /> Ativos Detectados (Prontos para o Cofre)
            </h3>
            <div className="grid gap-4">
              {detectedItems.map((item) => (
                <Card key={item.id} className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group hover:scale-[1.01] transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.store} • {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-lg font-black text-slate-900 dark:text-white">R$ {item.price.toLocaleString('pt-BR')}</p>
                      <Button className="h-12 px-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest gap-2">
                        <Plus className="h-4 w-4" /> Importar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center pt-6">
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Pular por enquanto</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-2xl bg-emerald-600 text-white p-10 relative overflow-hidden group">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><ShieldCheck className="h-48 w-48 text-white" /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-black leading-tight uppercase tracking-tighter">Privacidade em <span className="text-emerald-100">Primeiro Lugar.</span></h3>
            <p className="text-emerald-50 text-sm font-medium leading-relaxed max-w-xl">O Guardião não armazena sua senha bancária. A conexão é feita via APIs oficiais do Banco Central e o acesso é apenas para leitura de transações específicas.</p>
          </div>
          <Button variant="ghost" className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl border-none">Ler Termos de Segurança</Button>
        </div>
      </Card>
    </div>
  );
}
