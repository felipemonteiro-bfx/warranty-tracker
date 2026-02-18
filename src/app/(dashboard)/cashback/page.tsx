'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Loader2, ExternalLink, Gift, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Mock de parceiros
const MOCK_PARTNERS = [
  { id: '1', name: 'Amazon', cashback: 5, logo: '🛒', category: 'Eletrônicos' },
  { id: '2', name: 'Mercado Livre', cashback: 3, logo: '📦', category: 'Marketplace' },
  { id: '3', name: 'Magazine Luiza', cashback: 4, logo: '🛍️', category: 'Varejo' },
  { id: '4', name: 'Americanas', cashback: 2, logo: '🏪', category: 'Variedades' },
];

export default function CashbackPage() {
  const [loading] = useState(false);
  const balance = 0; // Mock
  const pending = 0;

  const handlePartnerClick = (p: { name: string; cashback: number }) => {
    toast.info(`Cashback de ${p.cashback}% em ${p.name} — em breve!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Cashback <span className="text-emerald-600">Parceiros</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Compre nas lojas parceiras via link do Guardião e ganhe créditos para descontos na assinatura Pro.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-slate-500">Saldo Disponível</CardTitle>
            </div>
            <p className="text-4xl font-black text-emerald-600">
              R$ {balance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Use em descontos Pro</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-8 w-8 text-amber-600" />
              <CardTitle className="text-sm font-bold text-slate-500">Pendente</CardTitle>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              R$ {pending.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Lojas Parceiras</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_PARTNERS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card
                className="border-none shadow-lg cursor-pointer hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                onClick={() => handlePartnerClick(p)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-3xl">{p.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">{p.cashback}%</p>
                    <p className="text-[10px] text-slate-500">cashback</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-xl bg-slate-900 text-white p-8">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-12 w-12 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold">Garantia automática</h3>
            <p className="text-slate-400 text-sm">Compre pela loja parceira e sua garantia é cadastrada automaticamente no Guardião.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
