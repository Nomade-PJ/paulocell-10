# Guia Passo a Passo para Implementação do Paulo Cell na Hostinger

Este guia contém instruções detalhadas para colocar o sistema Paulo Cell 100% operacional em um servidor VPS da Hostinger.

## Fase 1: Configuração do Acesso SSH

### Passo 1: Gerar Chave SSH no seu Computador

1. Abra o PowerShell no Windows
2. Execute o comando:
   ```
   ssh-keygen -t ed25519 -C "seu_email@example.com"
   ```
3. Pressione Enter para salvar a chave no local padrão
4. Opcionalmente, defina uma senha para a chave

### Passo 2: Copiar a Chave SSH Pública

1. Execute o comando para copiar a chave para a área de transferência:
   ```
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | clip
   ```

### Passo 3: Adicionar a Chave no Painel da Hostinger

1. Acesse o painel de controle da Hostinger
2. Navegue até a seção de VPS
3. Selecione seu servidor VPS
4. Vá para "Configurações" > "Chaves SSH"
5. Clique em "Adicionar chave SSH"
6. Cole o conteúdo da sua chave pública
7. Dê um nome para sua chave
8. Clique em "Salvar"

### Passo 4: Conectar ao Servidor via SSH

1. Execute o comando:
   ```
   ssh username@server_ip
   ```
   Substitua `username` pelo seu nome de usuário e `server_ip` pelo IP do seu servidor

## Fase 2: Configuração do Servidor

### Passo 5: Atualizar o Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Passo 6: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar a instalação
node -v  # Deve mostrar v18.x.x ou superior
npm -v   # Deve mostrar v10.x.x ou superior
```

### Passo 7: Instalar PM2, Nginx e MySQL

```bash
# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar MySQL
sudo apt install -y mysql-server

# Configurar segurança do MySQL (siga as instruções na tela)
sudo mysql_secure_installation
```

## Fase 3: Configuração do Banco de Dados

### Passo 8: Criar Banco de Dados e Usuário

```bash
# Acessar o MySQL como root
sudo mysql

# Executar os comandos SQL (substitua 'senha_segura' por uma senha forte)
CREATE DATABASE paulocell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paulocell_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON paulocell.* TO 'paulocell_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Fase 4: Configuração do Nginx

### Passo 9: Criar Arquivo de Configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/paulocell
```

Adicione o seguinte conteúdo (substitua `seudominio.com.br` pelo seu domínio real):

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

### Passo 10: Ativar a Configuração do Nginx

```bash
sudo ln -s /etc/nginx/sites-available/paulocell /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Fase 5: Configuração HTTPS

### Passo 11: Instalar e Configurar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

Siga as instruções na tela para completar a configuração do certificado SSL.

## Fase 6: Implantação do Código

### Passo 12: Clonar o Repositório

```bash
# Instalar Git se necessário
sudo apt install -y git

# Criar diretório para a aplicação
mkdir -p /var/www/paulocell
cd /var/www/paulocell

# Clonar o repositório
git clone https://github.com/Nomade-PJ/paulocell-10.git .

# Verificar se o repositório foi clonado corretamente
ls -la
```

### Passo 13: Configurar Variáveis de Ambiente

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

### Passo 14: Importar o Esquema do Banco de Dados

```bash
# Importar o esquema do banco de dados
mysql -u paulocell_user -p paulocell < sql/schema.sql
```

### Passo 15: Instalar Dependências e Construir o Projeto

```bash
npm install
npm run build
```

### Passo 16: Iniciar o Servidor com PM2

```bash
pm2 start server.js --name paulocell
pm2 save
pm2 startup
```

## Fase 7: Verificação Final

### Passo 17: Verificar a Aplicação

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

## Solução de Problemas Comuns

### Problema de Permissão ao Clonar o Repositório

```bash
sudo chown -R $USER:$USER /var/www/paulocell
```

### Erro ao Iniciar o Servidor

```bash
pm2 logs paulocell
```

### Problemas com o Nginx

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Problemas com o Banco de Dados

```bash
mysql -u paulocell_user -p
SHOW DATABASES;
USE paulocell;
SHOW TABLES;
```

---

## Checklist de Implementação

- [ ] Geração e configuração da chave SSH
- [ ] Conexão SSH ao servidor
- [ ] Atualização do sistema
- [ ] Instalação do Node.js
- [ ] Instalação do PM2
- [ ] Instalação do Nginx
- [ ] Instalação do MySQL
- [ ] Configuração do banco de dados
- [ ] Configuração do Nginx
- [ ] Configuração do HTTPS
- [ ] Clonagem do repositório
- [ ] Configuração das variáveis de ambiente
- [ ] Importação do esquema do banco de dados
- [ ] Instalação das dependências
- [ ] Build do projeto
- [ ] Inicialização com PM2
- [ ] Verificação da aplicação no navegador