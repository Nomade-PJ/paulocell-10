#!/bin/bash

# Script para corrigir o erro de importação no server.js

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Iniciando correção do erro de importação...${NC}"

# Conectar ao servidor e corrigir o problema
echo -e "${YELLOW}Digite o nome de usuário do servidor:${NC}"
read username

echo -e "${YELLOW}Digite o endereço IP do servidor:${NC}"
read server_ip

# Conectar ao servidor e corrigir o código
echo -e "${YELLOW}Conectando ao servidor e corrigindo o erro...${NC}"
ssh $username@$server_ip << 'EOF'
    cd /var/www/paulocell
    
    # Backup do arquivo original
    echo "Criando backup do arquivo server.js..."
    cp server.js server.js.backup-$(date +%Y%m%d%H%M%S)
    
    # Verificar se o arquivo server.js contém o caminho de importação incorreto
    if grep -q "import apiRoutes from './routes.js';" server.js; then
        # Substituir o caminho de importação incorreto pelo correto
        sed -i "s|import apiRoutes from './routes.js';|import apiRoutes from './src/api/routes.js';|g" server.js
        echo "Caminho de importação corrigido no server.js"
    fi
    
    # Remover o arquivo routes.js copiado do diretório raiz, se existir
    if [ -f "routes.js" ]; then
        rm routes.js
        echo "Arquivo routes.js incorreto removido do diretório raiz."
    fi
    
    # Reiniciar a aplicação
    echo "Reiniciando a aplicação..."
    pm2 restart paulocell
    
    echo "Correção do caminho de importação concluída e aplicação reiniciada."
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Correção aplicada com sucesso!${NC}"
else
    echo -e "${YELLOW}Ocorreu um erro ao aplicar a correção. Verifique a conexão SSH e tente novamente.${NC}"
fi