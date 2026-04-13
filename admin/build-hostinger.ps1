# Script para build do Admin para Hostinger
# Este script gera arquivos estaticos HTML que podem ser hospedados em qualquer servidor

Write-Host "Preparando build para Hostinger..." -ForegroundColor Cyan

# Verificar se ja existe backup
if (Test-Path next.config.backup.ts) {
    Write-Host "Removendo backup antigo..." -ForegroundColor Yellow
    Remove-Item next.config.backup.ts
}

# Backup do next.config.ts original
Write-Host "Fazendo backup da configuracao..." -ForegroundColor Yellow
Copy-Item next.config.ts next.config.backup.ts -Force

# Usar configuracao do Hostinger
Write-Host "Aplicando configuracao para export estatico..." -ForegroundColor Yellow
Copy-Item next.config.hostinger.ts next.config.ts -Force

# Limpar pasta out anterior se existir
if (Test-Path out) {
    Write-Host "Removendo build anterior..." -ForegroundColor Yellow
    Remove-Item out -Recurse -Force
}

# Fazer o build
Write-Host "Gerando build estatico..." -ForegroundColor Green
npm run build

# Verificar se a pasta out foi criada
if (Test-Path out) {
    Write-Host "Pasta out/ criada com sucesso!" -ForegroundColor Green
    $fileCount = (Get-ChildItem out -Recurse -File).Count
    Write-Host "Total de arquivos gerados: $fileCount" -ForegroundColor Cyan
} else {
    Write-Host "ERRO: Pasta out/ nao foi criada!" -ForegroundColor Red
    Write-Host "Verifique se ha erros no build acima." -ForegroundColor Yellow
}

# Restaurar configuracao original
Write-Host "Restaurando configuracao original..." -ForegroundColor Yellow
if (Test-Path next.config.backup.ts) {
    Copy-Item next.config.backup.ts next.config.ts -Force
    Remove-Item next.config.backup.ts
    Write-Host "Configuracao restaurada!" -ForegroundColor Green
} else {
    Write-Host "Backup nao encontrado, mas continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Build concluido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos estaticos gerados em: out/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para fazer upload no Hostinger:" -ForegroundColor Yellow
Write-Host "  1. Acesse o File Manager do Hostinger" -ForegroundColor White
Write-Host "  2. Navegue ate public_html/ (ou pasta do dominio)" -ForegroundColor White
Write-Host "  3. Faca upload de TODOS os arquivos da pasta out/" -ForegroundColor White
Write-Host "  4. Certifique-se que o arquivo index.html esta na raiz" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: A API URL ja esta configurada como:" -ForegroundColor Red
Write-Host "  NEXT_PUBLIC_API_URL=https://backend-production-60f8.up.railway.app" -ForegroundColor White
Write-Host ""
