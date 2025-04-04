#!/bin/bash
# Script para implantar o projeto na VPS da Hostinger

# Definir variáveis
SSH_HOST="92.112.176.152"
SSH_USER="root"
REPO_URL="https://github.com/seu-usuario/paulocell.git"
DEPLOY_DIR="/var/www/paulocell"

echo "=== Iniciando implantação na VPS da Hostinger ==="
echo "Host: $SSH_HOST"
echo "Diretório: $DEPLOY_DIR"

# Instruções para conectar via SSH
echo "
Para implantar o projeto na VPS da Hostinger, siga os seguintes passos:

1. Conecte-se à VPS via SSH:
   ssh ${SSH_USER}@${SSH_HOST}

2. Clone o repositório (primeira vez) ou atualize (implantações subsequentes):
   # Se for a primeira implantação:
   mkdir -p ${DEPLOY_DIR}
   cd ${DEPLOY_DIR}
   git clone ${REPO_URL} .
   
   # Se for uma atualização:
   cd ${DEPLOY_DIR}
   git pull

3. Configure o ambiente:
   cp .env.example .env.production
   # Edite o arquivo .env.production com as credenciais corretas
   nano .env.production

4. Instale as dependências:
   npm install --production

5. Execute o script de implantação:
   chmod +x deploy.sh
   ./deploy.sh

6. Verifique se tudo está funcionando:
   pm2 status
   # Para ver os logs:
   pm2 logs paulocell
"

echo "=== Instruções de implantação geradas com sucesso ===" 