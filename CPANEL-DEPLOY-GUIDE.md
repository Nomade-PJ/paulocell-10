# Guia de Deploy no cPanel para Paulo Cell

Este guia fornece instruções passo a passo para implantar a aplicação Paulo Cell no cPanel, incluindo a configuração do banco de dados MySQL e a resolução de problemas comuns.

## Pré-requisitos

- Acesso ao cPanel da sua hospedagem
- Node.js 22+ instalado no servidor (verificar com o suporte da hospedagem)
- Banco de dados MySQL criado no cPanel
- Um usuário MySQL com permissões para o banco de dados

## 1. Preparação Local do Projeto

Antes de fazer o upload para o cPanel, prepare seu projeto localmente:

```bash
# Construir a aplicação otimizada para produção
npm run build:cpanel

# Ou use este comando para construir e remover dependências de desenvolvimento
npm run deploy:prepare
```

Isso criará a pasta `dist` com a aplicação otimizada e removerá arquivos desnecessários.

## 2. Configuração do Banco de Dados no cPanel

1. Acesse o cPanel da sua hospedagem
2. Encontre a seção "Bancos de Dados" e clique em "MySQL® Databases"
3. Crie um novo banco de dados:
   - Digite um nome para o banco de dados (ex: `seu_usuario_cpanel_paulocell`)
   - Clique em "Criar Banco de Dados"
4. Crie um usuário para o banco de dados:
   - Digite um nome de usuário (ex: `seu_usuario_cpanel_user`)
   - Digite uma senha forte
   - Clique em "Criar Usuário"
5. Adicione o usuário ao banco de dados:
   - Selecione o banco de dados e o usuário recém-criados
   - Conceda "TODOS OS PRIVILÉGIOS"
   - Clique em "Adicionar"

Anote as informações do banco de dados:
- Nome do banco: `seu_usuario_cpanel_paulocell`
- Nome de usuário: `seu_usuario_cpanel_user`
- Senha: `sua_senha_segura`
- Servidor: `localhost` (geralmente)

## 3. Upload de Arquivos para o cPanel

### Método 1: Via Gerenciador de Arquivos

1. Acesse o cPanel e abra o "Gerenciador de Arquivos"
2. Navegue até a pasta `public_html` (ou a pasta onde deseja hospedar a aplicação)
3. Faça upload dos seguintes arquivos/pastas:
   - Pasta `dist` (conteúdo)
   - Arquivo `server.js`
   - Pasta `server`
   - Arquivo `package.json`
   - Arquivo `.cpanel.yml`
   - Arquivo `.env.production` (após editá-lo com suas credenciais)

### Método 2: Via Git (se disponível na sua hospedagem)

1. Configure o cPanel para usar seu repositório Git
2. Push para o repositório configurado
3. O arquivo `.cpanel.yml` controlará o deployment dos arquivos

## 4. Configuração do Ambiente

1. Edite o arquivo `.env.production` no servidor com suas credenciais:

```
# Variáveis de ambiente para produção
NODE_ENV=production

# Configurações para resolver problemas de memória WebAssembly no cPanel
NODE_OPTIONS="--max-old-space-size=2048 --no-wasm-code-gc"

# Porta do servidor (ajuste conforme necessário)
PORT=3000

# Segurança
SESSION_SECRET=substitua_por_uma_chave_aleatoria_segura

# Configurações de CORS (ajuste para seu domínio)
CORS_ORIGIN=https://seu-dominio.com.br

# Configurações de banco de dados para MySQL local no cPanel
DB_HOST=localhost
DB_USER=seu_usuario_cpanel_user
DB_PASSWORD=sua_senha_segura
DB_NAME=seu_usuario_cpanel_paulocell
DB_PORT=3306

# Habilita conexão segura para MySQL
DB_SSL=false

# URL base da API
SITE_API_URL=/api

# URL da aplicação
SITE_APP_URL=https://seu-dominio.com.br

# Chave JWT (para autenticação)
JWT_SECRET=substitua_por_uma_chave_aleatoria_segura
```

## 5. Instalação de Dependências e Inicialização do Banco de Dados

Via SSH (se disponível) ou terminal do cPanel:

```bash
# Instalar dependências de produção
npm install --production

# Inicializar o banco de dados
npm run db:init

# Opcionalmente, migrar dados existentes
npm run migrate
```

## 6. Configuração da Aplicação Node.js no cPanel

1. No cPanel, acesse "Setup Node.js App"
2. Clique em "Create Application"
3. Configure:
   - Node.js version: 22.x (ou a mais recente disponível)
   - Application mode: Production
   - Application root: /home/seu_usuario/public_html
   - Application URL: https://seu-dominio.com.br
   - Application startup file: server.js
4. Clique em "Create"

## 7. Inicialização e Monitoramento

1. Inicie a aplicação através do painel de controle Node.js no cPanel
2. Verifique os logs para detectar possíveis problemas
3. Acesse sua aplicação pelo navegador: https://seu-dominio.com.br

## Resolução de Problemas

### Erro de conexão com o banco de dados

Verifique se as credenciais em `.env.production` estão corretas e se o usuário tem permissões adequadas.

```bash
# No terminal SSH, teste a conexão com o MySQL:
mysql -u seu_usuario_cpanel_user -p seu_usuario_cpanel_paulocell
```

### Erro de memória do Node.js

Algumas hospedagens limitam a memória disponível. Ajuste as opções em `.env.production`:

```
NODE_OPTIONS="--max-old-space-size=1024 --no-wasm-code-gc"
```

### A aplicação não inicia

Verifique os logs no cPanel:

1. Acesse "Logs" no painel de controle do Node.js
2. Ou verifique o arquivo de log de erros no diretório de logs

### Problemas com CORS

Ajuste a configuração CORS em `.env.production` para corresponder ao seu domínio:

```
CORS_ORIGIN=https://seu-dominio.com.br
```

## Backup do Banco de Dados

Para fazer backup do banco de dados:

```bash
# Via SSH ou terminal do cPanel
npm run migrate:backup
```

Ou use o phpMyAdmin no cPanel para exportar o banco de dados.

## Atualizações e Manutenção

1. Faça as alterações necessárias no código
2. Execute localmente:
   ```bash
   npm run build:cpanel
   ```
3. Faça upload dos arquivos atualizados para o cPanel
4. Reinicie a aplicação no painel de controle do Node.js

---

Para suporte adicional, entre em contato com o desenvolvedor ou consulte a documentação da sua hospedagem cPanel. 