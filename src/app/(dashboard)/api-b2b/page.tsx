'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Code2, Loader2, Key, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function APIB2BPage() {
  const [copied, setCopied] = useState(false);
  const [apiKey] = useState('gk_xxxxxxxxxxxxxxxxxxxx'); // Mock

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('API Key copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          API <span className="text-emerald-600">B2B</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Para assistências técnicas e lojas: consulte garantia por número de série ou NF-e. Plano Enterprise: R$ 99/mês por CNPJ.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <Code2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Endpoints (em breve)</h2>
            <ul className="text-sm text-slate-500 space-y-1 mt-1">
              <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /api/v1/warranty?serial=XXX</code></li>
              <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /api/v1/warranty?nfe=XXX</code></li>
              <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">POST /api/v1/validate</code> — Validação automática de cobertura</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Sua API Key (simulada)</p>
          <div className="flex items-center gap-2">
            <Input readOnly value={apiKey} className="font-mono bg-transparent border-none" />
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-lg bg-slate-900 text-white p-8">
        <div className="flex items-center gap-4">
          <Key className="h-12 w-12 text-emerald-400" />
          <div>
            <h3 className="font-bold">Plano Enterprise</h3>
            <p className="text-slate-400 text-sm">R$ 99/mês por CNPJ. Consultas ilimitadas. Validação de garantia em tempo real.</p>
          </div>
          <Button variant="outline" className="ml-auto border-white/30 text-white hover:bg-white/10">
            Entrar em contato
          </Button>
        </div>
      </Card>

      <p className="text-center text-xs text-slate-500">
        API em desenvolvimento. Documentação OpenAPI em breve.
      </p>
    </div>
  );
}
