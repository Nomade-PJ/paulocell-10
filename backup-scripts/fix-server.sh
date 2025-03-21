#!/bin/bash

# Navegar para o diretório correto
cd /var/www/paulocell

# Backup the original server.js file
cp /var/www/paulocell/server.js /var/www/paulocell/server.js.bak

# Remove the copied routes.js file from root directory if it exists
if [ -f "/var/www/paulocell/routes.js" ]; then
  rm /var/www/paulocell/routes.js
  echo "Removed incorrect routes.js file from root directory."
fi

# Parar todos os processos do PM2
pm2 delete all
pm2 kill

# Criar um novo arquivo server.js
cat > server.js.new << 'EOL'
// Importação das dependências
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import apiRoutes from './src/api/routes.js'; // Ensure correct path to routes.js

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

// Configuração da conexão com o MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paulocell',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para inicializar o banco de dados (tabelas)
async function initializeDatabase() {
  try {
    console.log('Verificando conexão com o banco de dados...');
    await pool.query('SELECT 1');
    console.log('Conexão com o banco de dados estabelecida!');
    
    console.log('Verificando se o banco de dados precisa ser inicializado...');
    
    // Verificar se as tabelas já existem
    const [tables] = await pool.query(
      `SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?`,
      [process.env.DB_NAME || 'paulocell']
    );
    
    const tableNames = tables.map(t => t.TABLE_NAME || t.table_name);
    
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
          )
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
          )
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
          )
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
          )
        `);
        console.log('- Tabela servicos criada.');
      }
      
      console.log('Banco de dados inicializado com sucesso!');
    } else {
      console.log('Banco de dados já está inicializado.');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

// Inicializar o banco de dados antes de iniciar o servidor
initializeDatabase();

// Rotas da API
app.use('/api', apiRoutes);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rota fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  console.log(`Aplicação disponível em http://localhost:${PORT}`);
});

export default app;
EOL

# Fazer backup do servidor original e usar a nova versão
mv server.js server.js.original
mv server.js.new server.js

# Iniciar o PM2 novamente
pm2 start server.js --name paulocell

# Verificar logs
echo "Verificando logs do PM2 (pressione Ctrl+C para sair):"
pm2 logs paulocell