# Guia de Deploy na Vercel

Este documento contém instruções para adaptar e fazer deploy do projeto Paulo Cell na Vercel com persistência de dados.

## Pré-requisitos

- Uma conta na [Vercel](https://vercel.com)
- Node.js 18+ instalado
- Banco de dados MySQL externo (recomendamos [PlanetScale](https://planetscale.com) que é compatível com serverless)

## Configuração do Banco de Dados

1. Crie uma conta no PlanetScale (ou outro provedor MySQL serverless)
2. Crie um novo banco de dados chamado `paulocell`
3. Obtenha as credenciais de conexão (host, usuário, senha)
4. Execute o arquivo `sql/schema.sql` no banco de dados para criar as tabelas necessárias

## Preparação do Projeto

1. Instale a CLI da Vercel:
```bash
npm install -g vercel
```

2. Faça login na sua conta Vercel:
```bash
vercel login
```

3. Copie o arquivo `.env.example` para `.env.production`:
```bash
cp .env.example .env.production
```

4. Edite o arquivo `.env.production` com suas configurações:
```
DATABASE_HOST=seu-host-do-planetscale
DATABASE_USERNAME=seu-usuario
DATABASE_PASSWORD=sua-senha
DATABASE_NAME=paulocell
DATABASE_SSL=true
SITE_APP_URL=https://seu-dominio-da-vercel.vercel.app
```

## Deploy na Vercel

1. Execute o comando de inicialização do deploy:
```bash
vercel
```

2. Siga as instruções no terminal:
   - Confirme o diretório do projeto
   - Confirme que é uma aplicação React/Vite
   - Defina o comando de build como `npm run build`
   - Defina o diretório de saída como `dist`

3. Configure as variáveis de ambiente na interface da Vercel:
   - Vá para o seu projeto no dashboard da Vercel
   - Navegue até "Settings" > "Environment Variables"
   - Adicione todas as variáveis do seu arquivo `.env.production`

4. Faça um novo deploy com as variáveis atualizadas:
```bash
vercel --prod
```

## Verificação do Deploy

1. Acesse a URL fornecida pela Vercel
2. Verifique se a aplicação carrega corretamente
3. Teste a persistência de dados com IndexedDB:
   - Adicione alguns registros
   - Recarregue a página e verifique se os dados persistem
   - Teste em diferentes navegadores

## Solução de Problemas

Se encontrar problemas durante o deploy:

1. Verifique os logs de build na interface da Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados está acessível a partir da Vercel
4. Para problemas com rotas ou redirecionamentos, verifique o arquivo `vercel.json`

## Recursos Adicionais

- [Documentação da Vercel para Vite](https://vercel.com/docs/frameworks/vite)
- [Guia de variáveis de ambiente na Vercel](https://vercel.com/docs/projects/environment-variables)
- [Documentação do PlanetScale](https://planetscale.com/docs)
- [Documentação do IndexedDB](https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API) 