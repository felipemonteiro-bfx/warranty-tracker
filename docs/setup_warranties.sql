-- ============================================
-- SETUP COMPLETO - Tabela warranties
-- Execute no SQL Editor do Supabase
-- https://supabase.com/dashboard → seu projeto → SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.warranties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  category text,
  purchase_date date NOT NULL,
  warranty_months integer NOT NULL,
  invoice_url text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  store text,
  price numeric,
  notes text,
  total_saved numeric DEFAULT 0,
  serial_number text,
  estimated_sale_value numeric,
  folder text DEFAULT 'Pessoal',
  maintenance_frequency_months integer,
  last_maintenance_date date
);

ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own warranties" ON public.warranties;
CREATE POLICY "Users can manage their own warranties"
  ON public.warranties FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- ✅ Tabela warranties criada com sucesso!
-- Aguarde 1-2 minutos para o cache do Supabase atualizar.
-- ============================================
