# Checklist de Migração para Supabase

Este documento contém um checklist para garantir que todas as etapas da migração para o Supabase sejam concluídas corretamente.

## 1. Instalação e Configuração

- [ ] Supabase instalado no servidor VPS
- [ ] Credenciais do Supabase disponíveis (URL, chaves API)
- [ ] Arquivo `.env.production` atualizado com as credenciais
- [ ] Script SQL executado para criar tabelas e configurações
- [ ] Buckets de armazenamento criados

## 2. Verificação de Funcionalidades

- [ ] Conexão com Supabase testada (`npm run check:supabase`)
- [ ] Autenticação funcionando
- [ ] Operações CRUD funcionando em todas as tabelas
- [ ] Armazenamento de arquivos funcionando
- [ ] Realtime (sincronização em tempo real) funcionando

## 3. Migração de Dados

- [ ] Dados exportados do MongoDB
- [ ] Migração executada para o Supabase (`npm run migrate:to-supabase`)
- [ ] Dados verificados após a migração
- [ ] Teste de consistência dos dados

## 4. Teste em Ambiente de Desenvolvimento

- [ ] Sistema testado localmente com Supabase ativado
- [ ] Todas as funcionalidades testadas
- [ ] Problemas identificados e corrigidos

## 5. Implantação em Produção

- [ ] Repositório atualizado no GitHub
- [ ] Servidor clonado e configurado na VPS
- [ ] Supabase configurado em produção
- [ ] Sistema implantado com script `deploy.sh`
- [ ] Flag `USE_SUPABASE` definida como `true` em produção

## 6. Pós-implantação

- [ ] Monitoramento configurado
- [ ] Backups automáticos configurados
- [ ] Sistema testado em produção
- [ ] Documentação atualizada

## Comandos Úteis

```bash
# Verificar configuração do Supabase
npm run check:supabase

# Configurar Supabase (buckets, etc)
npm run setup:supabase

# Migrar dados do MongoDB para o Supabase
npm run migrate:to-supabase

# Testar o sistema com Supabase ativado
./test-supabase.sh

# Implantar em produção
./deploy.sh
```

## Resolução de Problemas

### Problema de conexão

Se houver problemas de conexão com o Supabase:

1. Verifique as credenciais em `.env.production`
2. Verifique se o serviço Supabase está rodando no servidor
3. Verifique se as portas estão abertas no firewall

### Erro na migração de dados

Se houver problemas na migração de dados:

1. Verifique os logs de erro no terminal
2. Verifique se o MongoDB está acessível
3. Verifique se as tabelas do Supabase foram criadas corretamente

### Erro de permissão

Se houver erros de permissão (RLS):

1. Verifique se o script SQL foi executado completamente
2. Verifique se as políticas RLS estão configuradas corretamente
3. Teste com a chave de serviço para verificar se é um problema de permissão 