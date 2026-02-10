import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, Package, Store, Calendar, DollarSign, FileCheck } from 'lucide-react';
import { formatDate, calculateExpirationDate } from '@/lib/utils/date-utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function TravelCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ items: string }>;
}) {
  const { items } = await searchParams;
  if (!items) notFound();

  const itemIds = items.split(',');
  const supabase = await createClient();
  
  const { data: warranties } = await supabase
    .from('warranties')
    .select('*')
    .in('id', itemIds);

  if (!warranties || warranties.length === 0) {
    notFound();
  }

  const logoUrl = "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
            <Image src={logoUrl} alt="Logo" fill className="object-cover" unoptimized />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manifesto Digital de Bens</h1>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-2">
              <FileCheck className="h-4 w-4" /> Autenticidade Verificada pelo Guardião
            </p>
          </div>
        </header>

        <div className="grid gap-6">
          {warranties.map((item) => (
            <Card key={item.id} className="border-none shadow-lg overflow-hidden group">
              <div className="h-2 w-full bg-emerald-500" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category || 'Categoria não informada'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Store className="h-3 w-3" /> Loja</p>
                        <p className="text-sm font-bold text-slate-700">{item.store || '---'}</p>
                      </div>
                      <div className="space-y-1 text-right md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 md:justify-start justify-end"><Calendar className="h-3 w-3" /> Compra</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(item.purchase_date)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><DollarSign className="h-3 w-3" /> Valor de Nota</p>
                        <p className="text-sm font-bold text-slate-700">R$ {Number(item.price || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="space-y-1 text-right md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 md:justify-start justify-end"><ShieldCheck className="h-3 w-3" /> Status</p>
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">Documentado</p>
                      </div>
                    </div>
                  </div>
                  {item.invoice_url && (
                    <div className="flex items-center">
                      <a 
                        href={item.invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                        Ver Nota Original <ShieldCheck className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="pt-12 text-center">
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 max-w-md mx-auto">
            <p className="text-xs font-bold text-emerald-800 leading-relaxed">
              O Guardião de Notas certifica que os documentos acima foram armazenados por um usuário autenticado e possuem selo de integridade digital.
            </p>
          </div>
          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Guardião de Notas. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
