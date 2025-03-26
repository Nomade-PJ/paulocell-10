# Instruções para Deploy na Vercel

Este documento contém as instruções passo a passo para fazer o deploy deste projeto na Vercel.

## Preparação do Projeto

O projeto já foi preparado com os arquivos de configuração necessários:
- `vercel.json` - Configuração da Vercel
- `.vercelignore` - Arquivos a serem ignorados
- `.env.production` - Variáveis de ambiente (modelo)

## Passos para o Deploy

1. **Crie uma conta na Vercel**
   - Acesse [vercel.com](https://vercel.com) e crie uma conta ou faça login

2. **Instale a CLI da Vercel**
   ```bash
   npm install -g vercel
   ```

3. **Faça login na CLI**
   ```bash
   vercel login
   ```

4. **Faça o deploy inicial**
   ```bash
   vercel
   ```
   Siga as instruções no terminal:
   - Confirme o diretório do projeto
   - Confirme que é uma aplicação React/Vite
   - Aceite as configurações padrão sugeridas

5. **Configure as variáveis de ambiente**
   - Acesse o painel da Vercel em [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione seu projeto
   - Vá para "Settings" > "Environment Variables"
   - Adicione todas as variáveis do arquivo `.env.production` com valores reais:
     - `DATABASE_HOST`
     - `DATABASE_USERNAME`
     - `DATABASE_PASSWORD`
     - `DATABASE_NAME`
     - `DATABASE_SSL`
     - `SITE_APP_URL`
     - `JWT_SECRET` (gere uma chave forte e única)

6. **Faça o deploy de produção**
   ```bash
   vercel --prod
   ```

## Configuração do Banco de Dados

Para o banco de dados, recomendamos usar o PlanetScale, que é compatível com MySQL e otimizado para serverless:

1. Crie uma conta no [PlanetScale](https://planetscale.com)
2. Crie um novo banco de dados chamado `paulocell`
3. Obtenha as credenciais de conexão (host, usuário, senha)
4. Use as credenciais nas variáveis de ambiente da Vercel
5. Execute o arquivo `sql/schema.sql` no banco de dados para criar as tabelas

## Solução de Problemas

Se encontrar problemas durante o deploy:

1. Verifique os logs de build na interface da Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados está acessível a partir da Vercel
4. Para problemas com rotas ou redirecionamentos, verifique o arquivo `vercel.json` 