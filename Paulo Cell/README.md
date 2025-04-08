# Paulo Cell - Sistema de Gerenciamento para Assistência Técnica

Sistema completo para gerenciamento de assistência técnica de celulares e dispositivos eletrônicos, desenvolvido com React 18.3, Vite 5.4 e TailwindCSS 3.4.

## 📋 Sobre o Projeto

O Paulo Cell é um sistema de gerenciamento para lojas de assistência técnica de celulares e dispositivos eletrônicos. O sistema permite o cadastro e controle de clientes, dispositivos, serviços e estoque, com uma interface moderna e intuitiva.

## 🆕 Atualização Importante: Migração para MySQL

O sistema foi atualizado para utilizar MySQL como banco de dados principal, trazendo:

- **Persistência real de dados** - Dados armazenados de forma permanente no servidor
- **Suporte a múltiplos usuários** - Acesso simultâneo por múltiplos dispositivos
- **Melhor desempenho** - Manipulação eficiente de grandes volumes de dados
- **Funcionamento offline/online** - Sincronização automática quando a conexão é restabelecida
- **Backup facilitado** - Proteção contra perda de dados

### 📱 Componentes Migrados para MySQL:

- ✅ **Clientes** - Gerenciamento completo de clientes
- ✅ **Dispositivos** - Registro e controle de dispositivos
- ✅ **Serviços** - Gestão de serviços e ordens de serviço
- ✅ **Inventário** - Controle de estoque e peças
- ✅ **Configurações** - Preferências do sistema

### 🔄 Como usar o novo sistema:

1. **Configuração do banco de dados:**
   - Verifique se o MySQL está instalado e configurado
   - Use o script `setup-database.sql` para criar o banco de dados
   - Configure as credenciais no arquivo `.env.production`

2. **Inicialização:**
   - Execute `node server.js` para iniciar o servidor
   - Acesse `http://localhost:3000` para usar o sistema

3. **Modo offline:**
   - O sistema continua funcionando mesmo sem conexão
   - Os dados são sincronizados automaticamente quando a conexão é restabelecida
   - Um indicador na interface mostra o estado atual da conexão

### 🚀 Funcionalidades

- **Gestão de Clientes**
  - Cadastro de clientes com informações de contato
  - Visualização de histórico de serviços por cliente
  - Pesquisa e filtragem de clientes

- **Controle de Dispositivos**
  - Cadastro detalhado de dispositivos (marca, modelo, IMEI, etc.)
  - Registro de senhas e padrões de acesso (com visualização gráfica)
  - Associação com proprietários (opcional)

- **Gerenciamento de Serviços**
  - Cadastro de serviços com descrição detalhada
  - Controle de status (em espera, em andamento, concluído, entregue)
  - Cálculo automático de valores (peças + mão de obra)
  - Seleção de peças do estoque
  - Cadastro de novos itens de estoque diretamente da tela de serviço
  - Definição de prioridade e garantia
  - Seleção de cliente e dispositivo opcional

- **Controle de Estoque**
  - Cadastro de peças e acessórios
  - Controle de quantidade em estoque
  - Alertas de estoque baixo
  - Geração automática de SKU

- **Dashboard**
  - Visualização rápida de serviços em andamento
  - Indicadores de desempenho

## 🚢 Implantação na Vercel

Para facilitar a implantação, criamos um guia detalhado e ferramentas automatizadas.

### Arquitetura da Implantação

O sistema utiliza uma arquitetura dividida:
- **Frontend**: Hospedado na Vercel (interface React)
- **Backend**: Hospedado em serviço com suporte a MySQL (Railway, Render ou similar)

### Procedimento de Implantação

1. Execute o script de implantação:
   ```
   scripts/deploy-to-vercel.bat
   ```

2. Configure o backend conforme instruções no arquivo [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md)

Para instruções detalhadas, consulte o arquivo [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md).

## 🌳 Estrutura do Projeto

