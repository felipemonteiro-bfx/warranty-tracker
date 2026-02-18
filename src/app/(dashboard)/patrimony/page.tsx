'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Landmark, TrendingUp, PieChart as PieIcon, Loader2, ArrowUpRight, Package, TrendingDown, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// Depreciação estimada por categoria (eletrônicos depreciam mais rápido)
const DEPRECIATION_RATE: Record<string, number> = {
  eletrônico: 0.15,
  celular: 0.25,
  computador: 0.2,
  tv: 0.18,
  eletrodoméstico: 0.08,
  móvel: 0.05,
  default: 0.12,
};

export default function PatrimonyPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('warranties').select('*');
      if (data) setItems(data);
    }
    setLoading(false);
  };

  const totalValue = items.reduce((acc, curr) => acc + Number(curr.estimated_sale_value || curr.price || 0), 0);

  const byCategory = items.reduce<Record<string, number>>((acc, curr) => {
    const cat = (curr.category || 'Outros').toLowerCase();
    const val = Number(curr.estimated_sale_value || curr.price || 0);
    acc[cat] = (acc[cat] || 0) + val;
    return acc;
  }, {});

  const chartData = Object.entries(byCategory)
    .map(([name, value]) => ({ name: name.slice(0, 12), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const depreciation = items.reduce((acc, curr) => {
    const cat = (curr.category || '').toLowerCase();
    let rate = DEPRECIATION_RATE.default;
    for (const [key, r] of Object.entries(DEPRECIATION_RATE)) {
      if (key !== 'default' && cat.includes(key)) { rate = r; break; }
    }
    const val = Number(curr.estimated_sale_value || curr.price || 0);
    return acc + val * rate;
  }, 0);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  const formatCurrency = (v: number | undefined) => (v != null ? `R$ ${v.toLocaleString('pt-BR')}` : '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            Patrimônio <span className="text-emerald-600">Consolidado</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Visão financeira completa do seu inventário durável.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20">
          <Landmark className="h-4 w-4" /> {items.length} itens
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <Landmark className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-500">Valor Total</CardTitle>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              R$ {totalValue.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Soma de valor estimado de revenda</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-500">Depreciação Est.</CardTitle>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              R$ {depreciation.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Estimativa anual por categoria</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-500">Líquido Estimado</CardTitle>
            </div>
            <p className="text-4xl font-black text-emerald-600">
              R$ {(totalValue - depreciation).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Após depreciação anual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <PieIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-xl uppercase tracking-tighter">Por Categoria</CardTitle>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatCurrency} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Cadastre itens para ver o gráfico
              </div>
            )}
          </div>
        </Card>

        <Card className="border-none shadow-xl p-8 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl uppercase tracking-tighter">Top Categorias</CardTitle>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={formatCurrency} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Cadastre itens para ver o gráfico
              </div>
            )}
          </div>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Link href="/vault">
          <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
            Ver Cofre Completo <ArrowUpRight className="h-5 w-5 ml-2 inline" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
