-- ============================================
-- CONFIGURAÇÃO COMPLETA DE STORAGE BUCKETS
-- Warranty Tracker
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar bucket 'invoices' (público) - Para notas fiscais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', true, 10485760, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/*', 'application/pdf'];

-- Criar bucket 'chat-media' (privado) - Para mídia de mensagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*'])
ON CONFLICT (id) DO UPDATE 
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/*', 'video/*', 'audio/*'];

-- ============================================
-- POLÍTICAS RLS PARA BUCKET 'invoices'
-- ============================================

-- Política: Permitir upload para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

-- Política: Permitir leitura apenas para o dono do arquivo
-- O arquivo deve estar em uma pasta com o user_id
DROP POLICY IF EXISTS "Allow owners to see their own files" ON storage.objects;
CREATE POLICY "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Permitir atualização apenas para o dono
DROP POLICY IF EXISTS "Allow owners to update their own files" ON storage.objects;
CREATE POLICY "Allow owners to update their own files"
  ON storage.objects FOR UPDATE
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Permitir exclusão apenas para o dono
DROP POLICY IF EXISTS "Allow owners to delete their own files" ON storage.objects;
CREATE POLICY "Allow owners to delete their own files"
  ON storage.objects FOR DELETE
  USING ( 
    bucket_id = 'invoices' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- POLÍTICAS RLS PARA BUCKET 'chat-media'
-- ============================================

-- Política: Permitir upload para usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

-- Política: Permitir leitura para usuários autenticados
-- (Em produção, considere usar Signed URLs para maior segurança)
DROP POLICY IF EXISTS "Participants can view media" ON storage.objects;
CREATE POLICY "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

-- Política: Permitir atualização para usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

-- Política: Permitir exclusão para usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Authenticated users can delete media"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar buckets criados
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id IN ('invoices', 'chat-media');

-- Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%invoices%' OR policyname LIKE '%chat-media%' OR policyname LIKE '%media%')
ORDER BY policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Buckets e políticas configurados!
-- ============================================
