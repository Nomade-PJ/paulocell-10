/**
 * Configurações da aplicação
 * Centraliza todas as variáveis de ambiente e configurações do sistema
 */

// Importa dotenv para carregar variáveis de ambiente
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determinar o ambiente
const NODE_ENV = process.env.NODE_ENV || 'development';

// Carregar o arquivo de ambiente adequado
function loadEnvConfig() {
  try {
    // Tentar carregar .env.production primeiro em ambiente de produção
    if (NODE_ENV === 'production') {
      const prodEnvPath = path.resolve(process.cwd(), '.env.production');
      
      if (fs.existsSync(prodEnvPath)) {
        console.log('📋 Carregando configurações de produção (.env.production)');
        dotenv.config({ path: prodEnvPath });
        return true;
      } else {
        console.warn('⚠️ Arquivo .env.production não encontrado');
      }
    }
    
    // Fallback para o arquivo .env padrão
    const defaultEnvPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(defaultEnvPath)) {
      console.log('📋 Carregando configurações de ambiente (.env)');
      dotenv.config({ path: defaultEnvPath });
      return true;
    } else {
      console.warn('⚠️ Arquivo .env não encontrado');
    }
    
    // Se nenhum arquivo for encontrado, carrega sem path
    dotenv.config();
    return true;
  } catch (error) {
    console.error('❌ Erro ao carregar arquivo de ambiente:', error);
    return false;
  }
}

// Executar carregamento de configuração
loadEnvConfig();

const config = {
  // Configurações do servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV,
  
  // Configurações de autenticação
  JWT_SECRET: process.env.JWT_SECRET || 'paulocell-secret-key-change-in-production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  
  // Configurações do MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/paulocell',
  
  // Configurações de WebSocket
  WS_PORT: process.env.WS_PORT || 3001,
  
  // Configurações de CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Flag para habilitar logs detalhados
  DEBUG: process.env.DEBUG === 'true',
  
  // Configurações de rate limiting para prevenção de ataques
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
  },
  
  // Timeout de conexão para operações de banco de dados (ms)
  DB_TIMEOUT: 10000,
};

export default config; 