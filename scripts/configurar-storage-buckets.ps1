# Script para Configurar Storage Buckets no Supabase
# Warranty Tracker

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR STORAGE BUCKETS" -ForegroundColor Cyan
Write-Host "  Warranty Tracker" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Este script irá guiá-lo na configuração dos Storage Buckets no Supabase.`n" -ForegroundColor Yellow

# Verificar se está no diretório correto
if (-not (Test-Path "docs/schema.sql")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto warranty-tracker" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Buckets Necessários:" -ForegroundColor Green
Write-Host "  1. invoices (PÚBLICO) - Para notas fiscais" -ForegroundColor White
Write-Host "  2. chat-media (PRIVADO) - Para mídia de mensagens`n" -ForegroundColor White

Write-Host "Escolha o método de configuração:" -ForegroundColor Yellow
Write-Host "  1. Via Interface do Supabase (Recomendado)" -ForegroundColor White
Write-Host "  2. Via SQL (Script completo)" -ForegroundColor White
Write-Host "  3. Verificar configuração atual" -ForegroundColor White
Write-Host "  4. Abrir Dashboard do Supabase`n" -ForegroundColor White

$opcao = Read-Host "Digite o número da opção (1-4)"

switch ($opcao) {
    "1" {
        Write-Host "`n📋 INSTRUÇÕES PARA CONFIGURAÇÃO VIA INTERFACE:`n" -ForegroundColor Cyan
        
        Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Selecione seu projeto" -ForegroundColor White
        Write-Host "3. Vá em Storage > Create bucket`n" -ForegroundColor White
        
        Write-Host "BUCKET 1: invoices" -ForegroundColor Green
        Write-Host "  - Name: invoices" -ForegroundColor White
        Write-Host "  - Public: ✅ SIM (ativado)" -ForegroundColor White
        Write-Host "  - File size limit: 10MB (ou padrão)" -ForegroundColor White
        Write-Host "  - Allowed MIME types: image/*,application/pdf (opcional)`n" -ForegroundColor White
        
        Write-Host "BUCKET 2: chat-media" -ForegroundColor Green
        Write-Host "  - Name: chat-media" -ForegroundColor White
        Write-Host "  - Public: ❌ NÃO (desativado)" -ForegroundColor White
        Write-Host "  - File size limit: 50MB (ou padrão)" -ForegroundColor White
        Write-Host "  - Allowed MIME types: image/*,video/*,audio/* (opcional)`n" -ForegroundColor White
        
        Write-Host "4. Após criar os buckets, execute as políticas SQL:" -ForegroundColor Yellow
        Write-Host "   - Abra o SQL Editor no Supabase" -ForegroundColor White
        Write-Host "   - Execute o script abaixo:`n" -ForegroundColor White
        
        Write-Host "SQL para Políticas:" -ForegroundColor Cyan
        $sqlPoliticas = @"
-- Políticas para bucket 'invoices'
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Políticas para bucket 'chat-media'
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );
"@
        Write-Host $sqlPoliticas -ForegroundColor Gray
        
        Write-Host "`n✅ Após executar, os buckets estarão configurados!`n" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "`n📝 SCRIPT SQL COMPLETO:`n" -ForegroundColor Cyan
        
        $sqlCompleto = @"
-- ============================================
-- CONFIGURAÇÃO COMPLETA DE STORAGE BUCKETS
-- Warranty Tracker
-- ============================================

-- Criar bucket 'invoices' (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', true, 10485760, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Criar bucket 'chat-media' (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*'])
ON CONFLICT (id) DO UPDATE 
SET public = false;

-- Políticas para 'invoices'
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Políticas para 'chat-media'
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );
"@
        
        Write-Host $sqlCompleto -ForegroundColor Gray
        
        Write-Host "`n📋 PRÓXIMOS PASSOS:`n" -ForegroundColor Yellow
        Write-Host "1. Copie o SQL acima" -ForegroundColor White
        Write-Host "2. Acesse: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "3. Selecione seu projeto" -ForegroundColor White
        Write-Host "4. Vá em SQL Editor" -ForegroundColor White
        Write-Host "5. Cole o SQL e clique em 'Run'`n" -ForegroundColor White
        
        Write-Host "✅ Isso criará os buckets e políticas automaticamente!`n" -ForegroundColor Green
        
        $copiar = Read-Host "Deseja copiar o SQL para a área de transferência? (S/N)"
        if ($copiar -eq "S" -or $copiar -eq "s") {
            $sqlCompleto | Set-Clipboard
            Write-Host "✅ SQL copiado para a área de transferência!`n" -ForegroundColor Green
        }
    }
    
    "3" {
        Write-Host "`n🔍 VERIFICAÇÃO DE CONFIGURAÇÃO:`n" -ForegroundColor Cyan
        
        Write-Host "Para verificar se os buckets estão configurados:" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Selecione seu projeto" -ForegroundColor White
        Write-Host "3. Vá em Storage" -ForegroundColor White
        Write-Host "4. Verifique se existem:" -ForegroundColor White
        Write-Host "   ✅ invoices (com ícone de globo 🌐)" -ForegroundColor Green
        Write-Host "   ✅ chat-media (sem ícone de globo)" -ForegroundColor Green
        
        Write-Host "`n5. Para verificar políticas:" -ForegroundColor Yellow
        Write-Host "   - Clique em cada bucket > Policies" -ForegroundColor White
        Write-Host "   - Deve haver políticas de INSERT e SELECT`n" -ForegroundColor White
        
        Write-Host "Ou execute este SQL no SQL Editor:" -ForegroundColor Yellow
        $sqlVerificacao = @"
-- Verificar buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('invoices', 'chat-media');

-- Verificar políticas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%invoices%' OR policyname LIKE '%chat-media%';
"@
        Write-Host $sqlVerificacao -ForegroundColor Gray
        Write-Host ""
    }
    
    "4" {
        Write-Host "`n🌐 Abrindo Dashboard do Supabase...`n" -ForegroundColor Cyan
        Start-Process "https://supabase.com/dashboard"
        Write-Host "✅ Dashboard aberto no navegador!`n" -ForegroundColor Green
    }
    
    default {
        Write-Host "`n❌ Opção inválida!`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📚 Documentação completa: CONFIGURAR_STORAGE_BUCKETS.md`n" -ForegroundColor Yellow
