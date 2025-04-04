#!/bin/bash
# Script para testar o ambiente com Supabase habilitado

echo "Iniciando teste com Supabase habilitado..."

# Criar backup do .env.production original
cp .env.production .env.production.bak

# Ativar temporariamente o Supabase
sed -i 's/USE_SUPABASE=false/USE_SUPABASE=true/g' .env.production

# Iniciar o servidor
echo "Iniciando servidor com Supabase ativado..."
NODE_ENV=production node setup-env.js && NODE_ENV=production node server.js &
SERVER_PID=$!

echo "Servidor iniciado com PID $SERVER_PID"
echo "Pressione CTRL+C para encerrar o teste"

# Função para restaurar quando o script for interrompido
cleanup() {
    echo "Encerrando teste..."
    kill $SERVER_PID
    
    # Restaurar .env.production original
    mv .env.production.bak .env.production
    
    echo "Ambiente restaurado. Supabase desativado."
    exit 0
}

# Detectar CTRL+C
trap cleanup SIGINT

# Manter o script em execução
while true; do
    sleep 1
done 