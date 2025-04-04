/**
 * Script para remoção direta de APIs MongoDB desnecessárias
 * ATENÇÃO: Execute apenas quando tiver certeza que o Supabase está funcionando corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpeza de APIs MongoDB desnecessárias...');

// Lista de arquivos e diretórios a remover
const itemsToRemove = [
  'api/db-initialize.js',
  'api/debug-database.js',
  'src/services/realtimeService.js',
  'models/mongoose.js',
  'src/services/api.js'
];

// Função para excluir um arquivo ou diretório recursivamente
function removeItem(itemPath) {
  const fullPath = path.join(__dirname, itemPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Item não encontrado: ${itemPath}`);
    return;
  }
  
  const stats = fs.statSync(fullPath);
  
  if (stats.isDirectory()) {
    // É um diretório, exclua recursivamente
    console.log(`📁 Removendo diretório: ${itemPath}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    // É um arquivo, exclua diretamente
    console.log(`📄 Removendo arquivo: ${itemPath}`);
    fs.unlinkSync(fullPath);
  }
  
  console.log(`✅ Removido: ${itemPath}`);
}

// Executar a remoção
let removedCount = 0;
for (const item of itemsToRemove) {
  try {
    removeItem(item);
    removedCount++;
  } catch (error) {
    console.error(`❌ Erro ao remover ${item}:`, error.message);
  }
}

console.log(`\n✅ Limpeza concluída. Removidos ${removedCount} de ${itemsToRemove.length} itens.`);

if (removedCount > 0) {
  console.log('\n🔍 Para reverter esta operação, você precisará restaurar os arquivos a partir de um backup ou do repositório git.');
}

console.log('\n💡 Lembre-se de executar "npm run start:prod" para verificar se o sistema continua funcionando corretamente.'); 