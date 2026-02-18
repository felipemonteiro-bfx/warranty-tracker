-- ============================================
-- Marketplace: Ofertas entre usuários
-- Proteção de preço (cartão)
-- ============================================

-- Ofertas em anúncios do marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_amount numeric NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  responded_at timestamptz,
  UNIQUE(listing_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_offers_listing ON public.marketplace_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_buyer ON public.marketplace_offers(buyer_id);

ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;

-- Comprador vê suas ofertas; vendedor vê ofertas no seu listing
DROP POLICY IF EXISTS "Buyer sees own offers" ON public.marketplace_offers;
CREATE POLICY "Buyer sees own offers" ON public.marketplace_offers
  FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Seller sees offers on own listings" ON public.marketplace_offers;
CREATE POLICY "Seller sees offers on own listings" ON public.marketplace_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      WHERE ml.id = listing_id AND ml.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Buyer can insert offer" ON public.marketplace_offers;
CREATE POLICY "Buyer can insert offer" ON public.marketplace_offers
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Seller can update offer status" ON public.marketplace_offers;
CREATE POLICY "Seller can update offer status" ON public.marketplace_offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      WHERE ml.id = listing_id AND ml.user_id = auth.uid()
    )
  );

-- Proteção de preço (registro de verificação/acionamento)
CREATE TABLE IF NOT EXISTS public.price_protection_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_id uuid NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_price numeric NOT NULL,
  found_price numeric NOT NULL,
  refund_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  days_protection integer NOT NULL,
  expires_at date NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_price_protection_warranty ON public.price_protection_claims(warranty_id);

ALTER TABLE public.price_protection_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own price protection claims" ON public.price_protection_claims;
CREATE POLICY "Users manage own price protection claims" ON public.price_protection_claims
  FOR ALL USING (auth.uid() = user_id);
