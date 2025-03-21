# Guia de Configuração SSH e Implantação do Paulo Cell na Hostinger

Este guia contém os passos necessários para configurar o acesso SSH ao seu VPS da Hostinger e implantar o sistema Paulo Cell.

## 1. Gerar uma Chave SSH no seu Computador

Para acessar seu servidor VPS de forma segura, você precisa gerar um par de chaves SSH no seu computador local:

```bash
# Abra um terminal (PowerShell ou CMD no Windows) e execute o comando:
ssh-keygen -t ed25519 -C "carlos.j@ifma.acad.edu.br"
```

Substitua `seu_email@example.com` pelo seu endereço de e-mail real.

Quando solicitado, pressione "Enter" para aceitar o local padrão do arquivo (geralmente `C:\Users\Carlos Tutors\.ssh\id_ed25519`).

Opcionalmente, defina uma senha para maior segurança (recomendado) e confirme a senha.

## 2. Copiar a Chave SSH Pública

Agora você precisa copiar o conteúdo da sua chave pública:

```bash
# No Windows (PowerShell)
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | clip
```

Ou abra o arquivo `C:\Users\Carlos Tutors\.ssh\id_ed25519.pub` em um editor de texto e copie todo o conteúdo.

## 3. Adicionar a Chave SSH no Painel da Hostinger

1. Acesse o painel de controle da Hostinger
2. Navegue até a seção de VPS
3. Selecione seu servidor VPS
4. Vá para a aba "Configurações" > "Chaves SSH"
5. Clique em "Adicionar chave SSH"
6. Cole o conteúdo da sua chave pública no campo "Conteúdo da chave SSH"
7. Dê um nome para sua chave no campo "Nome"
8. Clique em "Salvar"

## 4. Conectar ao Servidor via SSH

Agora você pode se conectar ao seu servidor VPS usando SSH:

```bash
# Substitua username pelo seu nome de usuário e server_ip pelo IP do seu servidor
ssh username@server_ip
```

Se você definiu uma senha para sua chave SSH, será solicitado que a digite.

## 5. Implantar o Sistema Paulo Cell

Uma vez conectado ao servidor via SSH, siga os passos do guia de implantação rápida:

### 5.1. Configuração Inicial do Servidor

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

### 5.2. Configurar o MySQL

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

### 5.3. Configurar o Nginx

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

### 5.4. Configurar HTTPS com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### 5.5. Clonar o Repositório do GitHub

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
```

### 5.6. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.production
nano .env.production
```

Edite o arquivo com as configurações apropriadas para seu ambiente.

### 5.7. Importar o Esquema do Banco de Dados

```bash
# Importar o esquema do banco de dados
mysql -u paulocell_user -p paulocell < sql/schema.sql
```

### 5.8. Instalar Dependências e Construir o Projeto

```bash
npm install
npm run build
```

### 5.9. Iniciar o Servidor com PM2

```bash
pm2 start server.js --name paulocell
pm2 save
pm2 startup
```

### 5.10. Verificar a Aplicação

Acesse seu domínio no navegador para verificar se tudo está funcionando corretamente:

```
https://seudominio.com.br
```

## Solução de Problemas Comuns

### Problema de Permissão ao Clonar o Repositório

Se encontrar problemas de permissão ao clonar o repositório, verifique se você tem as permissões necessárias no diretório de destino:

```bash
sudo chown -R $USER:$USER /var/www/paulocell
```

### Erro ao Iniciar o Servidor

Se o servidor não iniciar corretamente, verifique os logs:

```bash
pm2 logs paulocell
```

### Problemas com o Nginx

Verifique a configuração do Nginx:

```bash
sudo nginx -t
```

E verifique os logs de erro:

```bash
sudo tail -f /var/log/nginx/error.log
```