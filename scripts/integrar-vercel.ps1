# Script para Integração Direta com Vercel
# Warranty Tracker

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INTEGRAÇÃO DIRETA COM VERCEL" -ForegroundColor Cyan
Write-Host "  Warranty Tracker" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se Vercel CLI está instalado
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar Vercel CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel CLI instalado!`n" -ForegroundColor Green
}

Write-Host "🔐 Verificando autenticação Vercel..." -ForegroundColor Cyan
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Não autenticado no Vercel" -ForegroundColor Yellow
    Write-Host "Iniciando login..." -ForegroundColor Cyan
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao fazer login no Vercel" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Autenticado como: $vercelWhoami`n" -ForegroundColor Green
}

Write-Host "🚀 Verificando projeto no Vercel..." -ForegroundColor Cyan
$projectExists = vercel ls 2>&1 | Select-String "warranty-tracker"
if (-not $projectExists) {
    Write-Host "📝 Projeto não encontrado. Criando novo projeto..." -ForegroundColor Yellow
    Write-Host "`nSiga as instruções na tela:" -ForegroundColor Cyan
    Write-Host "  - Escolha o escopo (pessoal ou time)" -ForegroundColor White
    Write-Host "  - Confirme o nome do projeto" -ForegroundColor White
    Write-Host "  - Escolha o diretório (./)" -ForegroundColor White
    Write-Host "  - Configure variáveis de ambiente depois`n" -ForegroundColor White
    
    vercel --yes
} else {
    Write-Host "✅ Projeto encontrado no Vercel`n" -ForegroundColor Green
    Write-Host "🌐 Fazendo deploy..." -ForegroundColor Cyan
    vercel --prod --yes
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deploy concluído com sucesso!`n" -ForegroundColor Green
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Configure variáveis de ambiente no Vercel Dashboard" -ForegroundColor White
    Write-Host "  2. Verifique o domínio de produção" -ForegroundColor White
    Write-Host "  3. Teste a aplicação`n" -ForegroundColor White
} else {
    Write-Host "`n❌ Erro no deploy. Verifique os logs acima.`n" -ForegroundColor Red
}
