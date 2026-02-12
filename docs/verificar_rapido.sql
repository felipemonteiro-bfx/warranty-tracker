-- ============================================
-- VERIFICAÇÃO RÁPIDA - Warranty Tracker
-- ============================================
-- Execute este script para confirmar que tudo está OK
-- ============================================

-- 1. VERIFICAR TABELAS
SELECT 
  '✅ TABELAS' as categoria,
  table_name as item,
  'Criada' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')
ORDER BY 
  CASE table_name
    WHEN 'warranties' THEN 1
    WHEN 'profiles' THEN 2
    WHEN 'chats' THEN 3
    WHEN 'chat_participants' THEN 4
    WHEN 'messages' THEN 5
  END;

-- 2. VERIFICAR BUCKETS DE STORAGE
SELECT 
  '✅ STORAGE BUCKETS' as categoria,
  name as item,
  CASE 
    WHEN public THEN 'Público'
    ELSE 'Privado'
  END as status
FROM storage.buckets
WHERE id IN ('invoices', 'chat-media')
ORDER BY name;

-- 3. VERIFICAR POLÍTICAS RLS (Contagem)
SELECT 
  '✅ POLÍTICAS RLS' as categoria,
  COUNT(*)::text || ' políticas configuradas' as item,
  'OK' as status
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND (
    (schemaname = 'public' AND tablename IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages'))
    OR (schemaname = 'storage' AND tablename = 'objects')
  );

-- 4. VERIFICAR REALTIME
SELECT 
  '✅ REALTIME' as categoria,
  tablename as item,
  'Ativado' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants')
ORDER BY tablename;

-- 5. RESUMO FINAL
SELECT 
  '📊 RESUMO' as categoria,
  'Total de tabelas' as item,
  COUNT(*)::text as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('warranties', 'profiles', 'chats', 'chat_participants', 'messages')

UNION ALL

SELECT 
  '📊 RESUMO' as categoria,
  'Total de buckets' as item,
  COUNT(*)::text as status
FROM storage.buckets
WHERE id IN ('invoices', 'chat-media')

UNION ALL

SELECT 
  '📊 RESUMO' as categoria,
  'Tabelas no Realtime' as item,
  COUNT(*)::text as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants');

-- ============================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- ============================================
-- ✅ Se você vê:
--   - 5 tabelas (warranties, profiles, chats, chat_participants, messages)
--   - 2 buckets (invoices, chat-media)
--   - Políticas RLS configuradas
--   - 3 tabelas no Realtime (messages, chats, chat_participants)
-- 
-- Então TUDO ESTÁ CONFIGURADO CORRETAMENTE! 🎉
-- ============================================
