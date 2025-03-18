# Paulo Cell - Sistema de Gerenciamento para Assistência Técnica

Sistema completo para gerenciamento de assistência técnica de celulares e dispositivos eletrônicos, desenvolvido com React 18.3, Vite 5.4 e TailwindCSS 3.4.

## 📋 Sobre o Projeto

O Paulo Cell é um sistema de gerenciamento para lojas de assistência técnica de celulares e dispositivos eletrônicos. O sistema permite o cadastro e controle de clientes, dispositivos, serviços e estoque, com uma interface moderna e intuitiva.

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

## 🌳 Estrutura do Projeto

```
paulocell-10/
├── public/               # Arquivos públicos
├── src/                  # Código fonte
│   ├── components/       # Componentes reutilizáveis
│   │   ├── layout/       # Componentes de layout (MainLayout)
│   │   └── ui/           # Componentes de UI (buttons, cards, etc.)
│   ├── lib/              # Utilitários e funções
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
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔧 Requisitos e Instalação

### Pré-requisitos

- Node.js (versão 18.x ou superior recomendada)
- npm (v10+) ou yarn

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

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:5173
   ```

### Execução Rápida (Windows)

Para iniciar o projeto rapidamente no Windows, você pode usar o arquivo `run-dev.bat` incluído no projeto:

1. Abra o Explorador de Arquivos e navegue até a pasta do projeto
2. Dê um duplo clique em `run-dev.bat`
3. O servidor de desenvolvimento será iniciado automaticamente

## 💾 Armazenamento de Dados

O sistema utiliza o **localStorage** do navegador para armazenar os dados, permitindo a execução sem necessidade de um servidor de banco de dados. Todos os dados são salvos localmente no dispositivo do usuário.

Os dados são organizados nas seguintes chaves:
- `pauloCell_customers` - Dados dos clientes
- `pauloCell_devices` - Dados dos dispositivos
- `pauloCell_services` - Dados dos serviços
- `pauloCell_inventory` - Dados do estoque

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

## 📦 Versão e Build

Para criar uma versão de produção do aplicativo:

```bash
npm run build
# ou
yarn build
```

Os arquivos de build serão gerados na pasta `dist`, prontos para implantação em qualquer servidor web estático.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido por [Nomade-PJ](https://github.com/Nomade-PJ)
