-- ============================================
-- SCHEMA MELHORIAS V2 – 15 novas features
-- Garantia Estendida, Escrow, Cashback, API B2B,
-- Auto-Register, Smart Alerts, NF-e Scanner,
-- Claims Workflow, Sync, Family Sync
-- ============================================
-- Execute após schema_receita.sql. Idempotente.

-- ---------- 1. GARANTIA ESTENDIDA (Micro-Seguro) ----------
CREATE TABLE IF NOT EXISTS public.extended_warranties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES public.insurance_partners(id) ON DELETE SET NULL,
  coverage_months integer NOT NULL DEFAULT 12,
  premium_amount numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'claimed')),
  purchased_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.extended_warranties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own extended warranties" ON public.extended_warranties;
CREATE POLICY "Users manage own extended warranties" ON public.extended_warranties
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 2. ESCROW (Marketplace Seguro) ----------
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES auth.users NOT NULL,
  seller_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'awaiting_payment' CHECK (status IN (
    'awaiting_payment', 'payment_held', 'shipped', 'delivered', 'released', 'disputed', 'refunded', 'cancelled'
  )),
  tracking_code text,
  dispute_reason text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  released_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer and seller see escrow" ON public.escrow_transactions;
CREATE POLICY "Buyer and seller see escrow" ON public.escrow_transactions
  FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ---------- 3. CASHBACK ----------
CREATE TABLE IF NOT EXISTS public.cashback_partners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  cashback_percent numeric(5,2) NOT NULL DEFAULT 0,
  category text,
  affiliate_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cashback_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  partner_id uuid REFERENCES public.cashback_partners(id) ON DELETE SET NULL,
  purchase_amount numeric NOT NULL,
  cashback_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'credited', 'rejected')),
  credited_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cashback_balances (
  user_id uuid REFERENCES auth.users PRIMARY KEY,
  available numeric DEFAULT 0,
  pending numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  total_redeemed numeric DEFAULT 0,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cashback_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads active cashback partners" ON public.cashback_partners;
CREATE POLICY "Anyone reads active cashback partners" ON public.cashback_partners
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users manage own cashback tx" ON public.cashback_transactions;
CREATE POLICY "Users manage own cashback tx" ON public.cashback_transactions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own cashback balance" ON public.cashback_balances;
CREATE POLICY "Users see own cashback balance" ON public.cashback_balances
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 4. API B2B (Chaves de API) ----------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL, -- primeiros 8 chars para exibição
  name text NOT NULL DEFAULT 'Chave Padrão',
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  requests_today integer DEFAULT 0,
  requests_month integer DEFAULT 0,
  daily_limit integer DEFAULT 100,
  monthly_limit integer DEFAULT 3000,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  status_code integer,
  response_ms integer,
  ip_address text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own api keys" ON public.api_keys;
CREATE POLICY "Users manage own api keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own api logs" ON public.api_usage_logs;
CREATE POLICY "Users see own api logs" ON public.api_usage_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.api_keys ak WHERE ak.id = api_key_id AND ak.user_id = auth.uid())
  );

