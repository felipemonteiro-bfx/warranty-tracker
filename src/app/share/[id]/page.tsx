import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, Calendar, Store, DollarSign, ExternalLink, Package, Clock } from 'lucide-react';
import { formatDate, calculateExpirationDate, getDaysRemaining } from '@/lib/utils/date-utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: warranty } = await supabase
    .from('warranties')
    .select('*')
    .eq('id', id)
    .single();

  if (!warranty) {
    notFound();
  }

  const expirationDate = calculateExpirationDate(warranty.purchase_date, warranty.warranty_months);
  const daysRemaining = getDaysRemaining(expirationDate);
  const isExpired = daysRemaining < 0;
  const logoUrl = "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj";

  return (
    <div className="min-h-screen bg-teal-50/30 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl shadow-xl border-2 border-white mx-auto">
            <Image src={logoUrl} alt="Logo" fill className="object-cover" unoptimized />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Comprovante de Proteção</h1>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Documento verificado pelo Guardião</p>
          </div>
        </header>

        <Card className="border-t-8 border-t-emerald-600 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="border-b border-slate-50 pb-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-900">{warranty.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <Package className="h-4 w-4" /> {warranty.category || 'Geral'}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {isExpired ? 'Expirada' : 'Garantia Ativa'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Estabelecimento</p>
                    <p className="font-bold text-slate-800">{warranty.store || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Data da Compra</p>
                    <p className="font-bold text-slate-800">{formatDate(warranty.purchase_date)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Valor de Nota</p>
                    <p className="font-bold text-slate-800">R$ {Number(warranty.price || 0).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Válido até</p>
                    <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>{formatDate(expirationDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {warranty.notes && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Observações</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">{warranty.notes}</p>
              </div>
            )}

            {warranty.invoice_url && (
              <div className="pt-6">
                <a 
                  href={warranty.invoice_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                  Visualizar Nota Fiscal Original <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Gerado automaticamente em {new Date().toLocaleDateString('pt-BR')} via Guardião de Notas
        </footer>
      </div>
    </div>
  );
}
