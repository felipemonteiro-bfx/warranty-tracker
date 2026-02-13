# Script para verificar configuracao completa
# Verifica Supabase, Stripe e outras configuracoes

Write-Host "Verificacao Completa de Configuracao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Verificar .env.local
if (-not (Test-Path ".env.local")) {
    $errors += "Arquivo .env.local nao encontrado"
} else {
    Write-Host "Arquivo .env.local encontrado" -ForegroundColor Green
    
    # Ler variaveis
    $envContent = Get-Content ".env.local" -Raw
    
    # Verificar Supabase
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://.*\.supabase\.co") {
        Write-Host "NEXT_PUBLIC_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        $errors += "NEXT_PUBLIC_SUPABASE_URL nao configurado corretamente"
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=.+") {
        Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        $errors += "NEXT_PUBLIC_SUPABASE_ANON_KEY nao configurado"
    }
    
    # Verificar Stripe
    if ($envContent -match "STRIPE_SECRET_KEY=sk_.+") {
        Write-Host "STRIPE_SECRET_KEY configurado" -ForegroundColor Green
    } else {
        $errors += "STRIPE_SECRET_KEY nao configurado"
    }
    
    if ($envContent -match "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_.+") {
        Write-Host "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configurado" -ForegroundColor Green
    } else {
        $errors += "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY nao configurado"
    }
    
    # Verificar opcionais
    if ($envContent -match "NEXT_PUBLIC_GEMINI_API_KEY=.+") {
        Write-Host "NEXT_PUBLIC_GEMINI_API_KEY configurado (opcional)" -ForegroundColor Yellow
    } else {
        $warnings += "NEXT_PUBLIC_GEMINI_API_KEY nao configurado (opcional)"
    }
    
    if ($envContent -match "STRIPE_WEBHOOK_SECRET=whsec_.+") {
        Write-Host "STRIPE_WEBHOOK_SECRET configurado (opcional)" -ForegroundColor Yellow
    } else {
        $warnings += "STRIPE_WEBHOOK_SECRET nao configurado (opcional)"
    }
}

Write-Host ""
Write-Host "Verificando TypeScript..." -ForegroundColor Cyan
$typeCheck = yarn type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript: Sem erros" -ForegroundColor Green
} else {
    $errors += "TypeScript: Erros encontrados"
    Write-Host $typeCheck -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificando servidor local..." -ForegroundColor Cyan
$portCheck = netstat -ano | Select-String ":3001"
if ($portCheck) {
    Write-Host "Servidor rodando na porta 3001" -ForegroundColor Green
    Write-Host "Acesse: http://localhost:3001" -ForegroundColor Cyan
} else {
    $warnings += "Servidor nao esta rodando (execute: yarn dev)"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "Configuracao completa!" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Avisos:" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    }
} else {
    Write-Host "Erros encontrados:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Execute: .\scripts\setup-supabase.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Documentacao:" -ForegroundColor Cyan
Write-Host "   - CONFIGURAR_SUPABASE.md" -ForegroundColor White
Write-Host "   - CHECKLIST_DEPLOY.md" -ForegroundColor White
Write-Host "   - VERIFICACAO_COMPLETA.md" -ForegroundColor White
