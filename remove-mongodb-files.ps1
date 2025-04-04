# Script PowerShell para remover arquivos relacionados ao MongoDB

Write-Host "🧹 Script de limpeza de arquivos legados do MongoDB" -ForegroundColor Cyan
Write-Host "Este script irá remover arquivos relacionados ao MongoDB que não são mais necessários." -ForegroundColor Yellow
Write-Host "⚠️ ATENÇÃO: Certifique-se de que a migração para o Supabase está concluída e funcionando." -ForegroundColor Red

$confirmation = Read-Host "Tem certeza que deseja continuar? Esta ação não pode ser desfeita. (s/n)"
if ($confirmation -ne "s") {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Yellow
    exit
}

# Lista de arquivos a serem removidos
$filesToRemove = @(
    "api\db-initialize.js",
    "api\debug-database.js",
    "src\services\realtimeService.js",
    "models\mongoose.js",
    "src\services\api.js"
)

# Verificar se existem arquivos de configuração MongoDB
$configFilesToCheck = @(
    "mongo-setup.js",
    "mongoDB.config.js"
)

# Adicionar arquivos de configuração se existirem
foreach ($configFile in $configFilesToCheck) {
    if (Test-Path $configFile) {
        $filesToRemove += $configFile
    }
}

Write-Host "`n🔍 Arquivos que serão removidos:" -ForegroundColor Cyan
foreach ($file in $filesToRemove) {
    Write-Host "- $file"
}

$finalConfirmation = Read-Host "`n❓ Confirmar exclusão destes arquivos? (s/n)"
if ($finalConfirmation -ne "s") {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Yellow
    exit
}

# Fazer backup antes de excluir
try {
    $backupDir = "backup-mongodb"
    if (-not (Test-Path $backupDir)) {
        New-Item -Path $backupDir -ItemType Directory
    }
    
    Write-Host "`n📦 Criando backup dos arquivos..." -ForegroundColor Cyan
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            $fileName = Split-Path $file -Leaf
            $destPath = Join-Path $backupDir $fileName
            Copy-Item $file $destPath
            Write-Host "✅ Backup criado: $destPath" -ForegroundColor Green
        }
    }
    
    # Remover arquivos
    Write-Host "`n🗑️ Removendo arquivos..." -ForegroundColor Cyan
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Host "✅ Removido: $file" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Arquivo não encontrado: $file" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Limpeza concluída com sucesso!" -ForegroundColor Green
    Write-Host "Um backup dos arquivos removidos foi criado em: $backupDir" -ForegroundColor Cyan
    
    # Perguntar se deseja fazer commit das alterações
    $commitAnswer = Read-Host "`n❓ Deseja fazer commit das alterações? (s/n)"
    if ($commitAnswer -eq "s") {
        try {
            Write-Host "`n📝 Realizando commit das alterações..." -ForegroundColor Cyan
            git add .
            git commit -m "Limpeza após migração para Supabase"
            Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
            
            $pushAnswer = Read-Host "`n❓ Deseja enviar as alterações para o repositório remoto? (s/n)"
            if ($pushAnswer -eq "s") {
                try {
                    Write-Host "`n📤 Enviando alterações para o repositório remoto..." -ForegroundColor Cyan
                    git push origin main
                    Write-Host "✅ Alterações enviadas com sucesso!" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Erro ao enviar alterações: $_" -ForegroundColor Red
                }
            } else {
                Write-Host "Operação de push cancelada pelo usuário." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Erro ao fazer commit: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Operação de commit cancelada pelo usuário." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro durante o processo de limpeza: $_" -ForegroundColor Red
} 