'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldPlus, Loader2, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExtendedWarrantyPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('warranties').select('*').eq('user_id', user.id);
      if (data) setItems(data);
    }
    setLoading(false);
  };

  const handleSimulate = (item: any) => {
    toast.info(`Simulação de garantia estendida para ${item.name} — em breve!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Garantia <span className="text-emerald-600">Estendida</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Proteja seus bens além da garantia de fábrica. Parcerias com seguradoras — precificação dinâmica via IA.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
            <ShieldPlus className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Micro-Seguro sob medida</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Estenda a cobertura de eletrônicos, eletrodomésticos e mais. Comissão revertida em desconto para você.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Cobertura de 12 ou 24 meses</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Assitência técnica nacional</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Sinistro facilitado</li>
            </ul>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Seus produtos elegíveis</h2>
        {items.length === 0 ? (
          <Card className="border-none shadow-xl p-12 text-center">
            <p className="text-slate-500 font-medium">Nenhum produto cadastrado.</p>
            <Link href="/products/new">
              <Button className="mt-4">Cadastrar Produto</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 10).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.category || '---'} • R$ {(item.price || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <Button size="sm" onClick={() => handleSimulate(item)}>
                      Simular cobertura
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
