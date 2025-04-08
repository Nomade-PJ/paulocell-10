# Configuração do Banco de Dados Paulo Cell

Este documento contém as instruções para configurar corretamente o banco de dados do sistema Paulo Cell, garantindo que os dados cadastrados sejam persistidos de forma adequada.

## Problema Resolvido

O sistema estava armazenando dados apenas no `localStorage` do navegador, o que fazia com que os dados não fossem persistidos quando acessados de outros dispositivos ou navegadores. A solução implementada agora garante que:

1. Os dados são salvos no banco de dados MySQL
2. Em caso de falha de conexão, os dados são armazenados localmente
3. Quando a conexão é restabelecida, os dados são sincronizados automaticamente
4. Há uma indicação visual de status online/offline 
5. Botão de sincronização manual no Dashboard

## Configuração do Banco de Dados

### 1. Certifique-se de ter o MySQL instalado

Para o correto funcionamento do sistema, é necessário ter o MySQL instalado e configurado no servidor.

### 2. Configure as variáveis de ambiente

O arquivo `.env` deve conter as seguintes configurações:

```
# Configurações do banco de dados
DB_HOST=localhost (ou o endereço do seu servidor MySQL)
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=paulocell
```

### 3. Criação do banco de dados

Execute os seguintes comandos no MySQL para criar o banco de dados e o usuário:

```sql
CREATE DATABASE paulocell;
CREATE USER 'paulocell_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura';
GRANT ALL PRIVILEGES ON paulocell.* TO 'paulocell_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Inicialização do banco de dados

O sistema irá automaticamente criar as tabelas necessárias na primeira execução. As tabelas incluem:

- `customers` - Armazena os dados dos clientes
- `devices` - Armazena os dados dos dispositivos
- `services` - Armazena os dados dos serviços
- `users` - Armazena os dados dos usuários do sistema

## Execução do Projeto

### Desenvolvimento

1. Configure o arquivo `.env` com as informações do banco de dados
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`

### Produção

1. Configure o arquivo `.env.production` com as informações do banco de dados
2. Construa o projeto: `npm run build`
3. Execute o servidor: `npm start` ou `node server.js`

## Sincronização de Dados

### Sincronização Automática

O sistema tentará automaticamente sincronizar os dados com o banco de dados nos seguintes momentos:

1. Ao iniciar a aplicação
2. A cada 30 segundos
3. Quando a conexão com a internet for restabelecida após ficar offline

### Sincronização Manual

No Dashboard, há um botão "Sincronizar BD" que permite forçar a sincronização dos dados locais com o banco de dados.

## Solução de Problemas

Se os dados não estiverem sendo salvos no banco de dados, verifique:

1. As configurações do banco de dados no arquivo `.env`
2. Se o serviço MySQL está em execução
3. Se as permissões do usuário do banco estão corretas
4. Se não há erros no console do navegador ou no console do servidor

Para verificar o status da conexão, observe o indicador "Online/Offline" no Dashboard.

## Status de Sincronização

- **Online**: O sistema está conectado ao servidor e os dados são persistidos no banco de dados em tempo real.
- **Offline**: O sistema está operando offline. Os dados são armazenados localmente e serão sincronizados quando a conexão for restabelecida.

---

Em caso de dúvidas ou problemas, entre em contato com o suporte técnico. 