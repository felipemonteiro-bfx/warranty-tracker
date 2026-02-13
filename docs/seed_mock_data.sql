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

-- ---------- Insurance Partners (seguradoras parceiras) ----------
-- Apenas se não existirem
INSERT INTO public.insurance_partners (name, slug, logo_url, quote_url_template, commission_percent, is_active)
SELECT 'Porto Seguro', 'porto-seguro', 'https://logos-world.net/wp-content/uploads/2021/02/Porto-Seguro-Logo.png', 'https://www.portoseguro.com.br/cotacao?ref=guardiao', 15, true
WHERE NOT EXISTS (SELECT 1 FROM public.insurance_partners WHERE slug = 'porto-seguro');
INSERT INTO public.insurance_partners (name, slug, logo_url, quote_url_template, commission_percent, is_active)
SELECT 'SulAmérica', 'sulamerica', 'https://www.sulamerica.com.br/assets/img/logo-sulamerica.svg', 'https://www.sulamerica.com.br/cotacao?ref=guardiao', 12, true
WHERE NOT EXISTS (SELECT 1 FROM public.insurance_partners WHERE slug = 'sulamerica');
INSERT INTO public.insurance_partners (name, slug, logo_url, quote_url_template, commission_percent, is_active)
SELECT 'Bradesco Seguros', 'bradesco-seguros', 'https://www.bradescoseguros.com.br/assets/img/logo-bradesco.svg', 'https://www.bradescoseguros.com.br/cotacao?ref=guardiao', 18, true
WHERE NOT EXISTS (SELECT 1 FROM public.insurance_partners WHERE slug = 'bradesco-seguros');

-- ---------- Advertisers e Campanhas ----------
-- Advertiser 1
INSERT INTO public.advertisers (name, contact_email, status)
SELECT 'Magazine Luiza', 'marketing@magazineluiza.com.br', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.advertisers WHERE name = 'Magazine Luiza');
INSERT INTO public.ad_campaigns (advertiser_id, name, target_categories, image_url, link_url, cpm_cents, cpc_cents, start_at, end_at, is_active)
SELECT id, 'Ofertas em Eletrônicos', ARRAY['Informática', 'Celulares', 'TV e Vídeo'], 'https://via.placeholder.com/300x150?text=Magazine+Luiza', 'https://www.magazineluiza.com.br/eletronicos', 500, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', true
FROM public.advertisers WHERE name = 'Magazine Luiza' LIMIT 1
ON CONFLICT DO NOTHING;

-- Advertiser 2
INSERT INTO public.advertisers (name, contact_email, status)
SELECT 'Americanas', 'ads@americanas.com.br', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.advertisers WHERE name = 'Americanas');
INSERT INTO public.ad_campaigns (advertiser_id, name, target_categories, image_url, link_url, cpm_cents, cpc_cents, start_at, end_at, is_active)
SELECT id, 'Eletrodomésticos em Promoção', ARRAY['Eletrodomésticos', 'TV e Vídeo'], 'https://via.placeholder.com/300x150?text=Americanas', 'https://www.americanas.com.br/eletrodomesticos', 600, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', true
FROM public.advertisers WHERE name = 'Americanas' LIMIT 1
ON CONFLICT DO NOTHING;

-- ---------- Referral Code (gerar se não existir) ----------
UPDATE public.profiles 
SET referral_code = UPPER('REF' || SUBSTRING(id::text FROM 1 FOR 8))
WHERE id = 'SEU_USER_ID_AQUI' AND (referral_code IS NULL OR referral_code = '');

-- ---------- Insurance Quotes (cotações de exemplo) ----------
INSERT INTO public.insurance_quotes (user_id, warranty_id, partner_id, premium_estimate, status)
SELECT 'SEU_USER_ID_AQUI', w.id, p.id, 89.90, 'quoted'
FROM public.warranties w, public.insurance_partners p
WHERE w.user_id = 'SEU_USER_ID_AQUI' AND w.name = 'Notebook Dell Inspiron 15 3000' AND p.slug = 'porto-seguro'
LIMIT 1;
INSERT INTO public.insurance_quotes (user_id, warranty_id, partner_id, premium_estimate, status)
SELECT 'SEU_USER_ID_AQUI', w.id, p.id, 95.50, 'quoted'
FROM public.warranties w, public.insurance_partners p
WHERE w.user_id = 'SEU_USER_ID_AQUI' AND w.name = 'Notebook Dell Inspiron 15 3000' AND p.slug = 'sulamerica'
LIMIT 1;

-- ---------- Marketplace Transactions (transações fechadas com taxa) ----------
INSERT INTO public.marketplace_transactions (listing_id, buyer_id, seller_id, amount, platform_fee_percent, platform_fee_amount, status)
SELECT l.id, 'SEU_USER_ID_AQUI', l.user_id, l.listing_price, COALESCE(l.platform_fee_percent, 5), (l.listing_price * COALESCE(l.platform_fee_percent, 5) / 100), 'completed'
FROM public.marketplace_listings l
WHERE l.user_id = 'SEU_USER_ID_AQUI'
LIMIT 1;

-- ---------- Ad Impressions (impressões de exemplo) ----------
INSERT INTO public.ad_impressions (campaign_id, user_id, category_shown, clicked)
SELECT c.id, 'SEU_USER_ID_AQUI', 'Informática', false
FROM public.ad_campaigns c
WHERE c.is_active = true
LIMIT 1;
INSERT INTO public.ad_impressions (campaign_id, user_id, category_shown, clicked)
SELECT c.id, 'SEU_USER_ID_AQUI', 'Celulares', true
FROM public.ad_campaigns c
WHERE c.is_active = true
LIMIT 1;

-- ---------- Referral Tracking (exemplos de indicações) ----------
INSERT INTO public.referral_tracking (referrer_id, referred_email, status, signed_up_at)
VALUES ('SEU_USER_ID_AQUI', 'amigo1@email.com', 'signed_up', CURRENT_TIMESTAMP - INTERVAL '10 days')
ON CONFLICT DO NOTHING;
INSERT INTO public.referral_tracking (referrer_id, referred_email, status, signed_up_at, converted_at)
VALUES ('SEU_USER_ID_AQUI', 'amigo2@email.com', 'converted', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT DO NOTHING;
