-- ============================================
-- CONFIGURAÇÃO DE REALTIME PARA MENSAGENS
-- Warranty Tracker
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Ativar Realtime nas tabelas de mensagens
-- Isso permite que mensagens apareçam em tempo real sem refresh

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar quais tabelas estão no Realtime
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'chats', 'chat_participants');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Realtime ativado para mensagens!
-- ============================================
