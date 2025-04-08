// Servidor Express.js para API do Paulo Cell
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Configurar __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar arquivo .env.production por padrão para produção
// ou o .env para ambiente de desenvolvimento
const envPath = process.env.NODE_ENV === 'development'
  ? '.env'
  : '.env.production';

// Carregar configurações do arquivo correto
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Erro ao carregar arquivo .env:', result.error);
} else {
  console.log(`Arquivo ${envPath} carregado com sucesso`);
}

// Inicializar configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log('Configurações do banco de dados:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Verificar conexão com o banco de dados
console.log('Verificando conexão com o banco de dados...');
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexão com o banco de dados estabelecida!');
    
    // Inicializa o banco de dados se ainda não existir
    console.log('Verificando se o banco de dados está inicializado...');
    await initializeDatabase(connection);
    
    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

// Inicializar aplicação Express
const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar e registrar rotas de API dinamicamente
// Como estamos usando ES Modules, precisamos importar as rotas desta forma
import('./server/routes/index.js').then(module => {
  const apiRoutes = module.default;
  app.use('/api', apiRoutes);
  
  // Servir a página de teste de login
  app.get('/test-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-login.html'));
  });

  // Servir frontend
  app.use(express.static(path.join(__dirname, 'dist')));

  // Rota para lidar com todas as outras solicitações (roteamento do lado do cliente)
  app.get('*', (req, res) => {
    // Verificar se é uma rota da API
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Rota de API não encontrada' });
    }
    
    // Para todas as outras rotas, servir o aplicativo React
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Iniciar o servidor apenas depois que as rotas estiverem registradas
  testConnection().then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`API disponível em http://localhost:${port}/api`);
      console.log(`Aplicação disponível em http://localhost:${port}`);
      console.log(`Página de teste de login: http://localhost:${port}/test-login.html`);
    });
  });
}).catch(err => {
  console.error('Erro ao importar rotas da API:', err);
});

// Função para inicializar o banco de dados se necessário
async function initializeDatabase(connection) {
  try {
    // Verificar se já existem tabelas
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length > 0) {
      console.log('O banco de dados já está inicializado.');
      return;
    }
    
    // Se não houver tabelas, criar a estrutura inicial
    console.log('Criando esquema inicial do banco de dados...');
    
    // TODO: Adicionar scripts SQL para criar tabelas
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  process.exit(0);
});