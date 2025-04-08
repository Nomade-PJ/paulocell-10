# Migração para MySQL - Paulo Cell

Este documento descreve a migração do sistema Paulo Cell para utilizar MySQL como banco de dados principal, removendo a dependência do localStorage.

## Visão Geral da Migração

A migração do sistema Paulo Cell para MySQL envolve:

1. Configuração do banco de dados MySQL
2. Criação de tabelas e estruturas de dados no banco
3. Modificação do frontend para utilizar APIs em vez de localStorage
4. Implementação de mecanismos de sincronização e persistência de dados

## Verificação da Migração

Para verificar se o sistema está funcionando corretamente com MySQL:

### Backend

1. **Verifique a conexão com o banco de dados**:
   - O servidor deve iniciar sem erros
   - Mensagens de log devem indicar "Conexão com o banco de dados estabelecida!"
   - Não deve haver mensagens de "Fallback para localStorage"

2. **Execute o script SQL de verificação**:
   ```bash
   mysql -u paulocell_user -p paulocell < verificar-mysql.sql
   ```
   Ou abra o cliente MySQL e execute os comandos em `verificar-mysql.sql`

3. **Verifique os logs do servidor**:
   - Ao criar, atualizar ou excluir registros, devem aparecer mensagens de log indicando a operação no banco de dados

### Frontend

1. **Crie um novo cliente**:
   - Preencha o formulário de novo cliente e salve
   - Verifique nos logs do servidor se o cliente foi criado no banco de dados
   - Execute o script SQL para confirmar que o registro foi adicionado à tabela `customers`

2. **Edite um cliente existente**:
   - Modifique dados de um cliente e salve
   - Verifique nos logs do servidor se o cliente foi atualizado
   - Execute o script SQL para confirmar que as alterações foram persistidas

3. **Exclua um cliente**:
   - Remova um cliente
   - Verifique nos logs do servidor se o cliente foi excluído
   - Execute o script SQL para confirmar que o registro foi removido da tabela

4. **Teste de reinicialização**:
   - Reinicie o servidor e o navegador
   - Os dados devem permanecer disponíveis, indicando que estão vindo do MySQL e não do localStorage

## Estrutura do Banco de Dados

O banco de dados `paulocell` possui as seguintes tabelas principais:

1. `users` - Usuários do sistema
2. `customers` - Clientes cadastrados
3. `devices` - Dispositivos registrados
4. `services` - Serviços prestados
5. `inventory` - Itens de estoque

## Troubleshooting

Se houver problemas com a migração:

1. **Verifique as configurações de conexão**:
   - Arquivo `.env.production` deve ter as configurações corretas de host, usuário, senha e banco de dados

2. **Verifique permissões do banco de dados**:
   - O usuário `paulocell_user` deve ter permissões adequadas para o banco `paulocell`

3. **Verifique os logs do servidor**:
   - Erros de conexão ou operações no banco de dados são registrados no console

4. **Verifique a API**:
   - Utilize ferramentas como Postman ou o navegador para testar endpoints da API diretamente
   - Endpoint `/api/health` deve retornar status 200 e indicar que o banco de dados está conectado

## Comandos Úteis

```bash
# Iniciar o servidor
node server.js

# Executar script SQL de verificação
mysql -u paulocell_user -p paulocell < verificar-mysql.sql

# Verificar clientes no banco
mysql -u paulocell_user -p paulocell < verificar-clientes.sql

# Reiniciar o servidor (Windows)
taskkill /f /im node.exe && node server.js
``` 