-- ---------- 5. AUTO-REGISTRO POR EMAIL ----------
CREATE TABLE IF NOT EXISTS public.email_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  from_email text NOT NULL,
  subject text,
  extracted_data jsonb,
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own email registrations" ON public.email_registrations;
CREATE POLICY "Users see own email registrations" ON public.email_registrations
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 6. ALERTAS INTELIGENTES ----------
CREATE TABLE IF NOT EXISTS public.alert_preferences (
  user_id uuid REFERENCES auth.users PRIMARY KEY,
  warranty_expiry_email boolean DEFAULT true,
  warranty_expiry_push boolean DEFAULT true,
  warranty_expiry_inapp boolean DEFAULT true,
  maintenance_email boolean DEFAULT false,
  maintenance_push boolean DEFAULT true,
  maintenance_inapp boolean DEFAULT true,
  lending_email boolean DEFAULT false,
  lending_push boolean DEFAULT true,
  lending_inapp boolean DEFAULT true,
  frequency text DEFAULT 'daily' CHECK (frequency IN ('realtime', 'daily', 'weekly')),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own alert prefs" ON public.alert_preferences;
CREATE POLICY "Users manage own alert prefs" ON public.alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 7. NF-e SCANNER (Histórico) ----------
CREATE TABLE IF NOT EXISTS public.nfe_scans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  access_key text NOT NULL, -- chave de acesso 44 dígitos
  emitente text,
  cnpj text,
  data_emissao timestamptz,
  valor_total numeric,
  items jsonb DEFAULT '[]',
  warranty_id uuid REFERENCES public.warranties(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.nfe_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own nfe scans" ON public.nfe_scans;
CREATE POLICY "Users see own nfe scans" ON public.nfe_scans
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 8. CLAIMS WORKFLOW (Sinistros) ----------
-- Adicionar colunas ao claims existente se necessário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='claims') THEN
    CREATE TABLE public.claims (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      warranty_id uuid REFERENCES public.warranties(id) ON DELETE SET NULL,
      title text NOT NULL,
      description text,
      status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_progress', 'resolved', 'legal_action', 'closed')),
      created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;
END $$;

-- Adicionar colunas extras para workflow
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='complaint_text') THEN
    ALTER TABLE public.claims ADD COLUMN complaint_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='pdf_url') THEN
    ALTER TABLE public.claims ADD COLUMN pdf_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='photos') THEN
    ALTER TABLE public.claims ADD COLUMN photos text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='response_deadline') THEN
    ALTER TABLE public.claims ADD COLUMN response_deadline timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='resolution_deadline') THEN
    ALTER TABLE public.claims ADD COLUMN resolution_deadline timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='current_step') THEN
    ALTER TABLE public.claims ADD COLUMN current_step integer DEFAULT 1;
  END IF;
END $$;

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own claims" ON public.claims;
CREATE POLICY "Users manage own claims" ON public.claims
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 9. PATRIMÔNIO (snapshots para gráfico de evolução) ----------
CREATE TABLE IF NOT EXISTS public.patrimony_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  total_value numeric NOT NULL DEFAULT 0,
  total_items integer NOT NULL DEFAULT 0,
  depreciated_value numeric NOT NULL DEFAULT 0,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE public.patrimony_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own patrimony snapshots" ON public.patrimony_snapshots;
CREATE POLICY "Users see own patrimony snapshots" ON public.patrimony_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 10. SYNC (registro de dispositivos) ----------
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  device_name text NOT NULL,
  device_type text DEFAULT 'unknown',
  user_agent text,
  last_sync_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own devices" ON public.user_devices;
CREATE POLICY "Users manage own devices" ON public.user_devices
  FOR ALL USING (auth.uid() = user_id);

-- ---------- 11. FAMILY SYNC (atividades compartilhadas) ----------
CREATE TABLE IF NOT EXISTS public.family_activity_feed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  folder_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('added', 'updated', 'deleted', 'shared')),
  item_name text NOT NULL,
  item_id uuid,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.family_activity_feed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members see shared folder activity" ON public.family_activity_feed;
CREATE POLICY "Members see shared folder activity" ON public.family_activity_feed
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.folder_shares fs
      WHERE fs.folder_name = family_activity_feed.folder_name
        AND fs.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Adicionar permissões granulares ao folder_shares
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='folder_shares' AND column_name='can_edit') THEN
    ALTER TABLE public.folder_shares ADD COLUMN can_edit boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='folder_shares' AND column_name='can_delete') THEN
    ALTER TABLE public.folder_shares ADD COLUMN can_delete boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='folder_shares' AND column_name='is_admin') THEN
    ALTER TABLE public.folder_shares ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='folder_shares' AND column_name='notify_changes') THEN
    ALTER TABLE public.folder_shares ADD COLUMN notify_changes boolean DEFAULT true;
  END IF;
END $$;

-- ---------- 12. REALTIME SETUP PARA WARRANTIES ----------
-- Habilitar realtime na tabela warranties (se não estiver habilitado)
DO $$
BEGIN
  -- Supabase Realtime precisa da publicação
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'warranties'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.warranties;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime setup: %', SQLERRM;
END $$;

-- ---------- ÍNDICES PARA PERFORMANCE ----------
CREATE INDEX IF NOT EXISTS idx_extended_warranties_user ON public.extended_warranties(user_id);
CREATE INDEX IF NOT EXISTS idx_extended_warranties_warranty ON public.extended_warranties(warranty_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_cashback_tx_user ON public.cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_email_reg_user ON public.email_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_nfe_scans_user ON public.nfe_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_patrimony_user_date ON public.patrimony_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_family_feed_folder ON public.family_activity_feed(folder_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage_logs(api_key_id);
