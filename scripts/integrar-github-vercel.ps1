# Script para Integração Completa GitHub + Vercel
# Warranty Tracker

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INTEGRAÇÃO GITHUB + VERCEL" -ForegroundColor Cyan
Write-Host "  Warranty Tracker" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar Git
Write-Host "📦 1. Verificando Git..." -ForegroundColor Cyan
$gitRemote = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repositório Git: $gitRemote`n" -ForegroundColor Green
} else {
    Write-Host "❌ Repositório Git não configurado" -ForegroundColor Red
    exit 1
}

# 2. Verificar se há mudanças não commitadas
Write-Host "📝 2. Verificando mudanças..." -ForegroundColor Cyan
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "⚠️  Há mudanças não commitadas:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    $commit = Read-Host "`nDeseja fazer commit? (S/N)"
    if ($commit -eq "S" -or $commit -eq "s") {
        git add .
        $message = Read-Host "Mensagem do commit"
        if (-not $message) { 
            $message = "chore: atualização automática" 
        }
        git commit -m $message
        git push origin staging
        Write-Host "✅ Mudanças commitadas e enviadas`n" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Nenhuma mudança pendente`n" -ForegroundColor Green
}

# 3. Verificar Vercel CLI
Write-Host "🔧 3. Verificando Vercel CLI..." -ForegroundColor Cyan
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 4. Autenticar no Vercel
Write-Host "`n🔐 4. Autenticando no Vercel..." -ForegroundColor Cyan
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Não autenticado. Fazendo login..." -ForegroundColor Yellow
    vercel login
}

# 5. Verificar/Criar projeto no Vercel
Write-Host "`n🚀 5. Verificando projeto no Vercel..." -ForegroundColor Cyan
$projectInfo = vercel ls 2>&1 | Select-String "warranty-tracker"
if (-not $projectInfo) {
    Write-Host "📝 Criando novo projeto no Vercel..." -ForegroundColor Yellow
    Write-Host "`nSiga as instruções:" -ForegroundColor Cyan
    Write-Host "  - Escolha escopo (pessoal/team)" -ForegroundColor White
    Write-Host "  - Confirme nome: warranty-tracker" -ForegroundColor White
    Write-Host "  - Diretório: ./" -ForegroundColor White
    Write-Host "  - Framework: Next.js (detectado automaticamente)`n" -ForegroundColor White
    
    vercel --yes
} else {
    Write-Host "✅ Projeto já existe no Vercel`n" -ForegroundColor Green
}

# 6. Configurar variáveis de ambiente
Write-Host "`n⚙️  6. Configurando variáveis de ambiente..." -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Write-Host "📋 Variáveis encontradas no .env.local:" -ForegroundColor Yellow
    Get-Content .env.local | Where-Object { $_ -match "^[A-Z_]+=" } | ForEach-Object {
        $key = ($_ -split "=")[0]
        Write-Host "  - $key" -ForegroundColor Gray
    }
    
    Write-Host "`n⚠️  IMPORTANTE: Configure manualmente no Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Acesse: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "  2. Vá em Settings > Environment Variables" -ForegroundColor White
    Write-Host "  3. Adicione as variáveis do .env.local`n" -ForegroundColor White
} else {
    Write-Host "⚠️  Arquivo .env.local não encontrado`n" -ForegroundColor Yellow
}

# 7. Fazer deploy
Write-Host "`n🌐 7. Fazendo deploy para produção..." -ForegroundColor Cyan
$deploy = Read-Host "Deseja fazer deploy agora? (S/N)"
if ($deploy -eq "S" -or $deploy -eq "s") {
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deploy concluído!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erro no deploy`n" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Deploy pulado. Execute 'vercel --prod' quando quiser.`n" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INTEGRAÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📚 Links úteis:" -ForegroundColor Yellow
Write-Host "  - GitHub: https://github.com/felipemonteiro-bfx/warranty-tracker" -ForegroundColor White
Write-Host "  - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  - GitHub Actions: https://github.com/felipemonteiro-bfx/warranty-tracker/actions`n" -ForegroundColor White
