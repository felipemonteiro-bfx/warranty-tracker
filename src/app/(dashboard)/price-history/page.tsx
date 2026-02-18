'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Loader2, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mock de valor de revenda (simula integração com Buscapé/Google Shopping)
function mockMarketValue(price: number, category: string): { current: number; trend: 'up' | 'down' | 'stable' } {
  const cat = (category || '').toLowerCase();
  let factor = 0.7;
  if (cat.includes('celular') || cat.includes('iphone')) factor = 0.85;
  if (cat.includes('tv') || cat.includes('eletrônico')) factor = 0.65;
  const current = Math.round(price * factor * (0.9 + Math.random() * 0.2));
  const r = Math.random();
  const trend = r > 0.6 ? 'up' : r < 0.3 ? 'down' : 'stable';
  return { current, trend };
}

export default function PriceHistoryPage() {
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

  const itemsWithMarket = items
    .filter((i) => Number(i.price || i.estimated_sale_value) > 0)
    .map((i) => {
      const price = Number(i.price || i.estimated_sale_value);
      const market = mockMarketValue(price, i.category || '');
      return { ...i, price, market };
    })
    .sort((a, b) => b.market.current - a.market.current);

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
          Histórico de <span className="text-emerald-600">Preços</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Valor estimado de revenda no mercado (mock). Integração futura com Buscapé e Google Shopping.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Valores simulados</h3>
            <p className="text-sm text-slate-500">Os preços de mercado são estimativas. APIs reais em desenvolvimento.</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Seus produtos no mercado</h2>
        {itemsWithMarket.length === 0 ? (
          <Card className="border-none shadow-xl p-12 text-center">
            <p className="text-slate-500 font-medium">Nenhum produto com valor cadastrado.</p>
            <Link href="/products/new">
              <Button className="mt-4">Cadastrar Produto</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {itemsWithMarket.slice(0, 15).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/products/${item.id}`}>
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          Compra: R$ {item.price.toLocaleString('pt-BR')} • Mercado: R$ {item.market.current.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.market.trend === 'up' && <ArrowUp className="h-5 w-5 text-emerald-600" />}
                        {item.market.trend === 'down' && <ArrowDown className="h-5 w-5 text-amber-600" />}
                        <span className={`text-sm font-bold ${item.market.trend === 'up' ? 'text-emerald-600' : item.market.trend === 'down' ? 'text-amber-600' : 'text-slate-500'}`}>
                          {item.market.trend === 'up' ? 'Valorizando' : item.market.trend === 'down' ? 'Desvalorizando' : 'Estável'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
