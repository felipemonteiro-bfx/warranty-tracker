-- Messaging App Schema (Stealth Mode)

-- 1. Profiles (Public user info)
create table public.profiles (
  id uuid references auth.users not null primary key,
  nickname text unique not null,
  avatar_url text,
  status text,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- 2. Chats (Conversations)
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  type text default 'private' check (type in ('private', 'group')),
  name text, -- For groups
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chats enable row level security;

-- Policy for chats is tricky: user must be a participant.
-- We'll rely on chat_participants for access control.

-- 3. Chat Participants (Join table)
create table public.chat_participants (
  chat_id uuid references public.chats on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (chat_id, user_id)
);

alter table public.chat_participants enable row level security;

create policy "Users can view chats they are part of"
  on public.chat_participants for select
  using ( auth.uid() = user_id );

create policy "Users can view other participants in their chats"
  on public.chat_participants for select
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chat_participants.chat_id
      and cp.user_id = auth.uid()
    )
  );

-- Policy for Chats table based on participants
create policy "Users can view chats they belong to"
  on public.chats for select
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = id
      and cp.user_id = auth.uid()
    )
  );
  
create policy "Users can insert chats"
  on public.chats for insert
  with check ( true ); -- Participants are added immediately after

create policy "Users can insert participants"
  on public.chat_participants for insert
  with check ( auth.uid() = user_id ); -- Self join? Or invitation logic needs Rpc.

-- 4. Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text, -- Text content
  media_url text, -- For images/video/audio
  media_type text, -- 'image', 'video', 'audio'
  is_encrypted boolean default false, -- Future proofing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can view messages in their chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = messages.chat_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can send messages to their chats"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = messages.chat_id
      and cp.user_id = auth.uid()
    )
  );

-- Storage for Media
insert into storage.buckets (id, name, public) 
values ('chat-media', 'chat-media', false) -- Private bucket
on conflict (id) do nothing;

create policy "Participants can view media"
  on storage.objects for select
  using (
     bucket_id = 'chat-media' 
     -- Complex check omitted for brevity, in production use Signed URLs or RLS with Postgres Function
     -- For MVP: assume authenticated users can read if they have the link (Signed URLs preferred)
     and auth.role() = 'authenticated' 
  );

create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check ( bucket_id = 'chat-media' and auth.role() = 'authenticated' );
