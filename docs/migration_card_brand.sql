-- Migração: Adicionar coluna card_brand à tabela warranties
-- Permite registrar o cartão de crédito usado na compra para
-- vincular benefícios como garantia estendida e proteção de preço.

ALTER TABLE public.warranties
ADD COLUMN IF NOT EXISTS card_brand TEXT DEFAULT NULL;

COMMENT ON COLUMN public.warranties.card_brand IS 'Bandeira e nível do cartão de crédito usado na compra (ex: Visa Platinum, Mastercard Black)';
