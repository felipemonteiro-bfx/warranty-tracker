-- ============================================
-- TABELAS EXTRAS USADAS PELA APLICAÇÃO
-- ============================================
-- Execute no SQL Editor do Supabase se ainda não tiver estas tabelas.
-- Idempotente: pode rodar mais de uma vez.

-- Colunas extras em warranties (se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='store') THEN
    ALTER TABLE public.warranties ADD COLUMN store text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='price') THEN
    ALTER TABLE public.warranties ADD COLUMN price numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='notes') THEN
    ALTER TABLE public.warranties ADD COLUMN notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='total_saved') THEN
    ALTER TABLE public.warranties ADD COLUMN total_saved numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='serial_number') THEN
    ALTER TABLE public.warranties ADD COLUMN serial_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='folder') THEN
    ALTER TABLE public.warranties ADD COLUMN folder text DEFAULT 'Pessoal';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='maintenance_frequency_months') THEN
    ALTER TABLE public.warranties ADD COLUMN maintenance_frequency_months integer DEFAULT 6;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='last_maintenance_date') THEN
    ALTER TABLE public.warranties ADD COLUMN last_maintenance_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='estimated_sale_value') THEN
    ALTER TABLE public.warranties ADD COLUMN estimated_sale_value numeric;
  END IF;
END $$;

-- Colunas extras em profiles (inclui nickname/avatar_url/status para quem usa setup completo)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='nickname') THEN
    ALTER TABLE public.profiles ADD COLUMN nickname text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='cpf') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='profile_type') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_type text DEFAULT 'personal';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_premium') THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='legacy_enabled') THEN
    ALTER TABLE public.profiles ADD COLUMN legacy_enabled boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_street') THEN
    ALTER TABLE public.profiles ADD COLUMN address_street text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_number') THEN
    ALTER TABLE public.profiles ADD COLUMN address_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_complement') THEN
    ALTER TABLE public.profiles ADD COLUMN address_complement text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_neighborhood') THEN
    ALTER TABLE public.profiles ADD COLUMN address_neighborhood text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_city') THEN
    ALTER TABLE public.profiles ADD COLUMN address_city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_state') THEN
    ALTER TABLE public.profiles ADD COLUMN address_state text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='address_zipcode') THEN
    ALTER TABLE public.profiles ADD COLUMN address_zipcode text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='birth_date') THEN
    ALTER TABLE public.profiles ADD COLUMN birth_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='gender') THEN
    ALTER TABLE public.profiles ADD COLUMN gender text;
  END IF;
END $$;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Maintenance logs
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage maintenance for own warranties" ON public.maintenance_logs;
CREATE POLICY "Users can manage maintenance for own warranties" ON public.maintenance_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.warranties w WHERE w.id = warranty_id AND w.user_id = auth.uid()));

-- Lending logs
CREATE TABLE IF NOT EXISTS public.lending_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
  borrower_name text NOT NULL,
  borrower_contact text,
  expected_return_date date,
  returned_at date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'returned')),
  lent_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.lending_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage lending for own warranties" ON public.lending_logs;
CREATE POLICY "Users can manage lending for own warranties" ON public.lending_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.warranties w WHERE w.id = warranty_id AND w.user_id = auth.uid()));

-- Folder shares
CREATE TABLE IF NOT EXISTS public.folder_shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users NOT NULL,
  folder_name text NOT NULL,
  shared_with_email text NOT NULL,
  permission text DEFAULT 'editor',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.folder_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own folder shares" ON public.folder_shares;
CREATE POLICY "Users can manage own folder shares" ON public.folder_shares FOR ALL USING (auth.uid() = owner_id);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
  listing_price numeric NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own listings" ON public.marketplace_listings;
CREATE POLICY "Users can manage own listings" ON public.marketplace_listings FOR ALL USING (auth.uid() = user_id);

-- Claims (support / sinistros)
CREATE TABLE IF NOT EXISTS public.claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'legal_action')),
  description text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own claims" ON public.claims;
CREATE POLICY "Users can manage own claims" ON public.claims FOR ALL USING (auth.uid() = user_id);
