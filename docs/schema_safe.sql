-- ============================================
-- SCHEMA PRINCIPAL - VERSÃO SEGURA (IDEMPOTENTE)
-- Warranty Tracker
-- ============================================
-- Este script pode ser executado múltiplas vezes sem erro
-- ============================================

-- 1. Criar a tabela de garantias (se não existir)
CREATE TABLE IF NOT EXISTS public.warranties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text,
  purchase_date date not null,
  warranty_months integer not null,
  invoice_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar o Row Level Security (RLS)
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de segurança (se não existir)
DROP POLICY IF EXISTS "Users can manage their own warranties" ON public.warranties;
CREATE POLICY "Users can manage their own warranties"
  ON public.warranties
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Tabela warranties criada/atualizada com sucesso!
-- ============================================
