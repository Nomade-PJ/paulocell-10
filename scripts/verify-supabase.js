/**
 * Script para verificar a conexão com o Supabase
 * 
 * Este script testa a conexão com o Supabase usando as credenciais
 * definidas em .env.production e verifica o acesso ao banco de dados.
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

// Verificar configurações
console.log('🔍 Verificando configurações do Supabase:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`USE_SUPABASE: ${process.env.USE_SUPABASE === 'true' ? '✅ Ativado' : '❌ Desativado'}`);

// Criar cliente do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verificar conexão
const verifyConnection = async () => {
  try {
    console.log('\n🔄 Testando conexão com o Supabase...');
    
    // Verificar health check
    const { data: healthCheck, error: healthCheckError } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    if (healthCheckError) {
      throw new Error(`Falha na verificação de saúde: ${healthCheckError.message}`);
    }
    
    console.log('✅ Conexão com banco de dados estabelecida!');
    console.log(`   Status: ${healthCheck[0]?.status || 'ok'}`);
    
    // Verificar auth
    console.log('\n🔄 Verificando serviço de autenticação...');
    const { data: authSettings, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw new Error(`Falha na verificação da autenticação: ${authError.message}`);
    }
    
    console.log('✅ Serviço de autenticação funcionando!');
    
    // Verificar storage
    console.log('\n🔄 Verificando serviço de armazenamento...');
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      throw new Error(`Falha na verificação do armazenamento: ${storageError.message}`);
    }
    
    console.log('✅ Serviço de armazenamento funcionando!');
    console.log(`   Buckets disponíveis: ${buckets.length ? buckets.map(b => b.name).join(', ') : 'Nenhum bucket encontrado'}`);
    
    // Verificar estrutura do banco de dados
    console.log('\n🔄 Verificando estrutura do banco de dados...');
    
    const tables = [
      'customers',
      'services',
      'service_items',
      'inventory_items',
      'user_data',
      'health_check'
    ];
    
    let missingTables = [];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && error.code === '42P01') {
          missingTables.push(tableName);
        } else {
          console.log(`   ✅ Tabela ${tableName} está configurada`);
        }
      } catch (err) {
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Algumas tabelas não foram encontradas: ${missingTables.join(', ')}`);
      console.log('   Execute o script SQL usando o editor SQL do Supabase para criar essas tabelas.');
    } else {
      console.log('\n✅ Todas as tabelas necessárias estão configuradas!');
    }
    
    console.log('\n✅ Verificação concluída! O Supabase está configurado corretamente.');
    return true;
  } catch (error) {
    console.error(`\n❌ Erro na verificação: ${error.message}`);
    console.log('\nVerifique as seguintes possíveis causas:');
    console.log('1. URL do Supabase está incorreta');
    console.log('2. Chaves de API estão incorretas');
    console.log('3. O serviço Supabase não está em execução');
    console.log('4. O firewall está bloqueando a conexão');
    console.log('\nExecute o script supabase-schema.sql no Editor SQL para criar as tabelas necessárias.');
    return false;
  }
};

// Executar verificação
verifyConnection()
  .then(success => {
    console.log('\n' + (success ? '✅ Teste concluído com sucesso!' : '❌ Teste falhou'));
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  }); 