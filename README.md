# Paulo Cell - Sistema de Gestão para Assistência Técnica

Sistema completo de gerenciamento para assistência técnica de celulares e dispositivos móveis. Desenvolvido para operação totalmente online, com sincronização em tempo real entre todos os dispositivos.

## Atualização Importante: Migração para Supabase

O sistema está passando por uma migração do MongoDB para o Supabase, uma plataforma backend-as-a-service baseada em PostgreSQL. Essa migração traz várias melhorias:

- **Autenticação Robusta**: Sistema de autenticação integrado com suporte a vários provedores (email/senha, Google)
- **Comunicação em Tempo Real Aprimorada**: Baseada no Supabase Realtime, mais estável e escalável
- **Armazenamento de Arquivos**: Sistema integrado para upload e gerenciamento de arquivos
- **Segurança Aprimorada**: Políticas de segurança em nível de banco de dados (Row Level Security)
- **Melhor Escalabilidade**: Baseado em PostgreSQL, oferecendo melhor desempenho para grandes volumes de dados

### Status da Migração

- [x] Configuração inicial do Supabase
- [x] Esquema de banco de dados
- [x] Serviços de autenticação
- [x] Serviços de banco de dados
- [x] Serviços de comunicação em tempo real
- [x] Serviço de armazenamento de arquivos
- [ ] Migração de dados legados (MongoDB → Supabase)
- [ ] Teste completo de integração
- [ ] Implantação em produção

Para ativar o Supabase, defina `USE_SUPABASE=true` no arquivo `.env.production`.

## Arquitetura

Este sistema utiliza:

- Frontend: React.js com TypeScript
- Backend: Node.js com Express
- Banco de Dados: 
  - (Legado) MongoDB
  - (Novo) PostgreSQL via Supabase
- Comunicação em Tempo Real: 
  - (Legado) WebSockets via Socket.io
  - (Novo) Supabase Realtime

## Características Principais

- **Operação 100% Online**: Sistema projetado para funcionar exclusivamente online, com sincronização em tempo real.
- **Persistência no Servidor**: Todos os dados são armazenados no banco de dados, sem dependências de armazenamento local.
- **Sincronização em Tempo Real**: Atualizações instantâneas em todos os dispositivos conectados.
- **Tratamento Robusto de Desconexões**: O sistema detecta automaticamente problemas de conexão e implementa estratégias de reconexão.
- **Validação de Tokens**: Middleware de autenticação para validar tokens em todas as requisições API.
- **Armazenamento de Arquivos**: Sistema integrado para gerenciamento de arquivos com suporte a imagens e documentos.

## Implementações de Segurança e Estabilidade

### Middleware de Autenticação

Uma camada de middleware foi implementada no servidor para validar tokens JWT em todas as requisições API:

```javascript
// Exemplo de uso do middleware de autenticação
app.get('/api/data', validateToken, (req, res) => {
  // Lógica do endpoint...
});
```

### Reconexão Automática de WebSockets/Realtime

O serviço de tempo real foi aprimorado para detectar desconexões e implementar estratégias avançadas de reconexão:

- Detecção de eventos online/offline do navegador
- Backoff exponencial para tentativas de reconexão
- Reconexão automática quando a conexão de rede é restaurada

### Monitoramento de Status de Conexão

Componentes de interface foram adicionados para informar os usuários sobre o status da conexão:

- Indicador visual do estado da conexão
- Notificações quando a conexão é perdida ou restaurada
- Opções para tentar reconexão manual

### Tratamento de Erros Consistente

Um sistema global de tratamento de erros foi implementado:

- ErrorBoundary para capturar e tratar erros em componentes React
- Tratamento centralizado de erros de rede e API
- Notificações amigáveis aos usuários em caso de problemas

## Instruções de Implantação

### Configuração do Supabase

Consulte o documento [docs/supabase-setup.md](docs/supabase-setup.md) para instruções detalhadas sobre a configuração do Supabase.

### Preparação do Servidor

1. Configure o banco de dados (MongoDB ou Supabase)
2. Configure as variáveis de ambiente no arquivo `.env.production`

### Instalação do Servidor

```bash
# Clone o repositório
git clone https://github.com/usuario/paulocell.git
cd paulocell

# Instale as dependências
npm install

# Configure as variáveis de ambiente (importante)
cp .env.example .env.production
nano .env.production  # Configure conforme necessário

# Construa a aplicação
npm run build

# Inicie o servidor
node server.js
```

