'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileWarning, Loader2, Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ClaimsWorkflowPage() {
  const [claims] = useState<any[]>([]); // Mock vazio

  const handleNewClaim = () => {
    toast.info('Abrir sinistro — em breve! O workflow gerará PDF, texto para Procon e rastreará prazos.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            Workflow de <span className="text-emerald-600">Sinistros</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Abra um sinistro e o sistema gera PDF com documentos, texto para Procon/consumidor.gov.br e rastreia prazos legais.
          </p>
        </div>
        <Button onClick={handleNewClaim} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" /> Novo Sinistro
        </Button>
      </header>

      <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
            <FileWarning className="h-12 w-12 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quando abrir um sinistro</h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" /> PDF com NF, fotos e histórico de manutenção</li>
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" /> Texto de reclamação via IA (Procon/consumidor.gov.br)</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> Rastreamento: 5 dias para resposta, 30 dias para solução</li>
            </ul>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Seus sinistros</h2>
        {claims.length === 0 ? (
          <Card className="border-none shadow-xl p-12 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum sinistro aberto.</p>
            <Button variant="outline" className="mt-4" onClick={handleNewClaim}>
              Abrir primeiro sinistro
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {claims.map((c) => (
              <Card key={c.id} className="border-none shadow-lg">
                <CardContent className="p-4">{c.name}</CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        Workflow automatizado em desenvolvimento. CDC e prazos legais serão aplicados.
      </p>
    </div>
  );
}
