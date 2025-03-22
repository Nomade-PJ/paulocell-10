import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: true
  }
};

// Criar conexão (para funções serverless, cada conexão é criada sob demanda)
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erro ao conectar no banco de dados:', error);
    throw error;
  }
}

// Função para executar consultas
export async function query(sql, params) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default { query }; 