Para uma implantação em produção, recomenda-se o uso do PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar a aplicação com PM2
pm2 start server.js --name "paulocell"

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

### Migração de Dados (MongoDB para Supabase)

Para migrar dados do MongoDB para o Supabase:

```bash
# Configure as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.production
# Execute o script de migração
npm run migrate:to-supabase
```

Este script exportará os dados do MongoDB e os importará para o Supabase.

## Manutenção e Monitoramento

### Monitoramento de Conexão

O sistema inclui ferramentas internas para monitorar o status da conexão:

- Logs detalhados sobre tentativas de conexão
- Métricas de tempo de latência e disponibilidade
- Alertas para problemas de conexão persistentes

### Atualizações

Para atualizar o sistema:

```bash
# Pare o servidor (se não estiver usando PM2)
# Com PM2:
pm2 stop paulocell

# Puxe as atualizações
git pull

# Instale novas dependências (se houver)
npm install

# Reconstrua a aplicação
npm run build

# Reinicie o servidor
pm2 restart paulocell
```

## Considerações Importantes sobre a Operação Online

Como o sistema agora opera 100% online, é importante observar:

1. **Conexão Ativa Necessária**: Este sistema requer conexão com internet para funcionar corretamente.

2. **Tratamento de Intermitência**: Em caso de breves interrupções na conexão, o sistema tenta reconectar automaticamente.

3. **Validação Contínua de Tokens**: Os tokens de autenticação são validados a cada requisição para garantir segurança.

4. **Notificações ao Usuário**: Os usuários são notificados sobre o status da conexão em tempo real.

## Suporte e Contribuições

Para reportar bugs ou solicitar recursos:
- Abra uma issue no sistema de issues do repositório
- Entre em contato com a equipe de desenvolvimento

## Visão Geral

O PauloCell é um sistema completo para gerenciamento de assistência técnica, permitindo o controle de clientes, dispositivos, serviços, estoque e emissão de documentos.

### Recursos Principais

- Cadastro e gestão de clientes
- Cadastro e histórico de dispositivos
- Gerenciamento de ordens de serviço
- Controle de estoque
- Emissão de documentos e relatórios
- Dashboard com estatísticas e indicadores

## Tecnologias

- **Frontend**: React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Banco de dados**: 
  - MongoDB (legado)
  - PostgreSQL via Supabase (novo)
- **Autenticação**: Supabase Auth
- **Tempo Real**: Supabase Realtime
- **Armazenamento**: Supabase Storage

## Estrutura do Projeto

```
├── api/                  # API e endpoints
├── dist/                 # Arquivos compilados para produção
├── docs/                 # Documentação
│   ├── supabase-schema.sql # Esquema SQL do Supabase
│   ├── supabase-setup.md  # Guia de configuração do Supabase
├── models/               # Modelos de dados
├── public/               # Arquivos estáticos
├── scripts/              # Scripts utilitários
│   ├── migrate-to-supabase.js  # Script de migração MongoDB → Supabase
├── src/                  # Código fonte React
│   ├── components/       # Componentes React
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários e funções
│   │   ├── supabase.js   # Cliente Supabase
│   ├── services/         # Serviços
│   │   ├── authService.js # Serviço de autenticação Supabase
│   │   ├── databaseService.js # Serviço de banco de dados Supabase
│   │   ├── realtimeSupabaseService.js # Serviço Realtime Supabase
│   │   ├── storageService.js # Serviço de armazenamento Supabase
├── server.js             # Servidor Express
├── .env.production       # Variáveis de ambiente para produção
```

## Instalação e Execução

### Requisitos

- Node.js 16.x ou superior
- MongoDB (legado) ou Supabase (recomendado)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Nomade-PJ/paulocell-10.git
cd paulocell-10
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.production
```
Edite o arquivo `.env.production` com suas configurações.

### Execução

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm run start:prod
```

## Autenticação

O sistema utiliza o Supabase Auth para autenticação, com suporte a:
- Login por email/senha
- Login social (Google)
- Gerenciamento de sessões
- Recuperação de senha

## Licença

Este projeto é propriedade de Paulo Cell. Uso restrito e autorizado.

## Contato

Para questões técnicas ou suporte, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido por [Nomade-PJ](https://github.com/Nomade-PJ) 