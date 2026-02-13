-- ============================================
-- SCHEMA DE REFERRAL TRACKING
-- ============================================
-- Tracking real de indicações e conversões

-- Adicionar referral_code em profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='referral_code') THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
END $$;

-- Gerar referral_code para perfis existentes sem código
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Tabela de tracking de referrals
CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid REFERENCES auth.users,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  signed_up_at timestamptz,
  converted_at timestamptz,
  reward_months integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_referred ON public.referral_tracking(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_email ON public.referral_tracking(referred_email);

ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own referrals" ON public.referral_tracking;
CREATE POLICY "Users see own referrals" ON public.referral_tracking FOR ALL USING (auth.uid() = referrer_id);

-- Trigger para marcar signup quando usuário se cadastra com ref
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  ref_code text;
  referrer_uuid uuid;
BEGIN
  -- Buscar referral_code da URL ou metadata
  -- (assumindo que vem em user_metadata.referral_code ou query param)
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    ref_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Encontrar referrer pelo código
    SELECT id INTO referrer_uuid FROM public.profiles WHERE referral_code = ref_code LIMIT 1;
    
    IF referrer_uuid IS NOT NULL THEN
      -- Marcar como signed_up
      UPDATE public.referral_tracking 
      SET referred_user_id = NEW.id, 
          status = 'signed_up',
          signed_up_at = now()
      WHERE referred_email = NEW.email AND referrer_id = referrer_uuid AND status = 'pending';
      
      -- Se não existe tracking, criar
      IF NOT EXISTS (SELECT 1 FROM public.referral_tracking WHERE referred_email = NEW.email AND referrer_id = referrer_uuid) THEN
        INSERT INTO public.referral_tracking (referrer_id, referred_email, referred_user_id, status, signed_up_at)
        VALUES (referrer_uuid, NEW.email, NEW.id, 'signed_up', now());
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_signup();
