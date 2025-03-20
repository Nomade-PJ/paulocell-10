// Script para criar o arquivo .env.production a partir do diretório root na Hostinger
import fs from 'fs';
import path from 'path';

async function createEnvProduction() {
  console.log('=== Criando arquivo .env.production no servidor Hostinger ===');
  
  // Detectar o diretório do projeto
  let projectDir = '/var/www/paulocell';
  
  // Verificar se o diretório do projeto existe
  if (!fs.existsSync(projectDir)) {
    console.log(`⚠️ Diretório do projeto não encontrado em ${projectDir}`);
    console.log('Tentando encontrar o diretório do projeto...');
    
    // Tentar encontrar o diretório do projeto em outros locais comuns
    const possibleDirs = [
      '/var/www/html',
      '/var/www',
      '/home/u123456789/domains/seudominio.com/public_html' // Formato comum na Hostinger
    ];
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        projectDir = dir;
        console.log(`Possível diretório do projeto encontrado em: ${projectDir}`);
        break;
      }
    }
  } else {
    console.log(`Diretório do projeto encontrado em: ${projectDir}`);
  }
  
  const envProductionPath = path.join(projectDir, '.env.production');
  
  try {
    // Verificar se o arquivo .env.production já existe
    if (fs.existsSync(envProductionPath)) {
      console.log('✅ Arquivo .env.production já existe.');
      console.log('Se precisar recriar, exclua o arquivo existente primeiro.');
      return;
    }
    
    // Conteúdo do arquivo .env.production
    const envContent = `# Configurações do ambiente de produção
# Configurações do Firebase (se estiver usando)
VITE_FIREBASE_API_KEY=AIzaSyBXFuHbCQqwg5sZYcpHmxMvU9NdvJx-BLw
VITE_FIREBASE_AUTH_DOMAIN=paulocell-sistema.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=paulocell-sistema
VITE_FIREBASE_STORAGE_BUCKET=paulocell-sistema.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1098765432
VITE_FIREBASE_APP_ID=1:1098765432:web:abc123def456ghi789jkl

# Configurações do servidor
NODE_ENV=production
PORT=3000

# Configurações do banco de dados MySQL na Hostinger
# IMPORTANTE: Substitua estes valores pelos fornecidos pela Hostinger
DB_HOST=localhost
DB_USER=seu_usuario_mysql_hostinger
DB_PASSWORD=sua_senha_mysql_hostinger
DB_NAME=seu_banco_de_dados_hostinger

# URL base da API
VITE_API_URL=/api

# Outras configurações
VITE_APP_URL=https://seu-dominio-na-hostinger.com
`;
    
    // Escrever o arquivo .env.production
    fs.writeFileSync(envProductionPath, envContent, 'utf8');
    console.log(`✅ Arquivo .env.production criado com sucesso em: ${envProductionPath}`);
    console.log('\nAgora edite o arquivo com as credenciais corretas do seu banco de dados MySQL na Hostinger.');
    console.log('\nPara editar o arquivo no terminal da Hostinger, use:');
    console.log(`nano ${envProductionPath}`);
    
    console.log('\nInformações importantes para preencher:');
    console.log('1. DB_HOST: geralmente "localhost" na Hostinger');
    console.log('2. DB_USER: o nome de usuário do seu banco MySQL na Hostinger');
    console.log('3. DB_PASSWORD: a senha do seu banco MySQL na Hostinger');
    console.log('4. DB_NAME: o nome do banco de dados na Hostinger');
    
    console.log('\n=== Criação do arquivo concluída ===');
  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env.production:', error.message);
  }
}

// Executar a função
createEnvProduction();