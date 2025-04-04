# Paulo Cell - Sistema de Gestão para Loja de Celulares

Sistema completo para gerenciamento de lojas de celulares, com suporte a serviços, inventário, clientes e mais.

## 📋 Funcionalidades

- Cadastro e gerenciamento de clientes
- Gestão de serviços e ordens de serviço
- Controle de inventário
- Autenticação e perfis de usuário
- Sincronização em tempo real com Supabase
- Suporte para upload e gerenciamento de arquivos

## 🚀 Tecnologias

- Node.js e Express
- MongoDB (legado) e PostgreSQL via Supabase
- Socket.io para comunicação em tempo real
- JWT para autenticação
- Multer para upload de arquivos

## 🔄 Supabase

Este projeto está em processo de migração do MongoDB para o Supabase. O código suporta ambos os backends, controlados pela flag `USE_SUPABASE` no arquivo `.env.production`.

### Migração para Supabase

Para migrar seu sistema do MongoDB para o Supabase, siga o checklist em `docs/SUPABASE-CHECKLIST.md` e as instruções detalhadas em `docs/supabase-setup.md`.

## 🛠️ Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/paulocell.git
   cd paulocell
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o ambiente:
   ```bash
   cp .env.example .env.production
   # Edite o arquivo .env.production com suas credenciais
   ```

4. Para instalar e configurar o Supabase:
   ```bash
   npm run setup:supabase
   ```

5. Para verificar a configuração do Supabase:
   ```bash
   npm run check:supabase
   ```

## 🚀 Implantação

### Implantação Local

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Iniciar em modo de produção
npm run start:prod

# Testar com Supabase ativado
./test-supabase.sh
```

### Implantação na VPS

Para implantar na VPS, use o script `deploy.sh`:

```bash
# Na VPS, após clonar o repositório:
chmod +x deploy.sh
./deploy.sh
```

Para mais detalhes, consulte o arquivo `vps-deploy.sh` com instruções passo a passo.

## 🧪 Migração de Dados

Para migrar dados do MongoDB para o Supabase:

```bash
npm run migrate:to-supabase
```

## 🧹 Limpeza de Arquivos

Após a migração completa e testes bem-sucedidos, você pode remover os arquivos legados:

### No Linux/Mac:
```bash
npm run cleanup:legacy
# ou
./clean-temp.sh
```

### No Windows:
```powershell
# PowerShell
./remove-mongodb-files.ps1
# ou CMD
clean-temp.bat
```

Estes scripts:
- Fazem backup dos arquivos antes de removê-los
- Removem arquivos relacionados ao MongoDB
- Limpam arquivos temporários e de cache
- Oferecem opção de commit e push automáticos

## 📝 Licença

Este projeto é propriedade de Paulo Cell e não pode ser utilizado, distribuído ou modificado sem autorização expressa.

## 🤝 Suporte

Para suporte, entre em contato com a equipe de desenvolvimento. 