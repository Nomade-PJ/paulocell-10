# Lista de Arquivos para Limpeza após Migração para Supabase

Este documento lista os arquivos e pastas que podem ser excluídos com segurança após a migração completa para o Supabase.

**ATENÇÃO**: Só exclua estes arquivos depois de confirmar que o sistema está funcionando corretamente com o Supabase.

## APIs MongoDB específicas que podem ser excluídas

- `api/db-initialize.js` - Inicialização específica do MongoDB
- `api/debug-database.js` - Ferramentas de debug específicas do MongoDB

## Serviços legados substituídos pelo Supabase

- `src/services/realtimeService.js` - Substituído por `realtimeSupabaseService.js`
- `models/mongoose.js` - Modelos MongoDB não mais necessários
- `src/services/api.js` - Específico para comunicação com API local, substituído pela API do Supabase

## Arquivos de configuração MongoDB

Estes arquivos podem ser excluídos uma vez que a migração esteja completa:

- `mongo-setup.js` (se existir)
- `mongoDB.config.js` (se existir)

## Processo de limpeza

Antes de excluir qualquer arquivo:

1. Certifique-se de que a flag `USE_SUPABASE=true` está ativa em produção
2. Teste o sistema completamente para garantir que todas as funcionalidades estão operando com o Supabase
3. Faça backup dos arquivos que serão excluídos
4. Execute a migração de dados com `npm run migrate:to-supabase`
5. Verifique novamente se tudo está funcionando corretamente

## Comando para exclusão

Quando tiver certeza que o sistema está estável com o Supabase, execute:

```bash
# Remove arquivos específicos do MongoDB
rm api/db-initialize.js
rm api/debug-database.js
rm src/services/realtimeService.js
rm models/mongoose.js
rm src/services/api.js

# Faça um commit com as alterações
git add .
git commit -m "Limpeza após migração para Supabase"
git push origin main
``` 