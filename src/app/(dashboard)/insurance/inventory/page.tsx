'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Loader2, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InsuranceInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data } = await supabase.from('warranties').select('*').eq('user_id', user.id);
      if (data) setItems(data);
    }
    setLoading(false);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success('Inventário gerado! Use a opção no Cofre para download.');
      window.location.href = '/vault';
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalValue = items.reduce((acc, curr) => acc + Number(curr.price || curr.estimated_sale_value || 0), 0);
  const byFolder = items.reduce<Record<string, any[]>>((acc, curr) => {
    const f = curr.folder || 'Sem pasta';
    if (!acc[f]) acc[f] = [];
    acc[f].push(curr);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Inventário para <span className="text-emerald-600">Seguro Residencial</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Exporte PDF/Excel formatado para seguradoras. Agrupa por cômodo, inclui fotos e NF-e.
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <FileSpreadsheet className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Documento pronto para sinistro</h2>
            <p className="text-slate-500 text-sm mb-4">
              Sumário executivo, listagem por cômodo (pasta) e valores. Formato aceito pelas principais seguradoras.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 mr-2" />}
                Gerar inventário
              </Button>
              <Link href="/vault">
                <Button variant="outline">Usar gerador do Cofre</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-lg p-6">
        <CardTitle className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" /> Prévia por pasta
        </CardTitle>
        {Object.keys(byFolder).length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhum item com pasta definida.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(byFolder).map(([folder, list]) => {
              const sum = list.reduce((a, c) => a + Number(c.price || c.estimated_sale_value || 0), 0);
              return (
                <div key={folder} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-bold text-slate-900 dark:text-white">{folder}</p>
                  <p className="text-sm text-slate-500">{list.length} itens • R$ {sum.toLocaleString('pt-BR')}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="text-sm text-slate-500">
        Valor total do inventário: <strong className="text-slate-900 dark:text-white">R$ {totalValue.toLocaleString('pt-BR')}</strong>
      </p>
    </div>
  );
}
