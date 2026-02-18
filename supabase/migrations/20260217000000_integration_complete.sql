-- ============================================
-- INTEGRAÇÃO COMPLETA - GUARDIÃO DE NOTAS
-- Executa automaticamente via: supabase db push
-- Ou manualmente no SQL Editor do Supabase
-- ============================================

-- ---------- 1. COLUNAS EXTRAS EM warranties ----------
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
    ALTER TABLE public.warranties ADD COLUMN maintenance_frequency_months integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='last_maintenance_date') THEN
    ALTER TABLE public.warranties ADD COLUMN last_maintenance_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='estimated_sale_value') THEN
    ALTER TABLE public.warranties ADD COLUMN estimated_sale_value numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='warranties' AND column_name='card_brand') THEN
    ALTER TABLE public.warranties ADD COLUMN card_brand text;
  END IF;
END $$;

-- ---------- 2. FUNÇÃO PÚBLICA PARA SHARE (permite anônimo ver certificado) ----------
CREATE OR REPLACE FUNCTION public.get_warranty_for_share(wid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'name', name,
    'purchase_date', purchase_date,
    'store', store,
    'serial_number', serial_number,
    'category', category,
    'price', price
  ) INTO result
  FROM public.warranties
  WHERE id = wid;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_warranty_for_share(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_warranty_for_share(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_warranty_for_share(uuid) TO authenticated;

-- ---------- 3. REALTIME para warranties ----------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'warranties'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.warranties;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignorar se publicação não existir
END $$;

-- ---------- 4. PROFILES (criar se não existir) ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nickname text,
  avatar_url text,
  full_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Colunas extras em profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_premium') THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='plan_name') THEN
    ALTER TABLE public.profiles ADD COLUMN plan_name text DEFAULT 'free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='referral_code') THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='cpf') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='profile_type') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_type text DEFAULT 'personal';
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || substring(NEW.id::text from 1 for 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || NEW.id),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname = COALESCE(EXCLUDED.nickname, profiles.nickname),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------- 5. TABELAS EXTRAS ----------
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

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
  listing_price numeric NOT NULL,
  platform_fee_percent numeric(5,2) DEFAULT 5,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Users can manage own listings" ON public.marketplace_listings;
CREATE POLICY "Users can manage own listings" ON public.marketplace_listings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_json jsonb NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- 6. STORAGE BUCKET invoices ----------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', true, 10485760, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'application/pdf'];

-- Políticas de storage para invoices (pasta = user_id)
DROP POLICY IF EXISTS "invoices_authenticated_upload" ON storage.objects;
CREATE POLICY "invoices_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "invoices_owner_select" ON storage.objects;
CREATE POLICY "invoices_owner_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "invoices_owner_delete" ON storage.objects;
CREATE POLICY "invoices_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
