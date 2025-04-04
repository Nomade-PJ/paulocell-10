/**
 * Script para configurar o Supabase após a instalação
 * 
 * Este script auxilia na configuração inicial do Supabase:
 * 1. Verifica se o Supabase está acessível
 * 2. Cria os buckets de armazenamento necessários
 * 3. Executa o script SQL para criar as tabelas
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Criar interface para leitura de input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQL_SCHEMA_PATH = path.join(__dirname, '..', 'docs', 'supabase-schema.sql');

// Verificar configurações necessárias
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
  process.exit(1);
}

// Criar cliente do Supabase (usando chave de serviço para acesso administrativo)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para verificar conexão
const checkConnection = async () => {
  try {
    console.log('🔄 Verificando conexão com Supabase...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Falha na conexão: ${error.message}`);
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error(`❌ Erro ao conectar com Supabase: ${error.message}`);
    return false;
  }
};

// Função para criar buckets de armazenamento
const createStorageBuckets = async () => {
  const buckets = [
    'profile-images',
    'product-images',
    'documents',
    'temp'
  ];
  
  try {
    console.log('🔄 Criando buckets de armazenamento...');
    
    // Verificar quais buckets já existem
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Erro ao listar buckets: ${listError.message}`);
    }
    
    const existingBucketNames = existingBuckets.map(b => b.name);
    
    // Criar buckets que não existem
    for (const bucketName of buckets) {
      if (existingBucketNames.includes(bucketName)) {
        console.log(`ℹ️ Bucket '${bucketName}' já existe.`);
        continue;
      }
      
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: false,
      });
      
      if (error) {
        console.error(`❌ Erro ao criar bucket '${bucketName}': ${error.message}`);
      } else {
        console.log(`✅ Bucket '${bucketName}' criado com sucesso!`);
        
        // Configurar políticas de acesso para o bucket
        await supabase.storage.from(bucketName).setPublicAccessible(true);
      }
    }
    
    console.log('✅ Configuração de armazenamento concluída!');
    return true;
  } catch (error) {
    console.error(`❌ Erro ao configurar buckets de armazenamento: ${error.message}`);
    return false;
  }
};

// Função para executar script SQL (apenas orientações, não executa diretamente)
const setupDatabase = async () => {
  try {
    console.log('🔄 Verificando script SQL...');
    
    if (!fs.existsSync(SQL_SCHEMA_PATH)) {
      throw new Error(`Arquivo de schema SQL não encontrado em: ${SQL_SCHEMA_PATH}`);
    }
    
    const sqlContent = fs.readFileSync(SQL_SCHEMA_PATH, 'utf8');
    
    console.log('\n📋 INSTRUÇÕES PARA CONFIGURAR O BANCO DE DADOS:');
    console.log('1. Acesse o painel do Supabase em ' + SUPABASE_URL);
    console.log('2. Vá para a seção "SQL Editor" no menu lateral');
    console.log('3. Crie uma nova consulta');
    console.log('4. Cole o conteúdo do arquivo docs/supabase-schema.sql');
    console.log('5. Execute o script SQL');
    
    return new Promise((resolve) => {
      rl.question('\nVocê já executou o script SQL? (s/n): ', (answer) => {
        if (answer.toLowerCase() === 's') {
          console.log('✅ Configuração do banco de dados concluída!');
          resolve(true);
        } else {
          console.log('ℹ️ Por favor, execute o script SQL antes de prosseguir.');
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Erro ao configurar banco de dados: ${error.message}`);
    return false;
  }
};

// Função principal
const setupSupabase = async () => {
  try {
    console.log('🚀 Iniciando configuração do Supabase...\n');
    
    // Verificar conexão
    const connected = await checkConnection();
    if (!connected) {
      throw new Error('Falha na conexão com Supabase. Verifique as credenciais.');
    }
    
    // Criar buckets de armazenamento
    const bucketsCreated = await createStorageBuckets();
    if (!bucketsCreated) {
      console.warn('⚠️ Configuração de armazenamento incompleta.');
    }
    
    // Configuração do banco de dados (orientações)
    const dbSetup = await setupDatabase();
    
    console.log('\n📋 RESUMO DA CONFIGURAÇÃO:');
    console.log(`- Conexão com Supabase: ${connected ? '✅' : '❌'}`);
    console.log(`- Buckets de armazenamento: ${bucketsCreated ? '✅' : '⚠️'}`);
    console.log(`- Configuração do banco de dados: ${dbSetup ? '✅' : '⚠️'}`);
    
    console.log('\n🔍 PRÓXIMOS PASSOS:');
    console.log('1. Execute "npm run check:supabase" para verificar a configuração');
    console.log('2. Teste o aplicativo com "USE_SUPABASE=true npm start"');
    console.log('3. Para habilitar permanentemente o Supabase, edite o arquivo .env.production');
    
    console.log('\n✅ Configuração concluída!');
    rl.close();
  } catch (error) {
    console.error(`❌ Erro durante a configuração: ${error.message}`);
    rl.close();
    process.exit(1);
  }
};

// Executar script
setupSupabase(); 