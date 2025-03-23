import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
try {
  // Primeiro tenta o .env.production
  dotenv.config({ path: '.env.production' });
  console.log('Configurações de banco de dados carregadas de .env.production');
} catch (e) {
  try {
    // Se falhar, tenta .env
    dotenv.config();
    console.log('Configurações de banco de dados carregadas de .env');
  } catch (e) {
    console.log('Não foi possível carregar arquivo .env, usando variáveis de ambiente do sistema');
  }
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
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: process.env.DB_POOL_WAIT_FOR_CONNECTIONS === 'false' ? false : true,
  connectionLimit: parseInt(process.env.DB_POOL_CONNECTION_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_POOL_QUEUE_LIMIT || '0', 10),
  // Adicionar SSL se configurado
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    console.log('Verificando conexão com o banco de dados...');
    console.log(`Tentando conectar a: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (usuário: ${dbConfig.user})`);
    
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
        
        // Remover comentários e comandos que o cPanel pode não permitir
        const filteredStatements = statements.filter(statement => {
          const upperStatement = statement.toUpperCase();
          // Excluir comandos de criação de banco e USE que podem causar problemas
          return !upperStatement.includes('CREATE DATABASE') && 
                 !upperStatement.includes('USE ') &&
                 statement.trim() !== ';';
        });
        
        console.log(`Executando ${filteredStatements.length} comandos SQL...`);
        
        for (const statement of filteredStatements) {
          try {
            await connection.query(statement);
          } catch (err) {
            console.error(`Erro ao executar comando SQL: ${statement.substring(0, 100)}...`, err.message);
            // Continuar com o próximo comando mesmo em caso de erro
          }
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