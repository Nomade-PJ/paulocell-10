/**
 * Script para migrar dados do MongoDB para o Supabase
 * 
 * Este script exporta dados do MongoDB e os importa para o Supabase.
 * Executa a migração para cada coleção do sistema.
 */

require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paulocell';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_DIR = path.join(__dirname, '..', 'exports');

// Verificar configurações necessárias
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
  process.exit(1);
}

// Criar diretório de exportação se não existir
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  console.log(`✅ Diretório de exportação criado: ${EXPORT_DIR}`);
}

// Criar cliente do Supabase (usando chave de serviço para acesso administrativo)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Carregar modelos do MongoDB
const getModels = require('../models/mongoose').default;

// Funções auxiliares
const exportCollection = async (Model, collectionName) => {
  try {
    console.log(`🔍 Exportando coleção ${collectionName}...`);
    const documents = await Model.find({}).lean();
    
    const exportPath = path.join(EXPORT_DIR, `${collectionName}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(documents, null, 2));
    
    console.log(`✅ Exportados ${documents.length} documentos para ${exportPath}`);
    return { success: true, count: documents.length, path: exportPath };
  } catch (error) {
    console.error(`❌ Erro ao exportar coleção ${collectionName}:`, error);
    return { success: false, error };
  }
};

const importToSupabase = async (tableName, data, transformer) => {
  try {
    console.log(`📤 Importando dados para tabela ${tableName}...`);
    
    // Transformar dados se necessário
    const transformedData = transformer ? data.map(transformer) : data;
    
    // Inserir em lotes para evitar exceder limites
    const BATCH_SIZE = 100;
    let successful = 0;
    
    for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
      const batch = transformedData.slice(i, i + BATCH_SIZE);
      const { data: inserted, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Erro ao inserir lote na tabela ${tableName}:`, error);
      } else {
        successful += inserted.length;
        console.log(`✅ Inseridos ${inserted.length} registros no lote ${i/BATCH_SIZE + 1}`);
      }
    }
    
    console.log(`✅ Importação para ${tableName} concluída. Total inserido: ${successful}/${transformedData.length}`);
    return { success: true, count: successful };
  } catch (error) {
    console.error(`❌ Erro ao importar para tabela ${tableName}:`, error);
    return { success: false, error };
  }
};

// Transformadores para cada tipo de documento
const transformers = {
  // Clientes
  customers: (doc) => ({
    id: doc._id.toString(), // Usar o mesmo ID para preservar relacionamentos
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    notes: doc.notes,
    user_id: doc.userId.toString(),
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  }),
  
  // Serviços
  services: (doc) => ({
    id: doc._id.toString(),
    description: doc.description,
    client_name: doc.clientName,
    client_phone: doc.clientPhone || '',
    status: doc.status || 'pending',
    total_price: doc.totalPrice || 0,
    completed_at: doc.completedAt,
    user_id: doc.userId.toString(),
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  }),
  
  // Itens de serviço
  serviceItems: (doc) => ({
    id: doc._id.toString(),
    service_id: doc.serviceId.toString(),
    description: doc.description,
    quantity: doc.quantity || 1,
    price: doc.price || 0,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  }),
  
  // Itens de inventário
  inventoryItems: (doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    quantity: doc.quantity || 0,
    min_quantity: doc.minQuantity || 5,
    price: doc.price || 0,
    category: doc.category || '',
    user_id: doc.userId.toString(),
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  }),
  
  // Dados do usuário
  userData: (doc) => ({
    id: doc._id.toString(),
    user_id: doc.userId.toString(),
    key: doc.key,
    value: doc.data,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  })
};

// Principal função de migração
const migrateData = async () => {
  try {
    console.log('🚀 Iniciando migração de dados do MongoDB para o Supabase...');
    
    // Conectar ao MongoDB
    console.log(`🔄 Conectando ao MongoDB em ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Obter modelos
    const models = getModels();
    if (!models) {
      throw new Error('Não foi possível carregar os modelos do MongoDB');
    }
    
    // Verificar conexão com Supabase
    console.log('🔄 Verificando conexão com Supabase...');
    const { data: healthCheck, error: healthCheckError } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    if (healthCheckError) {
      throw new Error(`Não foi possível conectar ao Supabase: ${healthCheckError.message}`);
    }
    console.log('✅ Conectado ao Supabase com sucesso!');
    
    // Exportar e importar cada coleção
    const migrations = [
      {
        name: 'Clientes',
        model: models.Customer,
        collection: 'customers',
        table: 'customers',
        transformer: transformers.customers
      },
      {
        name: 'Serviços',
        model: models.Service,
        collection: 'services',
        table: 'services',
        transformer: transformers.services
      },
      {
        name: 'Itens de Serviço',
        model: models.ServiceItem,
        collection: 'serviceitems',
        table: 'service_items',
        transformer: transformers.serviceItems
      },
      {
        name: 'Itens de Inventário',
        model: models.InventoryItem,
        collection: 'inventoryitems',
        table: 'inventory_items',
        transformer: transformers.inventoryItems
      },
      {
        name: 'Dados do Usuário',
        model: models.UserData,
        collection: 'userdata',
        table: 'user_data',
        transformer: transformers.userData
      }
    ];
    
    // Executar cada migração
    const results = [];
    
    for (const migration of migrations) {
      console.log(`\n=== Migrando ${migration.name} ===`);
      
      // Exportar do MongoDB
      const exportResult = await exportCollection(migration.model, migration.collection);
      
      if (!exportResult.success) {
        console.error(`❌ Falha ao exportar ${migration.name}. Pulando importação.`);
        results.push({
          name: migration.name,
          success: false,
          error: exportResult.error
        });
        continue;
      }
      
      // Carregar dados exportados
      const exportedData = JSON.parse(fs.readFileSync(exportResult.path, 'utf8'));
      
      // Importar para o Supabase
      const importResult = await importToSupabase(
        migration.table,
        exportedData,
        migration.transformer
      );
      
      results.push({
        name: migration.name,
        success: importResult.success,
        exported: exportResult.count,
        imported: importResult.count,
        error: importResult.error
      });
    }
    
    // Relatório final
    console.log('\n=== Relatório da Migração ===');
    results.forEach(result => {
      const status = result.success ? '✅ Sucesso' : '❌ Falha';
      console.log(`${status} | ${result.name}: Exportados ${result.exported || 0}, Importados ${result.imported || 0}`);
      if (!result.success && result.error) {
        console.log(`   Erro: ${result.error.message}`);
      }
    });
    
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('\n✅ Migração concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante o processo de migração:', error);
  }
};

// Executar migração
migrateData(); 