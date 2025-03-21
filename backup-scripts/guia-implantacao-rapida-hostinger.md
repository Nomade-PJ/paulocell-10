# Guia de Implantação Rápida do Paulo Cell na Hostinger

Este guia contém todos os passos necessários para implantar rapidamente o sistema Paulo Cell em um VPS da Hostinger.

## 1. Configuração Inicial do Servidor

```bash
# Atualizar o sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js (v18 ou superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar a instalação
node -v  # Deve mostrar v18.x.x ou superior
npm -v   # Deve mostrar v10.x.x ou superior

# Instalar o gerenciador de processos PM2
sudo npm install -g pm2

# Instalar o Nginx
sudo apt install -y nginx

# Instalar MySQL
sudo apt install -y mysql-server

# Configurar segurança do MySQL
sudo mysql_secure_installation
```

## 2. Configurar o MySQL

```bash
# Acessar o MySQL como root
sudo mysql

# Criar banco de dados e usuário (substitua 'senha_segura' por uma senha forte)
CREATE DATABASE paulocell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paulocell_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON paulocell.* TO 'paulocell_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Configurar o Nginx

```bash
# Criar arquivo de configuração do Nginx
sudo nano /etc/nginx/sites-available/paulocell
```

Adicione o seguinte conteúdo (substitua `seudominio.com.br` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/paulocell /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Configurar HTTPS com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

## 5. Clonar o Repositório do GitHub

```bash
# Instalar Git se ainda não estiver instalado
sudo apt install -y git

# Criar diretório para a aplicação
mkdir -p /var/www/paulocell
cd /var/www/paulocell

# Clonar o repositório diretamente do GitHub
git clone https://github.com/Nomade-PJ/paulocell-10.git .

# Verificar se o repositório foi clonado corretamente
ls -la

# Verificar a versão do repositório
git log -1 --pretty=format:"%h - %an, %ar : %s"
```

> **Nota**: O comando `git clone` baixa todo o código-fonte do projeto diretamente do GitHub para o servidor. O ponto (`.`) no final do comando indica que o conteúdo deve ser clonado para o diretório atual, sem criar uma pasta adicional.

## 6. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.production
nano .env.production
```

Edite o arquivo com as seguintes configurações:

```
# Configurações do Firebase (se estiver usando)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Configurações do servidor
NODE_ENV=production
PORT=3000

# Configurações do banco de dados
DB_HOST=localhost
DB_USER=paulocell_user
DB_PASSWORD=senha_segura
DB_NAME=paulocell

# URL base da API
VITE_API_URL=/api

# Outras configurações
VITE_APP_URL=https://seudominio.com.br
```

## 7. Importar o Esquema do Banco de Dados

```bash
# Criar diretório sql se não existir
mkdir -p sql

# Importar o esquema do banco de dados
mysql -u paulocell_user -p paulocell < sql/schema.sql
```

## 8. Instalar Dependências e Construir o Projeto

```bash
npm install
npm run build
```

## 9. Iniciar o Servidor com PM2

```bash
pm2 start server.js --name paulocell
pm2 save
pm2 startup
```

## 10. Verificar a Aplicação

Acesse seu domínio no navegador para verificar se tudo está funcionando corretamente:

```
https://seudominio.com.br
```

## Comandos Úteis para Manutenção

### Reiniciar o Servidor

```bash
pm2 restart paulocell
```

### Visualizar Logs

```bash
pm2 logs paulocell
```

### Monitorar o Servidor

```bash
pm2 monit
```

### Atualizar o Código

```bash
cd /var/www/paulocell
git pull
npm install
npm run build
pm2 restart paulocell
```

### Verificar Status do Nginx

```bash
sudo systemctl status nginx
```

### Verificar Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```