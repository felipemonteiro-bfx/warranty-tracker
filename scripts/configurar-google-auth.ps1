# Script para ajudar na configuração do Google OAuth

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR GOOGLE OAUTH" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Este script vai te guiar na configuracao do Google OAuth.`n" -ForegroundColor Yellow

Write-Host "PASSO 1: Google Cloud Console" -ForegroundColor Green
Write-Host "1. Acesse: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Crie um novo projeto ou selecione um existente" -ForegroundColor White
Write-Host "3. Vá em: APIs e Servicos > Tela de consentimento OAuth" -ForegroundColor White
Write-Host "4. Configure a tela de consentimento:" -ForegroundColor White
Write-Host "   - Tipo: Externo (para desenvolvimento)" -ForegroundColor Gray
Write-Host "   - Nome: Guardiao" -ForegroundColor Gray
Write-Host "   - Email de suporte: Seu email" -ForegroundColor Gray
Write-Host "   - Escopos: email, profile, openid" -ForegroundColor Gray
Write-Host "   - Adicione seu email como usuario de teste" -ForegroundColor Gray
Write-Host ""

$continue1 = Read-Host "Ja configurou a Tela de Consentimento? (S/N)"
if ($continue1 -ne "S" -and $continue1 -ne "s") {
    Write-Host "`nConfigure primeiro e depois continue.`n" -ForegroundColor Yellow
    exit
}

Write-Host "`nPASSO 2: Criar Credenciais OAuth" -ForegroundColor Green
Write-Host "1. Vá em: APIs e Servicos > Credenciais" -ForegroundColor White
Write-Host "2. Clique em: + Criar credenciais > ID do cliente OAuth" -ForegroundColor White
Write-Host "3. Tipo: Aplicativo da Web" -ForegroundColor White
Write-Host "4. Nome: Guardiao Web Client" -ForegroundColor White
Write-Host "5. URIs de redirecionamento autorizados:" -ForegroundColor White
Write-Host "   http://localhost:3001/auth/callback" -ForegroundColor Cyan
Write-Host "   (Adicione tambem seu dominio de producao quando tiver)" -ForegroundColor Gray
Write-Host "6. Clique em Criar" -ForegroundColor White
Write-Host ""

$continue2 = Read-Host "Ja criou as credenciais? (S/N)"
if ($continue2 -ne "S" -and $continue2 -ne "s") {
    Write-Host "`nCrie primeiro e depois continue.`n" -ForegroundColor Yellow
    exit
}

Write-Host "`nPASSO 3: Obter Credenciais" -ForegroundColor Green
$clientId = Read-Host "Cole o Client ID (ID do Cliente)"
$clientSecret = Read-Host "Cole o Client Secret (Segredo do Cliente)"

if (-not $clientId -or -not $clientSecret) {
    Write-Host "`nCredenciais nao fornecidas. Configure manualmente no Supabase.`n" -ForegroundColor Yellow
    exit
}

Write-Host "`nPASSO 4: Configurar no Supabase" -ForegroundColor Green
Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Selecione seu projeto" -ForegroundColor White
Write-Host "3. Vá em: Authentication > Providers" -ForegroundColor White
Write-Host "4. Encontre 'Google' e clique para expandir" -ForegroundColor White
Write-Host "5. Ative o toggle 'Enable Google provider'" -ForegroundColor White
Write-Host "6. Cole as credenciais:" -ForegroundColor White
Write-Host "   Client ID: $clientId" -ForegroundColor Cyan
Write-Host "   Client Secret: $clientSecret" -ForegroundColor Cyan
Write-Host "7. Clique em Save" -ForegroundColor White
Write-Host ""

Write-Host "PASSO 5: Verificar Redirect URLs" -ForegroundColor Green
Write-Host "1. Ainda em Authentication > URL Configuration" -ForegroundColor White
Write-Host "2. Verifique se esta configurado:" -ForegroundColor White
Write-Host "   Site URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Redirect URLs:" -ForegroundColor White
Write-Host "     http://localhost:3001/auth/callback" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Agora voce pode:" -ForegroundColor Yellow
Write-Host "1. Acessar: http://localhost:3001/login" -ForegroundColor White
Write-Host "2. Clicar em 'Continuar com Google'" -ForegroundColor White
Write-Host "3. Fazer login com sua conta Google" -ForegroundColor White
Write-Host ""

Write-Host "Credenciais para configurar no Supabase:" -ForegroundColor Cyan
Write-Host "Client ID: $clientId" -ForegroundColor White
Write-Host "Client Secret: $clientSecret" -ForegroundColor White
Write-Host ""
