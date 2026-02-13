-- ============================================
-- SCHEMA DE RECEITA – Seguradoras, Marketplace (taxa), Anúncios
-- ============================================
-- Execute após schema_extra_tables.sql. Idempotente.

-- ---------- 1. SEGURO (parceiros + cotações + conversões para comissão) ----------
CREATE TABLE IF NOT EXISTS public.insurance_partners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  quote_url_template text,
  commission_percent numeric(5,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.insurance_quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE SET NULL,
  partner_id uuid REFERENCES public.insurance_partners(id) ON DELETE SET NULL,
  premium_estimate numeric,
  status text DEFAULT 'quoted',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.insurance_conversions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid REFERENCES public.insurance_quotes(id) ON DELETE SET NULL,
  partner_id uuid REFERENCES public.insurance_partners(id) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  premium_amount numeric NOT NULL,
  commission_percent numeric(5,2) NOT NULL,
  commission_amount numeric NOT NULL,
  converted_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.insurance_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own quotes" ON public.insurance_quotes;
CREATE POLICY "Users see own quotes" ON public.insurance_quotes FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users see own conversions" ON public.insurance_conversions;
CREATE POLICY "Users see own conversions" ON public.insurance_conversions FOR SELECT USING (auth.uid() = user_id);

-- RLS para insurance_partners: leitura pública (listar parceiros ativos)
ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active partners" ON public.insurance_partners;
CREATE POLICY "Anyone can read active partners" ON public.insurance_partners FOR SELECT USING (is_active = true);

-- ---------- 2. MARKETPLACE (transações com taxa da plataforma) ----------
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL NOT NULL,
  buyer_id uuid REFERENCES auth.users NOT NULL,
  seller_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  platform_fee_percent numeric(5,2) DEFAULT 5,
  platform_fee_amount numeric NOT NULL,
  status text DEFAULT 'completed',
  closed_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer and seller can view transaction" ON public.marketplace_transactions;
CREATE POLICY "Buyer and seller can view transaction" ON public.marketplace_transactions
  FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Opcional: coluna na listing para taxa específica (senão usa valor global)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='marketplace_listings' AND column_name='platform_fee_percent') THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN platform_fee_percent numeric(5,2) DEFAULT 5;
  END IF;
END $$;

-- ---------- 3. ANÚNCIOS (empresas + campanhas + impressões) ----------
CREATE TABLE IF NOT EXISTS public.advertisers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_email text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id uuid REFERENCES public.advertisers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_categories text[] DEFAULT '{}',
  image_url text,
  link_url text NOT NULL,
  cpm_cents integer DEFAULT 0,
  cpc_cents integer DEFAULT 0,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users,
  category_shown text,
  clicked boolean DEFAULT false,
  shown_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active campaigns" ON public.ad_campaigns;
CREATE POLICY "Anyone can read active campaigns" ON public.ad_campaigns FOR SELECT
  USING (is_active AND now() >= start_at AND now() <= end_at);

DROP POLICY IF EXISTS "Service can insert impressions" ON public.ad_impressions;
CREATE POLICY "Service can insert impressions" ON public.ad_impressions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update impressions" ON public.ad_impressions;
CREATE POLICY "Service can update impressions" ON public.ad_impressions FOR UPDATE USING (true);

-- Leitura de advertisers apenas para campanhas ativas (via join)
DROP POLICY IF EXISTS "Read advertisers" ON public.advertisers;
CREATE POLICY "Read advertisers" ON public.advertisers FOR SELECT USING (status = 'active');
