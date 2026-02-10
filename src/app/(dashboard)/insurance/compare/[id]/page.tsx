'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Umbrella, ArrowLeft, Loader2, Sparkles, CheckCircle2, MessageCircle, Info, ShieldCheck, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InsuranceComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase.from('warranties').select('*').eq('id', id).single();
    setProduct(data);
    setLoading(false);
  };

  const offers = [
    { name: 'Porto Seguro', price: 'R$ 42,90', type: 'Completo', highlight: 'Melhor Assistência', color: 'bg-blue-600' },
    { name: 'Azul Seguros', price: 'R$ 31,50', type: 'Essencial', highlight: 'Mais Econômico', color: 'bg-cyan-600' },
    { name: 'BB Seguros', price: 'R$ 38,00', type: 'Robusto', highlight: 'Selo de Confiança', color: 'bg-emerald-600' },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <Link href={`/products/${id}`}>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 font-bold mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Produto
        </Button>
      </Link>

      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-bounce">
          <Sparkles className="h-3 w-3" /> IA encontrou as melhores ofertas
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Compare e <span className="text-emerald-600">Proteja</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Selecionamos as melhores opções de seguro para o seu {product.name} baseados no valor de mercado atual.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {offers.map((offer, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full border-none shadow-2xl overflow-hidden flex flex-col hover:scale-105 transition-all duration-500 bg-white">
              <div className={`h-2 w-full ${offer.color}`} />
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md text-white ${offer.color}`}>
                    {offer.highlight}
                  </span>
                  <Umbrella className="h-5 w-5 text-slate-200" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{offer.name}</CardTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{offer.type}</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col space-y-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">{offer.price}</span>
                  <span className="text-slate-400 font-bold ml-1">/mês</span>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Roubo e Furto
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Danos Elétricos
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Queda Acidental
                  </div>
                </div>
                <Button className={`w-full h-14 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl ${offer.color} hover:opacity-90`}>
                  <MessageCircle className="h-4 w-4" /> Contratar via Corretor
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-10 glass rounded-[40px] border-2 border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8 bg-emerald-50/20">
        <div className="flex items-center gap-6 text-left">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Consultoria Guardião</h3>
            <p className="text-sm text-slate-500 font-medium">Nossa IA monitora as taxas do mercado diariamente para garantir que você pague o menor valor possível.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="bg-white text-emerald-700 font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-xl shadow-sm">Ver Outras 12 Opções</Button>
        </div>
      </div>
    </div>
  );
}
