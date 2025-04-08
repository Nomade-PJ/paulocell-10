<<<<<<< HEAD
// Importação das dependências
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import apiRoutes from './src/api/routes.js';
import fs from 'fs';

// Configuração do dotenv
dotenv.config();

// Configuração para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização da aplicação
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de informações sobre ambiente
console.log('Ambiente:', process.env.NODE_ENV || 'development');
console.log('Diretório base:', __dirname);

// Verificar se o arquivo .env existe e carregá-lo
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('Arquivo .env encontrado em:', envPath);
} else {
  console.warn('Arquivo .env não encontrado em:', envPath);
  console.warn('Usando valores padrão para configuração');
}

// Configuração da conexão com o MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paulocell',
  waitForConnections: true,
  connectionLimit: 5, // Reduzido para ambientes compartilhados
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 10000, // 10 segundos
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true
};

console.log('Configuração do banco de dados (host/db):', dbConfig.host, '/', dbConfig.database);

// Criar pool de conexão
const pool = mysql.createPool(dbConfig);

// Função de teste de conexão ao banco
async function testDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Testar execução de query
    const [result] = await connection.query('SELECT 1 AS test');
    console.log('Teste de query bem-sucedido:', result);
    
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    console.error('Detalhes do erro:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('ERRO: Acesso negado. Verifique usuário e senha do banco de dados.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('ERRO: Banco de dados não existe. Verifique o nome do banco.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('ERRO: Conexão recusada. Verifique se o servidor MySQL está rodando e acessível.');
    }
    
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Função para inicializar o banco de dados (tabelas)
async function initializeDatabase() {
  try {
    console.log('Verificando conexão com o banco de dados...');
    const connectionOk = await testDatabaseConnection();
    
    if (!connectionOk) {
      console.error('AVISO: Problemas na conexão com o banco de dados. A inicialização será tentada mesmo assim.');
    }
    
    console.log('Verificando se o banco de dados precisa ser inicializado...');
    
    // Verificar se as tabelas já existem
    const [tables] = await pool.query(`
      SELECT table_name as TABLE_NAME
      FROM information_schema.tables
      WHERE table_schema = ?`,
      [process.env.DB_NAME || 'paulocell']
    );
    
    const tableNames = tables.map(t => t.TABLE_NAME || t.table_name);
    console.log('Tabelas encontradas:', tableNames.join(', ') || 'nenhuma');
    
    if (!tableNames.includes('users') || 
        !tableNames.includes('clientes') || 
        !tableNames.includes('aparelhos') || 
        !tableNames.includes('servicos')) {
      
      console.log('Inicializando tabelas do banco de dados...');
      
      // Criar tabela de usuários
      if (!tableNames.includes('users')) {
        await pool.query(`
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('- Tabela users criada.');
        
        // Adicionar usuário administrador padrão
        const adminPassword = '$2b$10$0VVB2yBA8xxI3G54Vqf.hOEVU9iHhKvi7VQfkWQvEeFe1ntsntabi'; // 'admin123'
        await pool.query(`
          INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)
        `, ['Admin', 'admin@paulocell.com.br', adminPassword]);
        console.log('- Usuário administrador padrão criado.');
      }
      
      // Criar tabela de clientes
      if (!tableNames.includes('clientes')) {
        await pool.query(`
          CREATE TABLE clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            telefone VARCHAR(20),
            endereco TEXT,
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('- Tabela clientes criada.');
      }
      
      // Criar tabela de aparelhos
      if (!tableNames.includes('aparelhos')) {
        await pool.query(`
          CREATE TABLE aparelhos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            marca VARCHAR(50),
            modelo VARCHAR(50),
            numero_serie VARCHAR(50),
            estado VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('- Tabela aparelhos criada.');
      }
      
      // Criar tabela de serviços
      if (!tableNames.includes('servicos')) {
        await pool.query(`
          CREATE TABLE servicos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            aparelho_id INT NOT NULL,
            descricao TEXT,
            defeito_relatado TEXT,
            solucao TEXT,
            valor DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'pendente',
            data_entrada DATE,
            data_previsao DATE,
            data_saida DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (aparelho_id) REFERENCES aparelhos(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('- Tabela servicos criada.');
      }
      
      console.log('Banco de dados inicializado com sucesso!');
    } else {
      console.log('Banco de dados já está inicializado.');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    console.error('Detalhes do erro:', error.message);
    console.log('A aplicação continuará a inicialização, mas pode haver problemas de funcionalidade.');
  }
}

// Inicializar o banco de dados antes de iniciar o servidor
initializeDatabase();
=======
// Servidor Express para hospedar a aplicação React e a API em produção
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initializeDatabase } from './server/db.js';
import apiRoutes from './server/routes/index.js';

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.production' });

// Porta para o servidor
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware para parsing de JSON e CORS
app.use(express.json());
app.use(cors());

// Configurar middleware de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'paulocell-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies em produção
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813

// Rotas da API
app.use('/api', apiRoutes);

<<<<<<< HEAD
// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rota fallback para SPA
=======
// Servir arquivos estáticos da pasta dist (resultado do build)
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware para cabeçalhos de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Para qualquer rota não encontrada na API, retorna o index.html (para suportar roteamento do React Router)
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

<<<<<<< HEAD
// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  console.log(`Aplicação disponível em http://localhost:${PORT}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
});

export default app; 
=======
// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Detalhes do erro não disponíveis' : err.message
  });
});

// Inicializar o banco de dados antes de iniciar o servidor
initializeDatabase()
  .then(() => {
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em http://localhost:${PORT}/api`);
      console.log(`Aplicação disponível em http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Falha ao inicializar o servidor:', error);
    process.exit(1);
  });
>>>>>>> 079cdf380c03c61edf96d1b2d467fac8282e7813
