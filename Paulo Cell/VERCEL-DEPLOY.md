# Guia de Implantação do Sistema Paulo Cell na Vercel

Este documento contém instruções para implantar corretamente o sistema Paulo Cell na Vercel, garantindo a persistência dos dados e o funcionamento adequado do sistema.

## Arquitetura de Implantação

Como a Vercel não suporta nativamente bancos de dados MySQL ou servidores de longa duração (como nosso `server.js`), precisamos adotar uma arquitetura dividida:

1. **Frontend (Vercel)**: O código React será implantado na Vercel
2. **Backend (Outro serviço)**: A API Node.js/Express e o banco de dados MySQL serão hospedados em outro serviço

## Passo 1: Preparar o Backend

### Opções de hospedagem para o backend:

- **Railway**: Plataforma fácil de usar que suporta MySQL e Node.js
- **Render**: Bom para hospedar aplicações Node.js e bancos de dados
- **DigitalOcean**: Opção mais robusta com mais controle

### Configuração do Backend:

1. Escolha um provedor de hospedagem (recomendamos Railway ou Render)
2. Configure o banco de dados MySQL:
   - Crie um novo banco de dados MySQL
   - Anote as credenciais (host, usuário, senha, nome do banco)

3. Implante a API Node.js:
   - Carregue apenas os arquivos necessários para o servidor:
     - `server.js`
     - `server/` (pasta)
     - `sql/` (pasta)
     - `package.json`
     - `.env.production` (renomeie para `.env`)

4. Configure as variáveis de ambiente no serviço de hospedagem:
   ```
   DB_HOST=seu-host-mysql
   DB_USER=seu-usuario-mysql
   DB_PASSWORD=sua-senha-mysql
   DB_NAME=paulocell
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=sua-chave-secreta
   ```

5. Configure o CORS para permitir requisições da Vercel:
   - Edite o arquivo `server.js` para adicionar os domínios permitidos:
   ```javascript
   app.use(cors({
     origin: ['https://seu-app-na-vercel.vercel.app'],
     credentials: true
   }));
   ```

6. Inicie o servidor e anote a URL do backend (ex: `https://paulocell-api.railway.app`)

## Passo 2: Implantar o Frontend na Vercel

1. Crie uma conta na Vercel (https://vercel.com)

2. Prepare o código para implantação:
   - Edite o arquivo `src/lib/api-service.ts` para usar a URL do backend:
   ```typescript
   // URL base da API - agora usando variável de ambiente
   const API_URL = import.meta.env.VITE_API_URL || '/api';
   ```

3. Adicione um arquivo `vercel.json` na raiz do projeto:
   ```json
   {
     "rewrites": [{ "source": "/api/(.*)", "destination": "https://seu-backend-api.exemplo.com/api/$1" }]
   }
   ```

4. Crie um novo projeto na Vercel:
   - Use a opção de importar um repositório Git ou faça upload do projeto
   - Configure as variáveis de ambiente:
   ```
   VITE_API_URL=https://seu-backend-api.exemplo.com/api
   ```

5. Implante o projeto e aguarde a conclusão

## Passo 3: Teste e Verificação

Após a implantação, acesse o sistema na URL fornecida pela Vercel e realize os seguintes testes:

1. Faça login no sistema
2. Crie um novo cliente
3. Verifique se o cliente foi salvo no banco de dados
   - Acesse o sistema de outro navegador ou dispositivo
   - Verifique se o cliente aparece na lista

## Solução de Problemas

Se encontrar problemas durante a implantação ou operação, verifique:

1. Conexão com o banco de dados
   - As credenciais estão corretas?
   - O banco de dados está acessível a partir do servidor backend?

2. CORS
   - O domínio da Vercel está configurado corretamente no CORS do backend?
   - O navegador mostra erros de CORS no console?

3. API
   - As requisições para o backend estão sendo feitas corretamente?
   - O arquivo `vercel.json` está configurado corretamente?

## Manutenção

Para atualizar o sistema após a implantação:

1. **Frontend**: Basta fazer push para o repositório conectado à Vercel ou fazer uma nova implantação
2. **Backend**: Atualize o código no provedor de hospedagem do backend

## Recursos Adicionais

- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Railway](https://docs.railway.app) (se estiver usando Railway)
- [Documentação do Render](https://render.com/docs) (se estiver usando Render)

---

Em caso de dúvidas ou problemas, entre em contato com o suporte técnico. 