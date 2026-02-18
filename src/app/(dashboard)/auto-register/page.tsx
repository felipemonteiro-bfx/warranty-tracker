'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Loader2, Copy, Check, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MOCK_EMAIL = 'cadastro@guardiao.app';

export default function AutoRegisterPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_EMAIL);
    setCopied(true);
    toast.success('E-mail copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Auto-<span className="text-emerald-600">Cadastro</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Encaminhe e-mails de confirmação de compra e cadastramos suas garantias automaticamente — zero cliques.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-1.5 w-full bg-emerald-500" />
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Mail className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Como funciona</h2>
              <p className="text-slate-500 text-sm">Envie o e-mail de confirmação da Amazon, Mercado Livre, etc. para o endereço abaixo.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Seu endereço exclusivo</p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={MOCK_EMAIL}
                className="font-mono text-lg bg-transparent border-none"
              />
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">✓ Extração automática via Gemini</li>
            <li className="flex items-center gap-2">✓ Loja, produto, valor e data</li>
            <li className="flex items-center gap-2">✓ NF-e anexada ao cofre</li>
          </ul>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Em breve: Webhook em produção. Por enquanto, o endereço é simulado.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-900/50 p-8">
        <div className="flex items-center gap-4">
          <Inbox className="h-12 w-12 text-slate-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Lojas suportadas (planejado)</h3>
            <p className="text-sm text-slate-500">Amazon, Mercado Livre, Magazine Luiza, Americanas, Casas Bahia...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
