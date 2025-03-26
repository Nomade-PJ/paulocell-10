# Paulo Cell - Sistema de Gerenciamento

Sistema para gerenciamento de ordens de serviço, inventário e atendimentos da assistência técnica Paulo Cell.

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Deploy no Vercel](#deploy-no-vercel)
- [Opções de Banco de Dados](#opções-de-banco-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Troubleshooting](#troubleshooting)

## Visão Geral

O sistema Paulo Cell foi desenvolvido para gerenciar os serviços técnicos, controle de inventário e atendimentos ao cliente. A aplicação utiliza uma arquitetura moderna e escalável, baseada em React com TypeScript para o frontend e APIs serverless compatíveis com Vercel para o backend.

## Tecnologias

- **Frontend**:
  - React + TypeScript
  - Vite (build tool)
  - Tailwind CSS + Shadcn/UI
  - React Hook Form para formulários
  - React Router DOM para roteamento

- **Backend**:
  - APIs Serverless (Vercel Functions)
  - Sistema de autenticação por palavra-chave
  - JWT para gerenciamento de sessão

- **Banco de Dados** (opções):
  - PostgreSQL (via Prisma)
  - MongoDB (via Mongoose)
  - PostgreSQL direto (via pg)

## Estrutura do Projeto

```
Paulo Cell/
├── api/                    # APIs Serverless compatíveis com Vercel
│   ├── _lib/               # Bibliotecas compartilhadas
│   │   ├── auth.js         # Funções de autenticação
│   │   └── database.js     # Conexão com banco de dados
│   ├── auth/               # Endpoints de autenticação
│   │   └── keyword.js      # Login por palavra-chave
│   ├── dashboard/          # Endpoints do painel
│   │   └── stats.js        # Estatísticas
│   └── refresh-token.js    # Renovação de tokens
├── models/                 # Modelos de dados
│   └── mongoose.js         # Definições para MongoDB
├── prisma/                 # Configuração Prisma
│   └── schema.prisma       # Schema do banco de dados
├── public/                 # Arquivos estáticos
├── src/                    # Código fonte do frontend
│   ├── components/         # Componentes React
│   ├── lib/                # Utilitários frontend
│   ├── pages/              # Páginas da aplicação
│   └── App.tsx             # Componente raiz
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
├── server.js               # Servidor Express para desenvolvimento
├── vercel.json             # Configuração do Vercel
└── vite.config.ts          # Configuração do Vite
```

## Configuração do Ambiente

### Requisitos

- Node.js 18.0.0 ou superior
- NPM 8.0.0 ou superior
- Um banco de dados (PostgreSQL ou MongoDB)

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/paulo-cell.git
cd paulo-cell
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. Execute a aplicação em modo de desenvolvimento
```bash
npm run dev
```

## Deploy no Vercel

O projeto está configurado para ser facilmente implantado no Vercel.

### Passos para Deploy

1. Crie uma conta na Vercel (se ainda não tiver)
2. Instale a CLI do Vercel
```bash
npm install -g vercel
```

3. Faça login na sua conta Vercel
```bash
vercel login
```

4. Configure as variáveis de ambiente no Vercel
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# Adicione outras variáveis conforme necessário
```

5. Implante o projeto
```bash
vercel
```

Para production deploy:
```bash
vercel --prod
```

## Opções de Banco de Dados

O sistema suporta múltiplas opções de banco de dados, que podem ser configuradas através da variável de ambiente `DB_TYPE`.

### PostgreSQL com Prisma (recomendado)

1. Configure a variável `DATABASE_URL` no formato:
```
postgresql://usuario:senha@host:porta/banco?schema=public
```

2. Configure `DB_TYPE=prisma` nas variáveis de ambiente

3. Execute as migrações do Prisma:
```bash
npx prisma migrate deploy
```

### MongoDB com Mongoose

1. Configure a variável `MONGODB_URI` no formato:
```
mongodb+srv://usuario:senha@cluster.mongodb.net/paulocell
```

2. Configure `DB_TYPE=mongoose` nas variáveis de ambiente

### PostgreSQL Direto (sem ORM)

1. Configure a variável `DATABASE_URL` com a string de conexão PostgreSQL
2. Configure `DB_TYPE=pg` nas variáveis de ambiente

## Endpoints da API

### Autenticação

- `POST /api/auth/keyword` - Login usando palavra-chave
- `POST /api/refresh-token` - Renovar token JWT

### Dashboard

- `GET /api/dashboard/stats` - Obter estatísticas

## Autenticação

O sistema utiliza autenticação por palavra-chave e JWT.

1. O usuário fornece uma palavra-chave válida
2. O sistema valida a palavra-chave e retorna tokens JWT
3. O token JWT é usado para acessar recursos protegidos
4. O refresh token permite renovar o acesso sem precisar fornecer a palavra-chave novamente

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | String de conexão com PostgreSQL | - |
| `MONGODB_URI` | String de conexão com MongoDB | mongodb://localhost:27017/paulocell |
| `DB_TYPE` | Tipo de banco de dados (prisma, mongoose, pg) | prisma |
| `JWT_SECRET` | Segredo para assinar tokens JWT | - |
| `JWT_EXPIRES_IN` | Tempo de expiração do token JWT | 1h |
| `REFRESH_TOKEN_SECRET` | Segredo para assinar refresh tokens | - |
| `REFRESH_TOKEN_EXPIRES_IN` | Tempo de expiração do refresh token | 7d |
| `NODE_ENV` | Ambiente de execução | development |

## Scripts Disponíveis

- `npm run dev` - Executa o ambiente de desenvolvimento
- `npm run build` - Cria um build de produção
- `npm start` - Inicia o servidor em modo produção
- `npm run lint` - Executa a verificação de linting
- `npm run vercel-build` - Script de build para o Vercel
- `npm run vercel:check` - Verifica as variáveis de ambiente no Vercel
- `npm run db:init` - Inicializa o banco de dados com dados iniciais

## Troubleshooting

### Erros de conexão com banco de dados

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Confirme se o banco de dados está acessível a partir do ambiente de deploy
- Para o Vercel, pode ser necessário configurar IP allowlisting

### Problemas com serverless functions

- Funções serverless têm limite de execução (geralmente 10 segundos no Vercel)
- Considere otimizar consultas pesadas ao banco de dados
- Use o modo de desenvolvimento local para depurar problemas de função

## Novas Implementações de Segurança

O sistema foi atualizado com um novo sistema de autenticação seguro baseado em:

1. **JWT (JSON Web Tokens)**: Autenticação baseada em tokens para maior segurança
2. **Banco de dados SQLite**: Armazenamento local seguro para credenciais e tokens
3. **Palavras-chave com hash**: As credenciais são armazenadas com hash seguro usando bcrypt
4. **Tokens de renovação automática**: Sessões são renovadas automaticamente para melhor experiência do usuário
5. **Limpeza automática**: Job programado para remover tokens expirados e manter o banco limpo

## Instalação

### Requisitos

- Node.js (versão 22.0.0 ou superior)
- NPM (versão 10.0.0 ou superior)

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   cd Paulo\ Cell
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o ambiente:
   - Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base)
   - Para produção, configure também o arquivo `.env.production`

4. Inicialize o banco de dados:
   ```bash
   node server/init-db.js
   ```
   
   Este comando irá:
   - Criar as tabelas necessárias no banco de dados SQLite
   - Gerar palavras-chave padrão para acesso administrativo
   - Configurar os índices para otimização de consultas

5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura do Projeto

```
Paulo Cell/
├── dist/                 # Arquivos de build (gerados pelo Vite)
├── public/               # Arquivos estáticos
├── server/               # Código do servidor Express
│   ├── data/             # Banco de dados SQLite
│   ├── db/               # Módulos de banco de dados
│   ├── jobs/             # Jobs agendados
│   ├── middleware/       # Middlewares Express
│   └── routes/           # Rotas da API
├── src/                  # Código front-end React
│   ├── assets/           # Imagens e outros assets
│   ├── components/       # Componentes React
│   ├── contexts/         # Contextos React (incluindo AuthContext)
│   ├── lib/              # Utilitários e bibliotecas
│   └── pages/            # Páginas da aplicação
├── .env                  # Variáveis de ambiente para desenvolvimento
├── .env.production       # Variáveis de ambiente para produção
└── server.js             # Ponto de entrada do servidor Express
```

## Sistema de Autenticação

### Palavras-chave Padrão

O script de inicialização cria três usuários padrão com as seguintes palavras-chave:

1. **Paulo Cell Admin**
   - Palavra-chave: `paulocell@admin1`
   - Permissões: Administrador completo

2. **Milena Admin**
   - Palavra-chave: `milena@admin2`
   - Permissões: Administrador completo

3. **Nicolas Admin**
   - Palavra-chave: `nicolas@admin3`
   - Permissões: Administrador completo

### Fluxo de Autenticação

1. O usuário insere a palavra-chave na tela de login
2. O sistema verifica a palavra-chave comparando o hash no banco de dados
3. Se válida, são gerados tokens de acesso e atualização (refresh token)
4. Os tokens são armazenados no localStorage do navegador
5. O sistema renova automaticamente o token de acesso usando o refresh token quando necessário

### Segurança

- As palavras-chave nunca são armazenadas em texto puro, apenas os hashes
- Todos os tokens têm prazo de expiração
- Um job automatizado revoga tokens expirados e limpa registros antigos
- Todas as requisições à API são protegidas por middleware de autenticação
- Usuários podem fazer logout de todas as sessões simultaneamente

## Implantação em Produção

### Preparação

1. Crie um build de produção:
   ```bash
   npm run build
   ```

2. Verifique o arquivo `.env.production` com as configurações corretas:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=sua-chave-secreta-muito-segura
   JWT_EXPIRATION=8h
   JWT_REFRESH_EXPIRATION=7d
   ```

### Implantação no cPanel

1. Faça upload de todos os arquivos para o servidor
2. Instale as dependências:
   ```bash
   npm install --production
   ```

3. Inicialize o banco de dados:
   ```bash
   node server/init-db.js
   ```

4. Configure o Node.js no cPanel:
   - Aponte para o arquivo `server.js`
   - Defina o NODE_ENV como "production"
   - Configure o aplicativo para reiniciar automaticamente

5. Inicie o aplicativo no cPanel

## Solução de Problemas

### Erros Comuns

1. **Erro MIME Type**
   - Problema: O servidor responde com MIME Type incorreto para arquivos JavaScript
   - Solução: Verifique se os arquivos `.htaccess` foram enviados corretamente e se as configurações de MIME Type no servidor Express estão ativas

2. **Erro de Autenticação**
   - Problema: Falha ao fazer login mesmo com credenciais corretas
   - Solução: Verifique o console do navegador para detalhes do erro e logs do servidor

### Logs

- Os logs do servidor são exibidos no console do Node.js
- Em produção, consulte os logs de erro no cPanel para informações detalhadas

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto é propriedade de Paulo Cell e seu uso é restrito aos colaboradores autorizados.

---

Desenvolvido por [Nomade-PJ](https://github.com/Nomade-PJ)

## Implantação na Hostinger

Este guia fornece instruções para implantar o sistema Paulo Cell no Hostinger VPS.

### Pré-requisitos

1. Conta na Hostinger com plano VPS (recomendamos pelo menos KVM 2 com 2 vCPU e 8GB RAM)
2. Domínio configurado e apontando para o servidor
3. Acesso SSH ao servidor

### Passos para implantação

#### 1. Configurar o servidor

Acesse o servidor via SSH e instale as dependências:

```bash
# Atualizar o sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js (v18 ou superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar o gerenciador de processos PM2
sudo npm install -g pm2

# Instalar o Nginx
sudo apt install -y nginx
```

#### 2. Configurar o Nginx

Crie um arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/paulocell
```

Adicione a seguinte configuração (substitua `seudominio.com.br` pelo seu domínio):

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

#### 3. Configurar o HTTPS com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

#### 4. Fazer upload do código

Você pode usar Git ou transferir arquivos via FTP/SFTP. Exemplo com Git:

```bash
# No servidor
mkdir -p /var/www/paulocell
cd /var/www/paulocell

# Clone o repositório (se estiver usando Git)
git clone https://seu-repositorio.git .

# Ou faça upload via SFTP
```

#### 5. Configurar variáveis de ambiente

```bash
cd /var/www/paulocell
cp .env.example .env.production
nano .env.production  # Edite as variáveis conforme necessário
```

#### 6. Instalar dependências e construir o projeto

```bash
npm install
npm run build
```

#### 7. Iniciar o servidor com PM2

```bash
pm2 start server.js --name paulocell
pm2 save
pm2 startup
```

#### 8. Verificar a aplicação

Acesse seu domínio no navegador para verificar se tudo está funcionando corretamente.

### Manutenção

Para atualizar o sistema no futuro:

```bash
cd /var/www/paulocell
git pull  # Se estiver usando Git
npm install
npm run build
pm2 restart paulocell
```

Para monitorar o servidor:

```bash
pm2 logs paulocell
pm2 monit
```

### Solução de problemas

- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
- Verifique os logs do PM2: `pm2 logs paulocell`
- Verifique o status do Nginx: `sudo systemctl status nginx`

## Migração do localStorage para MySQL

O sistema foi atualizado para usar MySQL como banco de dados em vez do localStorage. Isso oferece várias vantagens:

1. **Persistência de dados:** Os dados são armazenados no servidor e não no navegador
2. **Acesso multi-dispositivo:** Seus dados estarão disponíveis em qualquer dispositivo
3. **Segurança:** Backups automáticos e proteção contra perda de dados
4. **Escalabilidade:** Suporte a maior volume de dados sem limitações de armazenamento local

### Processo de migração

Para migrar os dados do localStorage para o MySQL, siga estes passos:

1. **Exportar dados do localStorage:**

```bash
# No diretório do projeto
node scripts/export-localStorage.js
```

Este script interativo irá guiá-lo no processo de exportação dos dados. Você precisará:
- Abrir o aplicativo no navegador
- Acessar o console do navegador (F12 -> Console)
- Executar comandos para extrair os dados
- Colar os resultados no terminal quando solicitado

2. **Configurar o banco de dados:**

Crie o arquivo `.env.production` na raiz do projeto com as configurações do seu banco MySQL:

```
# Configurações do banco de dados
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=paulocell
```

3. **Executar a migração:**

```bash
# No diretório do projeto
node scripts/migrate.js
```

Este script irá:
- Inicializar o banco de dados com o esquema correto
- Importar os dados dos arquivos JSON para as tabelas MySQL

### Estrutura do banco de dados

O banco de dados inclui as seguintes tabelas:

- `customers`: Clientes e suas informações
- `devices`: Dispositivos registrados
- `services`: Serviços realizados
- `inventory`: Itens de inventário
- `documents`: Documentos e faturas
- `users`: Usuários do sistema
- `notification_settings`: Configurações de notificações
- `company_settings`: Configurações da empresa

### Utilizando o sistema com MySQL

Após a migração, o sistema funcionará da mesma forma que antes, mas os dados serão persistidos no banco de dados MySQL em vez do localStorage. Isso permitirá que você acesse os mesmos dados de diferentes computadores e dispositivos.
