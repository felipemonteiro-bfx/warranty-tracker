-- ============================================
-- SCHEMA DE MENSAGENS - VERSÃO SEGURA (IDEMPOTENTE)
-- Warranty Tracker
-- ============================================
-- Este script pode ser executado múltiplas vezes sem erro
-- ============================================

-- 1. Profiles (Public user info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  nickname text unique not null,
  avatar_url text,
  status text,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
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

-- 2. Chats (Conversations)
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid default gen_random_uuid() primary key,
  type text default 'private' check (type in ('private', 'group')),
  name text, -- For groups
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- 3. Chat Participants (Join table)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id uuid references public.chats on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (chat_id, user_id)
);

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

-- Políticas para chats
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
  WITH CHECK ( true ); -- Participants are added immediately after

-- 4. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text, -- Text content
  media_url text, -- For images/video/audio
  media_type text, -- 'image', 'video', 'audio'
  is_encrypted boolean default false, -- Future proofing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
-- FIM DO SCRIPT
-- ============================================
-- ✅ Todas as tabelas de mensagens criadas/atualizadas!
-- ============================================
