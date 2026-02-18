'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft, ShieldCheck, MessageCircle, Send, Loader2, BadgeCheck, Store,
  DollarSign, Package, ExternalLink, Tag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ amount: '', message: '' });
  const [sendingOffer, setSendingOffer] = useState(false);
  const [myOffer, setMyOffer] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);

    const { data: listingData, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*, warranties(name, category, store, price, purchase_date, serial_number, estimated_sale_value)')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (listingError || !listingData) {
      setListing(null);
      setLoading(false);
      return;
    }
    setListing(listingData);

    if (u) {
      const { data: offer } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('listing_id', id)
        .eq('buyer_id', u.id)
        .single();
      setMyOffer(offer);
      if (offer) {
        setOfferForm({ amount: String(offer.offer_amount || ''), message: offer.message || '' });
      }
    }

    setLoading(false);
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para enviar uma oferta.');
      return;
    }
    const amount = parseFloat(String(offerForm.amount).replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido para a oferta.');
      return;
    }
    if (listing && amount > Number(listing.listing_price)) {
      toast.info('Sua oferta é maior que o preço pedido. Considere aceitar o valor anunciado!');
    }

    setSendingOffer(true);
    try {
      const { error } = await supabase.from('marketplace_offers').upsert({
        listing_id: id,
        buyer_id: user.id,
        offer_amount: amount,
        message: offerForm.message.trim() || null,
        status: 'pending',
        updated_at: new Date().toISOString()
      }, { onConflict: 'listing_id,buyer_id', ignoreDuplicates: false });

      if (error) throw error;
      toast.success(myOffer ? 'Oferta atualizada! O vendedor foi notificado.' : 'Oferta enviada! O vendedor receberá sua proposta.');

      // Notificar vendedor via push
      try {
        await fetch('/api/push/notify-offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: listing.user_id,
            productName: listing.warranties?.name || 'Produto',
            offerAmount: amount,
          }),
        });
      } catch {
        // Push opcional
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar oferta.');
    } finally {
      setSendingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anúncio não encontrado</h2>
        <p className="text-slate-500 mt-2">Este anúncio pode ter sido removido ou não está mais ativo.</p>
        <Link href="/marketplace">
          <Button className="mt-6">Voltar ao Marketplace</Button>
        </Link>
      </div>
    );
  }

  const warranty = listing.warranties || {};
  const isSeller = user?.id === listing.user_id;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <Link href="/marketplace">
          <Button variant="outline" size="sm">Ver todos os anúncios</Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                <BadgeCheck className="h-4 w-4" /> Patrimônio Auditado
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {warranty.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                  {warranty.category || 'Geral'}
                </span>
                {warranty.store && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold flex items-center gap-1">
                    <Store className="h-3 w-3" /> {warranty.store}
                  </span>
                )}
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <Link href={`/share/${listing.warranty_id}`} target="_blank">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> Ver certificado de procedência
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Preço pedido</span>
                <span className="text-3xl font-black text-emerald-600">
                  R$ {Number(listing.listing_price).toLocaleString('pt-BR')}
                </span>
              </div>
              {warranty.price && (
                <p className="text-xs text-slate-400">
                  Valor de compra original: R$ {Number(warranty.price).toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            {!isSeller && user && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <MessageCircle className="h-5 w-5 text-emerald-600" /> Enviar oferta
                </h3>
                <form onSubmit={handleSendOffer} className="space-y-4">
                  <Input
                    label="Sua proposta (R$)"
                    type="text"
                    placeholder="Ex: 2800 ou 2.800,00"
                    value={offerForm.amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d,.]/g, '').replace(',', '.');
                      setOfferForm({ ...offerForm, amount: v });
                    }}
                  />
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Mensagem para o vendedor (opcional)
                    </label>
                    <textarea
                      placeholder="Ex: Posso retirar hoje? Qual a condição da bateria?"
                      value={offerForm.message}
                      onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 min-h-[100px]"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={sendingOffer} className="w-full h-12">
                    {sendingOffer ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> {myOffer ? 'Atualizar oferta' : 'Enviar oferta'}
                      </>
                    )}
                  </Button>
                  {myOffer && (
                    <p className="text-xs text-slate-500 text-center">
                      Status: {myOffer.status === 'pending' ? 'Aguardando resposta' : myOffer.status}
                    </p>
                  )}
                </form>
              </div>
            )}

            {!user && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <p className="text-sm text-slate-500 mb-4">Faça login para enviar uma oferta ao vendedor.</p>
                <Link href="/login">
                  <Button className="w-full">Entrar</Button>
                </Link>
              </div>
            )}

            {isSeller && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <Link href={`/marketplace/ofertas?listing=${id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" /> Ver ofertas recebidas
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
