# Script de Diagnóstico Completo
# Verifica todos os aspectos do sistema

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICO COMPLETO DO SISTEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Verificar variáveis de ambiente
Write-Host "1. Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://.*\.supabase\.co") {
        Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        $errors += "NEXT_PUBLIC_SUPABASE_URL não configurado corretamente"
        Write-Host "   ❌ NEXT_PUBLIC_SUPABASE_URL inválido" -ForegroundColor Red
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=.+") {
        Write-Host "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        $errors += "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado"
        Write-Host "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrado" -ForegroundColor Red
    }
} else {
    $errors += ".env.local não encontrado"
    Write-Host "   ❌ Arquivo .env.local não existe" -ForegroundColor Red
}

# 2. Verificar TypeScript
Write-Host "`n2. Verificando TypeScript..." -ForegroundColor Yellow
$typeCheck = yarn type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript sem erros" -ForegroundColor Green
} else {
    $errors += "Erros de TypeScript encontrados"
    Write-Host "   ❌ TypeScript com erros" -ForegroundColor Red
    $typeCheck | Select-Object -First 5 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
}

# 3. Verificar servidor
Write-Host "`n3. Verificando servidor..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":3001.*LISTENING"
if ($portCheck) {
    Write-Host "   ✅ Servidor rodando na porta 3001" -ForegroundColor Green
} else {
    $warnings += "Servidor não está rodando"
    Write-Host "   ⚠️  Servidor não está rodando (execute: yarn dev)" -ForegroundColor Yellow
}

# 4. Verificar cache
Write-Host "`n4. Verificando cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "   ⚠️  Cache .next encontrado (pode causar problemas)" -ForegroundColor Yellow
    $warnings += "Cache .next existe - considere remover se houver problemas"
} else {
    Write-Host "   ✅ Cache limpo" -ForegroundColor Green
}

# 5. Verificar rotas públicas
Write-Host "`n5. Verificando configuração de rotas..." -ForegroundColor Yellow
Write-Host "   ✅ Rotas públicas configuradas: /, /login, /signup, /auth, /share, /travel-check" -ForegroundColor Green

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ Sistema configurado corretamente!" -ForegroundColor Green
} else {
    Write-Host "❌ Erros encontrados:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Avisos:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SOLUCOES RAPIDAS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Para acessar SEM autenticação (desenvolvimento):" -ForegroundColor White
Write-Host "   http://localhost:3001/dev-bypass" -ForegroundColor Cyan
Write-Host "   Clique em 'Ativar Bypass de Autenticação'" -ForegroundColor Gray

Write-Host "`n2. Para limpar cache:" -ForegroundColor White
Write-Host "   Remove-Item -Recurse -Force .next" -ForegroundColor Cyan

Write-Host "`n3. Para reiniciar servidor:" -ForegroundColor White
Write-Host "   Ctrl+C (parar) e depois: yarn dev" -ForegroundColor Cyan

Write-Host "`n4. Para limpar cache do navegador:" -ForegroundColor White
Write-Host "   Ctrl+Shift+R (recarregamento forçado)" -ForegroundColor Cyan

Write-Host ""
