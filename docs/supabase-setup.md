# Configuração do Supabase para o PauloCell

Este documento descreve os passos necessários para configurar o Supabase para o projeto PauloCell.

## 1. Instalação do Supabase no Hostinger

O Supabase pode ser instalado diretamente pelo painel do Hostinger:

1. Acesse o painel de hospedagem da Hostinger
2. Vá para a seção "Auto Instalador" ou "Aplicativos"
3. Localize e selecione "Supabase" na lista de aplicativos
4. Siga as instruções do assistente de instalação
5. Anote as credenciais fornecidas (URL, chaves de API)

## 2. Configuração do Banco de Dados

Após a instalação, você precisará configurar o banco de dados:

1. Acesse o painel do Supabase
2. Vá para a seção "SQL Editor"
3. Cole e execute o script SQL do arquivo `docs/supabase-schema.sql` para criar as tabelas e configurações necessárias

## 3. Configuração da Autenticação

Configure os métodos de autenticação:

1. No painel do Supabase, vá para "Authentication" > "Settings"
2. Em "Email Auth", certifique-se de que está habilitado
3. Em "External OAuth Providers", configure o Google Auth:
   - Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
   - Configure as credenciais OAuth 2.0
   - Adicione URLs de redirecionamento: `https://seudominio.com/auth/callback`
   - Copie o Client ID e Client Secret para o Supabase

## 4. Configuração das Variáveis de Ambiente

Atualize o arquivo `.env.production` com as credenciais do Supabase:

```
# Credenciais do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Configurações do App
SITE_APP_URL=https://seudominio.com
PORT=3000
HOST=0.0.0.0
```

## 5. Configuração do Realtime

Para habilitar a funcionalidade de tempo real:

1. No painel do Supabase, vá para "Database" > "Replication"
2. Certifique-se de que "Realtime" está habilitado para as tabelas:
   - customers
   - services
   - service_items
   - inventory_items
   - user_data

## 6. Configuração de Storage (opcional)

Se seu aplicativo precisa armazenar arquivos:

1. No painel do Supabase, vá para "Storage"
2. Crie buckets para os diferentes tipos de arquivos:
   - `profile-images`: para imagens de perfil
   - `product-images`: para imagens de produtos
   - `documents`: para documentos gerais

## 7. Segurança

Configure políticas de segurança adicionais:

1. Revise as políticas RLS (Row Level Security) criadas pelo script SQL
2. Teste as permissões fazendo login com diferentes usuários
3. Configure limitações de taxa (rate limiting) no painel do Supabase

## 8. Migração de Dados

Para migrar dados do MongoDB para o Supabase:

1. Exporte seus dados do MongoDB em formato JSON
2. Use a ferramenta de importação do Supabase ou scripts personalizados para importar os dados
3. Verifique a integridade dos dados após a migração

## 9. Testes

Antes de colocar em produção:

1. Teste o login/cadastro de usuários
2. Teste as operações CRUD em todas as tabelas
3. Teste as funcionalidades de tempo real
4. Verifique se as regras de segurança estão funcionando corretamente

## 10. Monitoramento

Configure o monitoramento:

1. No painel do Supabase, vá para "Settings" > "API"
2. Monitore o uso da API e do banco de dados
3. Configure alertas para uso excessivo ou erros frequentes

## Problemas Comuns e Soluções

### CORS (Cross-Origin Resource Sharing)

Se enfrentar problemas de CORS:

1. Vá para "API Settings" no painel do Supabase
2. Adicione seus domínios na lista de origens permitidas

### Autenticação

Se os usuários tiverem problemas para fazer login:

1. Verifique as configurações de redirecionamento
2. Verifique se os provedores OAuth estão configurados corretamente
3. Teste com um usuário de teste simples (email/senha)

### Realtime

Se a sincronização em tempo real não estiver funcionando:

1. Verifique se o Realtime está habilitado para as tabelas
2. Confirme se as configurações do cliente estão corretas
3. Verifique os logs do console para erros de conexão WebSocket 