```
paulo-cell/
├── public/               # Arquivos públicos
├── src/                  # Código fonte
│   ├── components/       # Componentes reutilizáveis
│   │   ├── layout/       # Componentes de layout (MainLayout)
│   │   └── ui/           # Componentes de UI (buttons, cards, etc.)
│   ├── lib/              # Utilitários e funções
│   │   └── supabase.ts   # Cliente e funções do Supabase
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks personalizados
│   └── pages/            # Páginas principais da aplicação
│       ├── Dashboard.tsx # Página inicial/dashboard
│       ├── NewCustomer.tsx  # Cadastro de cliente
│       ├── EditCustomer.tsx # Edição de cliente
│       ├── CustomerDetail.tsx # Detalhes do cliente
│       ├── Customers.tsx  # Lista de clientes
│       ├── NewDevice.tsx  # Cadastro de dispositivo
│       ├── EditDevice.tsx # Edição de dispositivo
│       ├── DeviceDetail.tsx # Detalhes do dispositivo
│       ├── Devices.tsx    # Lista de dispositivos
│       ├── NewService.tsx # Cadastro de serviço
│       ├── EditService.tsx # Edição de serviço
│       ├── ServiceDetail.tsx # Detalhes do serviço
│       ├── Services.tsx   # Lista de serviços
│       └── Inventory.tsx  # Gestão de estoque
├── server/              # Servidor Node.js/Express
├── sql/                 # Esquemas SQL e scripts de migração
│   └── supabase-schema.sql  # Esquema para o Supabase
├── supabase/            # Configuração do Supabase (criada pelo CLI)
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔧 Requisitos e Instalação

### Pré-requisitos

- Node.js (versão 18.x ou superior recomendada)
- npm (v10+) ou yarn
- MySQL (para ambiente de produção)
- Docker (para rodar o Supabase localmente)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Nomade-PJ/paulocell-10.git
   cd paulocell-10
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure o ambiente:
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:5173
   ```

### Execução Rápida (Windows)

Para iniciar o projeto rapidamente no Windows, você pode usar um dos arquivos batch incluídos no projeto:

1. `iniciar-servidor.bat` - Inicia o servidor com MySQL
2. `iniciar-supabase.bat` - Inicia o Supabase localmente e roda a aplicação

## 💾 Armazenamento de Dados

O sistema oferece múltiplas opções de armazenamento:

- **MySQL**: Banco de dados relacional tradicional
- **Supabase (PostgreSQL)**: Banco de dados PostgreSQL gerenciado pelo Supabase
- **Fallback localStorage**: Armazenamento local para uso offline

### Supabase

O sistema agora suporta Supabase como backend, oferecendo:

- Banco de dados PostgreSQL
- Autenticação e autorização
- API automática
- Armazenamento de arquivos
- Funcionalidades em tempo real

Para configurar o Supabase, consulte o arquivo [CONFIGURACAO-SUPABASE.md](./CONFIGURACAO-SUPABASE.md).

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela, desde celulares até desktops.

## 🛠️ Tecnologias Utilizadas

- **React 18.3** - Biblioteca JavaScript para construção de interfaces
- **Vite 5.4** - Ferramenta de build otimizada para desenvolvimento
- **TailwindCSS 3.4** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI baseados em Radix UI
- **Lucide Icons** - Conjunto de ícones
- **React Router 6.26** - Roteamento
- **UUID 11.1** - Geração de IDs únicos
- **Framer Motion 12.4** - Animações
- **Sonner 1.5** - Notificações toast
- **Node.js/Express** - Servidor backend
- **MySQL** - Banco de dados relacional
- **Supabase** - Plataforma de desenvolvimento com PostgreSQL

## 📦 Versão e Build

Para criar uma versão de produção do aplicativo:

```bash
npm run build
# ou
yarn build
```

Os arquivos de build serão gerados na pasta `dist`, prontos para implantação.

## 🔄 Migração do localStorage para MySQL

O sistema agora suporta banco de dados MySQL, oferecendo várias vantagens:

1. **Persistência de dados:** Os dados são armazenados no servidor
2. **Acesso multi-dispositivo:** Disponível em qualquer dispositivo
3. **Segurança:** Backups automáticos e proteção contra perda de dados
4. **Escalabilidade:** Suporte a maior volume de dados

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

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido por [Nomade-PJ](https://github.com/Nomade-PJ)
