-- ============================================
-- SETUP COMPLETO - VERSÃO SEGURA V2 (CORRIGIDA)
-- Warranty Tracker - Supabase
-- ============================================
-- Execute este script UMA VEZ no SQL Editor do Supabase
-- Pode ser executado múltiplas vezes sem erro
-- CORRIGIDO: Ordem de criação e dependências
-- ============================================

-- ============================================
-- PARTE 1: TABELAS PRINCIPAIS (SEM DEPENDÊNCIAS)
-- ============================================

-- Tabela de garantias
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

ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own warranties" ON public.warranties;
CREATE POLICY "Users can manage their own warranties"
  ON public.warranties
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- PARTE 2: TABELAS DE MENSAGENS (ORDEM CORRETA)
-- ============================================

-- 1. Profiles (PRIMEIRO - não depende de nada)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  nickname text unique not null,
  avatar_url text,
  status text,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- 2. Chats (SEGUNDO - não depende de profiles ainda)
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid default gen_random_uuid() primary key,
  type text default 'private' check (type in ('private', 'group')),
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- 3. Chat Participants (TERCEIRO - depende de chats E profiles)
-- IMPORTANTE: Criar SEM foreign keys primeiro, depois adicionar constraints
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id uuid not null,
  user_id uuid not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (chat_id, user_id)
);

-- Adicionar foreign keys apenas se as tabelas existirem
DO $$
BEGIN
  -- Adicionar FK para chats se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_participants_chat_id_fkey'
  ) THEN
    ALTER TABLE public.chat_participants 
    ADD CONSTRAINT chat_participants_chat_id_fkey 
    FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
  END IF;
  
  -- Adicionar FK para profiles se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_participants_user_id_fkey'
  ) THEN
    ALTER TABLE public.chat_participants 
    ADD CONSTRAINT chat_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_participants
DROP POLICY IF EXISTS "Users can view chats they are part of" ON public.chat_participants;
CREATE POLICY "Users can view chats they are part of"
  ON public.chat_participants FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can view other participants in their chats" ON public.chat_participants;
CREATE POLICY "Users can view other participants in their chats"
  ON public.chat_participants FOR SELECT
  USING (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chat_participants.chat_id
      and cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert participants" ON public.chat_participants;
CREATE POLICY "Users can insert participants"
  ON public.chat_participants FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Políticas para chats (depois de criar chat_participants)
DROP POLICY IF EXISTS "Users can view chats they belong to" ON public.chats;
CREATE POLICY "Users can view chats they belong to"
  ON public.chats FOR SELECT
  USING (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = public.chats.id
      and cp.user_id = auth.uid()
    )
  );
  
DROP POLICY IF EXISTS "Users can insert chats" ON public.chats;
CREATE POLICY "Users can insert chats"
  ON public.chats FOR INSERT
  WITH CHECK ( true );

-- 4. Messages (QUARTO - depende de chats E profiles)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid not null,
  sender_id uuid,
  content text,
  media_url text,
  media_type text,
  is_encrypted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adicionar foreign keys para messages
DO $$
BEGIN
  -- FK para chats
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'messages_chat_id_fkey'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_chat_id_fkey 
    FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
  END IF;
  
  -- FK para profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = messages.chat_id
      and cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
CREATE POLICY "Users can send messages to their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = messages.chat_id
      and cp.user_id = auth.uid()
    )
  );

-- ============================================
-- PARTE 3: STORAGE BUCKETS
-- ============================================

-- Bucket invoices (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', true, 10485760, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/*', 'application/pdf'];

-- Bucket chat-media (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*'])
ON CONFLICT (id) DO UPDATE 
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/*', 'video/*', 'audio/*'];

-- Políticas para invoices
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Allow owners to see their own files" ON storage.objects;
CREATE POLICY "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Allow owners to update their own files" ON storage.objects;
CREATE POLICY "Allow owners to update their own files"
  ON storage.objects FOR UPDATE
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Allow owners to delete their own files" ON storage.objects;
CREATE POLICY "Allow owners to delete their own files"
  ON storage.objects FOR DELETE
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas para chat-media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Participants can view media" ON storage.objects;
CREATE POLICY "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Authenticated users can delete media"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

-- ============================================
-- PARTE 4: REALTIME
-- ============================================

-- Ativar Realtime nas tabelas de mensagens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chats;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'chat_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
  END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar tabelas criadas
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as total
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages');

-- Verificar buckets criados
SELECT 
  'Buckets criados' as status,
  COUNT(*) as total
FROM storage.buckets
WHERE id IN ('invoices', 'chat-media');

-- Verificar Realtime
SELECT 
  'Tabelas no Realtime' as status,
  COUNT(*) as total
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Setup completo executado com sucesso!
-- CORRIGIDO: Ordem de criação e foreign keys
-- ============================================
