-- ============================================
-- VERIFICAÇÃO COMPLETA DA CONFIGURAÇÃO
-- Warranty Tracker - Supabase
-- ============================================
-- Execute este script para verificar se tudo está configurado
-- ============================================

-- 1. VERIFICAR TABELAS CRIADAS
SELECT 
  'Tabelas' as categoria,
  table_name as item,
  CASE 
    WHEN table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages') 
    THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')
ORDER BY table_name;

-- 2. VERIFICAR STORAGE BUCKETS
SELECT 
  'Storage Buckets' as categoria,
  name as item,
  CASE 
    WHEN public THEN '✅ Público'
    ELSE '✅ Privado'
  END as status,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('invoices', 'chat-media')
ORDER BY name;

-- 3. VERIFICAR POLÍTICAS RLS DAS TABELAS
SELECT 
  'RLS Policies (Tabelas)' as categoria,
  tablename || '.' || policyname as item,
  '✅ Configurada' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')
ORDER BY tablename, policyname;

-- 4. VERIFICAR POLÍTICAS RLS DO STORAGE
SELECT 
  'RLS Policies (Storage)' as categoria,
  policyname as item,
  '✅ Configurada' as status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (policyname LIKE '%invoices%' OR policyname LIKE '%chat-media%' OR policyname LIKE '%media%')
ORDER BY policyname;

-- 5. VERIFICAR REALTIME
SELECT 
  'Realtime' as categoria,
  tablename as item,
  CASE 
    WHEN tablename IN ('messages', 'chats', 'chat_participants')
    THEN '✅ Ativado'
    ELSE '❌ Não ativado'
  END as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants')
ORDER BY tablename;

-- 6. RESUMO GERAL
SELECT 
  'RESUMO' as categoria,
  'Total de tabelas' as item,
  COUNT(*)::text as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')

UNION ALL

SELECT 
  'RESUMO' as categoria,
  'Total de buckets' as item,
  COUNT(*)::text as status
FROM storage.buckets
WHERE id IN ('invoices', 'chat-media')

UNION ALL

SELECT 
  'RESUMO' as categoria,
  'Total de políticas RLS' as item,
  COUNT(*)::text as status
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND (
    tablename IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')
    OR (schemaname = 'storage' AND tablename = 'objects')
  )

UNION ALL

SELECT 
  'RESUMO' as categoria,
  'Tabelas no Realtime' as item,
  COUNT(*)::text as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants');

-- ============================================
-- FIM DA VERIFICAÇÃO
-- ============================================
