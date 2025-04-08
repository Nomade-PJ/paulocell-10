import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
// Primeiro tenta carregar .env.production, se não existir, carrega .env
try {
  const envProdResult = dotenv.config({ path: '.env.production' });
  if (envProdResult.error) {
    console.log('Arquivo .env.production não encontrado, carregando .env');
    dotenv.config();
  } else {
    console.log('Arquivo .env.production carregado com sucesso');
  }
} catch (error) {
  console.error('Erro ao carregar variáveis de ambiente:', error);
  dotenv.config(); // Fallback para .env padrão
}

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paulocell',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Configurações do banco de dados:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    console.log('Verificando conexão com o banco de dados...');
    
    // Teste de conexão
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados estabelecida!');
    
    // Executar o script de inicialização se necessário
    console.log('Verificando se o banco de dados precisa ser inicializado...');
    
    try {
      // Verificar se a tabela de usuários existe
      await connection.query('SELECT 1 FROM users LIMIT 1');
      console.log('Banco de dados já está inicializado.');
    } catch (error) {
      // Se a tabela não existe, executar o script de inicialização
      console.log('Inicializando o banco de dados...');
      
      const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSQL
          .split(';')
          .filter(statement => statement.trim())
          .map(statement => statement.trim() + ';');
        
        for (const statement of statements) {
          if (statement.includes('CREATE DATABASE') || statement.includes('USE')) {
            // Ignorar comandos de criação de banco de dados e uso
            continue;
          }
          await connection.query(statement);
        }
        
        console.log('Banco de dados inicializado com sucesso!');
      } else {
        console.error('Arquivo de esquema SQL não encontrado:', schemaPath);
      }
    } finally {
      connection.release();
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função para executar consultas
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    throw error;
  }
}

export { pool, query, initializeDatabase }; 