-- ============================================
-- SEED: Dados mock para testar toda a aplicação
-- ============================================
-- 1. Execute antes: docs/schema_extra_tables.sql (cria tabelas extras e colunas).
-- 2. No Supabase: Authentication > Users > copie o UUID do seu usuário.
-- 3. Substitua 'SEU_USER_ID_AQUI' (todas as ocorrências) pelo UUID.
-- 4. Execute no SQL Editor do Supabase.

-- ---------- Profiles (apenas colunas que existem após schema_extra_tables) ----------
-- Se sua tabela profiles tiver só id: rode schema_extra_tables.sql antes (ele adiciona full_name, cpf, etc.).
-- Não usa nickname/avatar_url/status para não quebrar em bancos que não têm essas colunas.
INSERT INTO public.profiles (id, full_name, cpf, profile_type, is_premium)
VALUES (
  'SEU_USER_ID_AQUI',
  'Usuário Teste',
  '123.456.789-00',
  'personal',
  false
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  cpf = EXCLUDED.cpf,
  profile_type = EXCLUDED.profile_type,
  is_premium = EXCLUDED.is_premium;

-- ---------- Garantias ----------
INSERT INTO public.warranties (
  user_id, name, category, purchase_date, warranty_months,
  store, price, notes, serial_number, total_saved, invoice_url,
  folder, maintenance_frequency_months, last_maintenance_date
) VALUES
  ('SEU_USER_ID_AQUI', 'Notebook Dell Inspiron 15 3000', 'Informática', (CURRENT_DATE - 120)::date, 24, 'Magazine Luiza', 3499.90, 'Compra Black Friday. Inclui mouse e mochila.', 'DL123456789BR', 0, NULL, 'Pessoal', 6, (CURRENT_DATE - 30)::date),
  ('SEU_USER_ID_AQUI', 'iPhone 14 Pro 128GB', 'Celulares', (CURRENT_DATE - 200)::date, 12, 'Apple Store', 7499.00, 'Apple Care+ até dez/2025.', 'DNQP12ABC34', 150, NULL, 'Pessoal', 12, (CURRENT_DATE - 90)::date),
  ('SEU_USER_ID_AQUI', 'Geladeira Brastemp Frost Free', 'Eletrodomésticos', (CURRENT_DATE - 400)::date, 36, 'Casas Bahia', 2899.00, 'Instalação incluída. Porta reversível.', 'BRF2023123456', 0, NULL, 'Casa', 12, (CURRENT_DATE - 180)::date),
  ('SEU_USER_ID_AQUI', 'Smart TV Samsung 55" QLED', 'TV e Vídeo', (CURRENT_DATE - 60)::date, 12, 'Americanas', 4299.00, 'Garantia estendida 2 anos na loja.', 'SN55Q70T2024', 0, NULL, 'Pessoal', 6, (CURRENT_DATE - 20)::date),
  ('SEU_USER_ID_AQUI', 'Furadeira Bosch GSB 21-2 RCT', 'Ferramentas', (CURRENT_DATE - 30)::date, 24, 'Leroy Merlin', 599.90, 'Kit com maleta e acessórios.', 'BOS2024XYZ789', 0, NULL, 'Oficina', 24, NULL);

-- ---------- Notifications ----------
INSERT INTO public.notifications (user_id, title, message, read) VALUES
  ('SEU_USER_ID_AQUI', 'Garantia próxima do vencimento', 'Notebook Dell Inspiron 15 3000 vence em 30 dias.', false),
  ('SEU_USER_ID_AQUI', 'Lembrete de manutenção', 'Smart TV Samsung está na data de revisão.', false),
  ('SEU_USER_ID_AQUI', 'Bem-vindo ao Guardião', 'Seus dados de teste foram criados com sucesso.', true);

-- ---------- Maintenance logs (por nome da garantia) ----------
INSERT INTO public.maintenance_logs (warranty_id, date, description)
SELECT id, (CURRENT_DATE - 30)::date, 'Limpeza de ventilação e troca de pasta térmica.'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Notebook Dell Inspiron 15 3000' LIMIT 1;
INSERT INTO public.maintenance_logs (warranty_id, date, description)
SELECT id, (CURRENT_DATE - 90)::date, 'Primeira revisão pós-compra.'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Notebook Dell Inspiron 15 3000' LIMIT 1;
INSERT INTO public.maintenance_logs (warranty_id, date, description)
SELECT id, (CURRENT_DATE - 90)::date, 'Verificação de bateria e software.'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'iPhone 14 Pro 128GB' LIMIT 1;
INSERT INTO public.maintenance_logs (warranty_id, date, description)
SELECT id, (CURRENT_DATE - 180)::date, 'Limpeza do condensador e verificação de vedação.'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Geladeira Brastemp Frost Free' LIMIT 1;

-- ---------- Lending logs ----------
INSERT INTO public.lending_logs (warranty_id, borrower_name, borrower_contact, expected_return_date, status, returned_at)
SELECT id, 'Maria Silva', 'maria@email.com', (CURRENT_DATE + 7)::date, 'returned', (CURRENT_DATE - 8)::date
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Notebook Dell Inspiron 15 3000' LIMIT 1;
INSERT INTO public.lending_logs (warranty_id, borrower_name, borrower_contact, expected_return_date, status)
SELECT id, 'João Santos', '(11) 99999-0000', (CURRENT_DATE + 14)::date, 'active'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'iPhone 14 Pro 128GB' LIMIT 1;

-- ---------- Folder shares ----------
INSERT INTO public.folder_shares (owner_id, folder_name, shared_with_email, permission) VALUES
  ('SEU_USER_ID_AQUI', 'Casa', 'familia@email.com', 'editor'),
  ('SEU_USER_ID_AQUI', 'Pessoal', 'backup@email.com', 'viewer');

-- ---------- Marketplace listings ----------
INSERT INTO public.marketplace_listings (user_id, warranty_id, listing_price, status)
SELECT 'SEU_USER_ID_AQUI', id, 2899, 'active'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Notebook Dell Inspiron 15 3000' LIMIT 1;
INSERT INTO public.marketplace_listings (user_id, warranty_id, listing_price, status)
SELECT 'SEU_USER_ID_AQUI', id, 6499, 'active'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'iPhone 14 Pro 128GB' LIMIT 1;

-- ---------- Claims (suporte) ----------
INSERT INTO public.claims (user_id, warranty_id, title, status, description)
SELECT 'SEU_USER_ID_AQUI', id, 'Tecla com defeito', 'in_progress', 'Tecla Enter não responde após 2 meses de uso.'
FROM public.warranties WHERE user_id = 'SEU_USER_ID_AQUI' AND name = 'Notebook Dell Inspiron 15 3000' LIMIT 1;
