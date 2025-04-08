# Configuração do Supabase para o Paulo Cell

Este documento contém as instruções para configurar o Supabase localmente, permitindo o desenvolvimento e teste da aplicação Paulo Cell com um banco de dados PostgreSQL gerenciado pelo Supabase.

## O que é o Supabase?

O Supabase é uma alternativa de código aberto ao Firebase, oferecendo:

- Banco de dados PostgreSQL
- Autenticação e autorização
- API RESTful automática
- Armazenamento de arquivos
- Funções em tempo real
- Interface de administração

## Pré-requisitos

Para utilizar o Supabase localmente, você precisará:

1. **Docker**: O Supabase é executado em contêineres Docker. [Instale o Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Node.js e NPM**: Para gerenciar dependências e executar scripts. [Instale o Node.js](https://nodejs.org/).
3. **Git**: Para clonar o repositório e gerenciar versões.

## Instalação do Supabase CLI

O Supabase CLI (Command Line Interface) é a ferramenta que usamos para gerenciar o Supabase localmente.

```bash
# Instalar via NPM
npm install -g supabase
```

Ou no Windows, execute o script `iniciar-supabase.bat` que fará a instalação automaticamente se necessário.

## Inicializando o Supabase

Para inicializar o Supabase pela primeira vez:

```bash
# Inicializar o Supabase na pasta do projeto
supabase init
```

Isso criará uma pasta `supabase` com os arquivos de configuração necessários.

## Executando o Supabase Localmente

Para iniciar o Supabase:

```bash
supabase start
```

Ou, no Windows, execute o script `iniciar-supabase.bat` que fará todo o processo automaticamente.

## Acessando o Supabase

Após iniciar o Supabase, você pode acessar:

- **Dashboard**: http://localhost:54323
- **API**: http://localhost:54321
- **Banco de dados**:
  - Host: localhost
  - Porta: 54322
  - Usuário: postgres
  - Senha: postgres
  - Banco: postgres

## Configuração do Projeto

O projeto já está configurado para utilizar o Supabase através dos seguintes arquivos:

1. `.env` - Contém as variáveis de ambiente para desenvolvimento
2. `src/lib/supabase.ts` - Cliente do Supabase para a aplicação
3. `sql/supabase-schema.sql` - Esquema do banco de dados

## Migrações de Banco de Dados

O arquivo `sql/supabase-schema.sql` contém todas as definições das tabelas e índices necessários. Ele será aplicado automaticamente ao iniciar o Supabase pela primeira vez.

Para aplicar manualmente:

```bash
supabase db reset
```

## Tabelas do Banco de Dados

O Supabase criará as seguintes tabelas:

1. `customers` - Clientes
2. `devices` - Dispositivos
3. `services` - Serviços
4. `technicians` - Técnicos
5. `users` - Usuários do sistema

## Utilizando o Supabase na Aplicação

Para utilizar o Supabase na aplicação, você pode importar o cliente Supabase e o serviço de funções auxiliares:

```typescript
import { supabase, supabaseService } from '@/lib/supabase';

// Exemplo de uso
const getCustomers = async () => {
  try {
    const customers = await supabaseService.getCustomers();
    // Fazer algo com os clientes...
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
  }
};
```

## Desenvolvimento com Supabase

O arquivo `src/lib/supabase.ts` contém todas as funções de serviço para interagir com o Supabase, incluindo:

- Gerenciamento de clientes
- Gerenciamento de dispositivos
- Gerenciamento de serviços

## Sincronização de Dados

A aplicação está configurada para sincronizar dados entre o armazenamento local e o Supabase, permitindo o funcionamento offline e sincronização quando a conexão for restabelecida.

## Solução de Problemas

Se encontrar problemas com o Supabase, tente:

1. **Reiniciar o Supabase**: `supabase stop` seguido de `supabase start`
2. **Reiniciar o Docker**: Reinicie o Docker Desktop
3. **Redefinir o banco de dados**: `supabase db reset`

## Próximos Passos

Após configurar o Supabase localmente, você pode:

1. Explorar o Dashboard do Supabase para visualizar os dados
2. Testar a aplicação localmente com o banco de dados Supabase
3. Implementar novas funcionalidades usando os recursos do Supabase

---

Em caso de dúvidas ou problemas, entre em contato com o suporte técnico. 