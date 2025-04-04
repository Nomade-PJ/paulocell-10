/**
 * Script para remover arquivos legados após a migração para Supabase
 * 
 * ATENÇÃO: Execute este script somente após confirmar que o sistema 
 * está funcionando corretamente com o Supabase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verificar se o Supabase está ativado
require('dotenv').config({ path: '.env.production' });
const useSupabase = process.env.USE_SUPABASE === 'true';

if (!useSupabase) {
  console.error('⚠️ AVISO: Supabase não está ativado no arquivo .env.production.');
  console.error('Defina USE_SUPABASE=true antes de executar este script.');
  process.exit(1);
}

// Confirmar antes de prosseguir
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧹 Script de limpeza de arquivos legados');
console.log('Este script irá remover arquivos relacionados ao MongoDB que não são mais necessários.');
console.log('⚠️ ATENÇÃO: Certifique-se de que a migração para o Supabase está concluída e funcionando.');

readline.question('\n❓ Tem certeza que deseja continuar? Esta ação não pode ser desfeita. (s/n): ', (answer) => {
  if (answer.toLowerCase() !== 's') {
    console.log('Operação cancelada pelo usuário.');
    readline.close();
    process.exit(0);
  }
  
  // Lista de arquivos a serem removidos
  const filesToRemove = [
    'api/db-initialize.js',
    'api/debug-database.js',
    'src/services/realtimeService.js',
    'models/mongoose.js',
    'src/services/api.js',
  ];
  
  // Verificar se existem arquivos de configuração MongoDB
  const configFilesToCheck = [
    'mongo-setup.js',
    'mongoDB.config.js'
  ];
  
  // Adicionar arquivos de configuração se existirem
  for (const configFile of configFilesToCheck) {
    if (fs.existsSync(path.join(process.cwd(), configFile))) {
      filesToRemove.push(configFile);
    }
  }
  
  console.log('\n🔍 Arquivos que serão removidos:');
  filesToRemove.forEach(file => console.log(`- ${file}`));
  
  readline.question('\n❓ Confirmar exclusão destes arquivos? (s/n): ', (confirmation) => {
    if (confirmation.toLowerCase() !== 's') {
      console.log('Operação cancelada pelo usuário.');
      readline.close();
      process.exit(0);
    }
    
    // Fazer backup antes de excluir
    try {
      const backupDir = path.join(process.cwd(), 'backup-mongodb');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      console.log('\n📦 Criando backup dos arquivos...');
      filesToRemove.forEach(file => {
        const sourcePath = path.join(process.cwd(), file);
        if (fs.existsSync(sourcePath)) {
          const fileName = path.basename(file);
          const destPath = path.join(backupDir, fileName);
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Backup criado: ${destPath}`);
        }
      });
      
      // Remover arquivos
      console.log('\n🗑️ Removendo arquivos...');
      filesToRemove.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Removido: ${file}`);
        } else {
          console.log(`⚠️ Arquivo não encontrado: ${file}`);
        }
      });
      
      console.log('\n✅ Limpeza concluída com sucesso!');
      console.log('Um backup dos arquivos removidos foi criado em: ' + backupDir);
      
      // Perguntar se deseja fazer commit das alterações
      readline.question('\n❓ Deseja fazer commit das alterações? (s/n): ', (commitAnswer) => {
        if (commitAnswer.toLowerCase() === 's') {
          try {
            console.log('\n📝 Realizando commit das alterações...');
            execSync('git add .', { stdio: 'inherit' });
            execSync('git commit -m "Limpeza após migração para Supabase"', { stdio: 'inherit' });
            console.log('✅ Commit realizado com sucesso!');
            
            readline.question('\n❓ Deseja enviar as alterações para o repositório remoto? (s/n): ', (pushAnswer) => {
              if (pushAnswer.toLowerCase() === 's') {
                try {
                  console.log('\n📤 Enviando alterações para o repositório remoto...');
                  execSync('git push origin main', { stdio: 'inherit' });
                  console.log('✅ Alterações enviadas com sucesso!');
                } catch (error) {
                  console.error('❌ Erro ao enviar alterações:', error.message);
                }
                readline.close();
              } else {
                console.log('Operação de push cancelada pelo usuário.');
                readline.close();
              }
            });
          } catch (error) {
            console.error('❌ Erro ao fazer commit:', error.message);
            readline.close();
          }
        } else {
          console.log('Operação de commit cancelada pelo usuário.');
          readline.close();
        }
      });
    } catch (error) {
      console.error('❌ Erro durante o processo de limpeza:', error);
      readline.close();
      process.exit(1);
    }
  });
}); 