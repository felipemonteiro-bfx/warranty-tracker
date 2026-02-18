'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UsersRound, Loader2, UserPlus, Bell, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FamilySyncPage() {
  const [members] = useState<any[]>([]); // Mock

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            Sync <span className="text-emerald-600">Familiar</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Sincronização em tempo real entre membros. Permissões por pasta e feed de atividades.
          </p>
        </div>
        <Link href="/family">
          <Button variant="outline">Gerenciar Família</Button>
        </Link>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <UsersRound className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recursos</h2>
            <ul className="text-sm text-slate-500 space-y-1 mt-1">
              <li className="flex items-center gap-2"><Eye className="h-4 w-4" /> Visualizar / Editar / Deletar por pasta</li>
              <li className="flex items-center gap-2"><Bell className="h-4 w-4" /> Feed: &quot;Maria adicionou Geladeira ao Cofre da Cozinha&quot;</li>
              <li className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notificação cruzada em vencimentos</li>
            </ul>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 border-t border-border/50">
            <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum membro da família ainda.</p>
            <p className="text-sm text-slate-400 mt-1">Adicione membros em Família para ativar o sync.</p>
            <Link href="/family">
              <Button className="mt-4">Ir para Família</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="font-bold">{m.name}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                  {m.permission}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-slate-500">
        Sync bidirecional em desenvolvimento. Permissões granulares por pasta.
      </p>
    </div>
  );
}
