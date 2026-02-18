'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MessageCircle, ArrowLeft, Loader2, Check, X, Package, DollarSign,
  ChevronRight, Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { SectionErrorBoundary } from '@/components/shared/SectionErrorBoundary';

type Tab = 'recebidas' | 'enviadas';

export default function MarketplaceOfertasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingFilter = searchParams.get('listing');
  const [tab, setTab] = useState<Tab>('recebidas');
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchOffers();
  }, [tab]);

  // Realtime: novas ofertas para vendedor
  useEffect(() => {
    if (!user || tab !== 'recebidas') return;
    const client = createClient();
    let channel: ReturnType<typeof client.channel> | null = null;
    let cancelled = false;

    const setupRealtime = async () => {
      const { data: listings } = await client
        .from('marketplace_listings')
        .select('id')
        .eq('user_id', user.id);
      if (cancelled || !listings?.length) return;

      channel = client
        .channel('offers-received')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'marketplace_offers' },
          () => fetchOffers()
        )
        .subscribe();
    };
    setupRealtime();

    return () => {
      cancelled = true;
      if (channel) client.removeChannel(channel);
    };
  }, [user?.id, tab]);

  const fetchOffers = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (!u) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (tab === 'recebidas') {
        const { data: myListings } = await supabase
          .from('marketplace_listings')
          .select('id')
          .eq('user_id', u.id)
          .eq('status', 'active');

        const ids = (myListings || []).map((l) => l.id);
        if (ids.length === 0) {
          setOffers([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('marketplace_offers')
          .select(`
            *,
            marketplace_listings(
              id,
              listing_price,
              warranty_id,
              warranties(name, category)
            )
          `)
          .in('listing_id', ids)
          .order('created_at', { ascending: false });

        if (error) {
          const { data: fallback } = await supabase
            .from('marketplace_offers')
            .select('*')
            .in('listing_id', ids);
          setOffers(fallback || []);
        } else {
          let filtered = data || [];
          if (listingFilter) {
            filtered = filtered.filter((o) => o.listing_id === listingFilter);
          }
          setOffers(filtered);
        }
      } else {
        const { data } = await supabase
          .from('marketplace_offers')
          .select(`
            *,
            marketplace_listings(
              id,
              listing_price,
              warranty_id,
              warranties(name, category)
            )
          `)
          .eq('buyer_id', u.id)
          .order('created_at', { ascending: false });
        setOffers(data || []);
      }
    } catch (err) {
      logger.error('Erro ao buscar ofertas', err as Error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (offerId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_offers')
        .update({
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId);

      if (error) throw error;
      toast.success(accept ? 'Oferta aceita! Entre em contato com o comprador.' : 'Oferta recusada.');
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao responder.');
    }
  };

  const getListingInfo = (o: any) => {
    const ml = o.marketplace_listings;
    const w = ml?.warranties || {};
    return { name: w.name || 'Produto', category: w.category };
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Faça login</h2>
        <p className="text-slate-500 mt-2">Entre para ver suas ofertas.</p>
        <Link href="/login">
          <Button className="mt-6">Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <SectionErrorBoundary sectionName="marketplace-ofertas">
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </div>

      <header>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Ofertas do <span className="text-emerald-600">Marketplace</span>
        </h1>
        <p className="text-slate-500 mt-1">Gerencie ofertas recebidas e enviadas</p>
      </header>

      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setTab('recebidas')}
          className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-colors ${tab === 'recebidas' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Recebidas
        </button>
        <button
          onClick={() => setTab('enviadas')}
          className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-colors ${tab === 'enviadas' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Enviadas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-none shadow-xl p-12 text-center">
          <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma oferta {tab === 'recebidas' ? 'recebida' : 'enviada'}.</p>
          <Link href="/marketplace">
            <Button variant="outline" className="mt-4">Explorar Marketplace</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((o) => {
            const info = getListingInfo(o);
            return (
              <Card key={o.id} className="border-none shadow-lg">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">{info.category}</p>
                    <h3 className="font-black text-slate-900 dark:text-white">{info.name}</h3>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      R$ {Number(o.offer_amount).toLocaleString('pt-BR')}
                    </p>
                    {o.message && (
                      <p className="text-sm text-slate-500 mt-2 italic">&quot;{o.message}&quot;</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(o.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tab === 'recebidas' && o.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleRespond(o.id, true)} className="bg-emerald-600">
                          <Check className="h-4 w-4 mr-1" /> Aceitar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRespond(o.id, false)}>
                          <X className="h-4 w-4 mr-1" /> Recusar
                        </Button>
                      </>
                    )}
                    {o.status !== 'pending' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        o.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {o.status === 'accepted' ? 'Aceita' : o.status === 'rejected' ? 'Recusada' : o.status}
                      </span>
                    )}
                    <Link href={`/marketplace/${o.listing_id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </SectionErrorBoundary>
  );
}
