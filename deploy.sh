#!/bin/bash
# Script de implantação para o servidor VPS Hostinger

# Verifica se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "PM2 não encontrado. Instalando..."
    npm install -g pm2
fi

echo "Iniciando implantação no servidor VPS Hostinger..."

# Atualizar código do repositório
echo "Atualizando código do repositório..."
git pull

# Instalar dependências
echo "Instalando dependências..."
npm install

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build

# Verificar se o Supabase deve ser ativado
echo "Deseja ativar o Supabase para esta implantação? (s/n)"
read ativar_supabase

if [ "$ativar_supabase" = "s" ] || [ "$ativar_supabase" = "S" ]; then
    echo "Ativando Supabase..."
    # Editar o arquivo .env.production para definir USE_SUPABASE=true
    sed -i 's/USE_SUPABASE=false/USE_SUPABASE=true/g' .env.production
    
    # Executar migração para Supabase (opcional)
    echo "Deseja executar a migração de dados para o Supabase? (s/n)"
    read executar_migracao
    
    if [ "$executar_migracao" = "s" ] || [ "$executar_migracao" = "S" ]; then
        echo "Executando migração para Supabase..."
        npm run migrate:to-supabase
    fi
fi

# Reiniciar a aplicação usando PM2
echo "Reiniciando a aplicação..."
pm2 describe paulocell > /dev/null
if [ $? -eq 0 ]; then
    # O serviço já existe, então reinicie
    pm2 restart paulocell
else
    # O serviço não existe, então inicie
    pm2 start server.js --name "paulocell" --env production
fi

# Salvar configuração do PM2 para reiniciar automaticamente após reboot
pm2 save

echo "Implantação concluída com sucesso!"
echo "Acesse o aplicativo em: http://92.112.176.152" 