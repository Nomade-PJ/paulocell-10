# Paulo Cell - Sistema de Gerenciamento para Assistência Técnica

<<<<<<< HEAD
Sistema completo para gerenciamento de assistência técnica de celulares e dispositivos eletrônicos, desenvolvido com React e TailwindCSS.
=======
Sistema completo para gerenciamento de assistência técnica de celulares e dispositivos eletrônicos, desenvolvido com React 18.3, Vite 5.4 e TailwindCSS 3.4.
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

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
<<<<<<< HEAD
  - Associação com proprietários
=======
  - Associação com proprietários (opcional)
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

- **Gerenciamento de Serviços**
  - Cadastro de serviços com descrição detalhada
  - Controle de status (em espera, em andamento, concluído, entregue)
  - Cálculo automático de valores (peças + mão de obra)
  - Seleção de peças do estoque
  - Cadastro de novos itens de estoque diretamente da tela de serviço
  - Definição de prioridade e garantia
<<<<<<< HEAD
=======
  - Seleção de cliente e dispositivo opcional
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

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
<<<<<<< HEAD
=======
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks personalizados
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
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

<<<<<<< HEAD
- Node.js (versão 16.x ou superior recomendada)
- npm (ou yarn)
=======
- Node.js (versão 18.x ou superior recomendada)
- npm (v10+) ou yarn
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Nomade-PJ/paulocell-10.git
<<<<<<< HEAD
   cd paulocell-10
=======
cd paulocell-10
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
   ```

2. Instale as dependências:
   ```bash
<<<<<<< HEAD
   npm install
=======
npm install
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
   # ou
   yarn install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
<<<<<<< HEAD
   npm run dev
=======
npm run dev
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
   # ou
   yarn dev
   ```

4. Acesse o aplicativo em seu navegador:
   ```
<<<<<<< HEAD
   http://localhost:3000
   ```

=======
   http://localhost:5173
   ```

### Execução Rápida (Windows)

Para iniciar o projeto rapidamente no Windows, você pode usar o arquivo `run-dev.bat` incluído no projeto:

1. Abra o Explorador de Arquivos e navegue até a pasta do projeto
2. Dê um duplo clique em `run-dev.bat`
3. O servidor de desenvolvimento será iniciado automaticamente

>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
## 💾 Armazenamento de Dados

O sistema utiliza o **localStorage** do navegador para armazenar os dados, permitindo a execução sem necessidade de um servidor de banco de dados. Todos os dados são salvos localmente no dispositivo do usuário.

<<<<<<< HEAD
=======
Os dados são organizados nas seguintes chaves:
- `pauloCell_customers` - Dados dos clientes
- `pauloCell_devices` - Dados dos dispositivos
- `pauloCell_services` - Dados dos serviços
- `pauloCell_inventory` - Dados do estoque

>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela, desde celulares até desktops.

## 🛠️ Tecnologias Utilizadas

<<<<<<< HEAD
- **React** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Ferramenta de build otimizada para desenvolvimento
- **TailwindCSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI baseados em Radix UI
- **Lucide Icons** - Conjunto de ícones
- **React Router** - Roteamento
- **UUID** - Geração de IDs únicos
- **Framer Motion** - Animações
- **Sonner** - Notificações toast
=======
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
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

<<<<<<< HEAD
Desenvolvido por [Nomade-PJ](https://github.com/Nomade-PJ) 
=======
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
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
