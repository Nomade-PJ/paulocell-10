#!/bin/bash

# Script para enviar alterações para o GitHub e atualizar o servidor

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# Verificar se há alterações para commitar
echo -e "${YELLOW}Verificando alterações no repositório...${NC}"
git status

# Adicionar todas as alterações
echo -e "${YELLOW}Adicionando todas as alterações...${NC}"
git add .

# Solicitar mensagem de commit
echo -e "${YELLOW}Digite a mensagem para o commit:${NC}"
read commit_message

# Realizar o commit com a mensagem fornecida
echo -e "${YELLOW}Realizando commit das alterações...${NC}"
git commit -m "$commit_message"

# Verificar se o repositório remoto está configurado corretamente
echo -e "${YELLOW}Verificando configuração do repositório remoto...${NC}"
git remote -v

# Configurar o repositório remoto se necessário
echo -e "${YELLOW}Configurando repositório remoto para https://github.com/Nomade-PJ/paulocell-10...${NC}"
git remote set-url origin https://github.com/Nomade-PJ/paulocell-10 || git remote add origin https://github.com/Nomade-PJ/paulocell-10

# Enviar para o GitHub
echo -e "${YELLOW}Enviando alterações para o GitHub...${NC}"
git push origin master

# Verificar se o push foi bem-sucedido
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Alterações enviadas com sucesso para o GitHub!${NC}"
    
    # Perguntar se deseja atualizar o servidor
    echo -e "${YELLOW}Deseja atualizar o servidor na Hostinger? (s/n)${NC}"
    read update_server
    
    if [ "$update_server" = "s" ] || [ "$update_server" = "S" ]; then
        # Solicitar informações de conexão SSH
        echo -e "${YELLOW}Digite o nome de usuário do servidor:${NC}"
        read username
        
        echo -e "${YELLOW}Digite o endereço IP do servidor:${NC}"
        read server_ip
        
        # Conectar ao servidor e atualizar o código
        echo -e "${YELLOW}Conectando ao servidor e atualizando o código...${NC}"
        ssh $username@$server_ip << 'EOF'
            cd /var/www/paulocell
            echo "Atualizando o código do repositório..."
            git pull
            
            # Reiniciar a aplicação
            echo "Reiniciando a aplicação..."
            pm2 restart paulocell
            
            echo "Atualização concluída com sucesso!"
EOF
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Servidor atualizado com sucesso!${NC}"
        else
            echo -e "${YELLOW}Ocorreu um erro ao atualizar o servidor. Verifique a conexão SSH e tente novamente.${NC}"
        fi
    else
        echo -e "${YELLOW}Atualização do servidor cancelada.${NC}"
    fi
else
    echo -e "${YELLOW}Ocorreu um erro ao enviar as alterações para o GitHub. Verifique o erro acima e tente novamente.${NC}"
fi