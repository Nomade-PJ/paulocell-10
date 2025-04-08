/**
 * Utilitário para conexão com o banco de dados
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
const envPath = process.env.NODE_ENV === 'development' ? '.env' : '.env.production';
dotenv.config({ path: envPath });

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'paulocell_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paulocell',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * Obter uma conexão com o banco de dados
 */
export async function getDbConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

/**
 * Inicializar o banco de dados se necessário
 */
export async function initializeDatabase() {
  try {
    console.log('Verificando e inicializando banco de dados...');
    
    // Criar conexão
    const connection = await getDbConnection();
    
    // Verificar se já existem tabelas
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length > 0) {
      console.log('O banco de dados já está inicializado.');
      await connection.end();
      return false;
    }
    
    console.log('Criando estrutura inicial do banco de dados...');
    
    // Tabela de clientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        cpf_cnpj VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de dispositivos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS devices (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36),
        type VARCHAR(50) NOT NULL,
        brand VARCHAR(50),
        model VARCHAR(100),
        serial_number VARCHAR(100),
        condition TEXT,
        password VARCHAR(50),
        accessories TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);
    
    // Tabela de serviços
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(36) PRIMARY KEY,
        device_id VARCHAR(36),
        customer_id VARCHAR(36),
        description TEXT NOT NULL,
        problem TEXT,
        status VARCHAR(20) DEFAULT 'Pendente',
        priority VARCHAR(10) DEFAULT 'Normal',
        price DECIMAL(10,2),
        start_date DATETIME,
        end_date DATETIME,
        technician VARCHAR(100),
        solution TEXT,
        parts_used TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);
    
    // Tabela de inventário
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        quantity INT DEFAULT 0,
        min_quantity INT DEFAULT 0,
        cost_price DECIMAL(10,2),
        sell_price DECIMAL(10,2),
        location VARCHAR(100),
        supplier VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de configurações
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de documentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        number VARCHAR(50) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_id VARCHAR(36),
        issue_date DATE NOT NULL,
        total_value DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendente',
        payment_method VARCHAR(50),
        observations TEXT,
        invoice_id VARCHAR(100),
        invoice_number VARCHAR(50),
        invoice_key VARCHAR(100),
        invoice_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);
    
    // Tabela de itens de documentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS document_items (
        id VARCHAR(36) PRIMARY KEY,
        document_id VARCHAR(36) NOT NULL,
        description VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit VARCHAR(10) DEFAULT 'un',
        unit_value DECIMAL(10,2) NOT NULL,
        total_value DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);
    
    // Tabela de estatísticas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS statistics (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Inserir dados iniciais para estatísticas
    await connection.execute(`
      INSERT INTO statistics (id, type, data) VALUES 
      (UUID(), 'core_statistics', '{"devices":{"byType":{"tablet":0,"celular":0,"notebook":0,"outros":0},"byStatus":{"bomEstado":0,"problemasLeves":0,"problemasCriticos":0},"byBrand":{"Apple":0,"Samsung":0,"Xiaomi":0,"Motorola":0,"LG":0,"Outros":0}},"services":{"byStatus":{"emAndamento":0,"aguardandoPecas":0,"concluidos":0,"cancelados":0,"entregues":0},"byType":{"trocaTela":0,"trocaBateria":0,"reparoPlaca":0,"conectorCarga":0,"outros":0},"avgTime":{"trocaTela":0,"trocaBateria":0,"reparoPlaca":0,"conectorCarga":0,"diagnostico":0}},"customers":{"byType":{"pessoaFisica":0,"empresa":0},"distribution":{"tela":0,"bateria":0,"acessorio":0,"placa":0,"outro":0},"monthly":{"jan":0,"fev":0,"mar":0,"abr":0,"mai":0,"jun":0,"jul":0,"ago":0,"set":0,"out":0,"nov":0,"dez":0}},"sales":{"monthly":{"services":[0,0,0,0,0,0,0,0,0,0,0,0],"parts":[0,0,0,0,0,0,0,0,0,0,0,0],"total":[0,0,0,0,0,0,0,0,0,0,0,0]},"total":{"value":0,"growth":0},"services":{"value":0,"growth":0},"parts":{"value":0,"growth":0}}}'
      ),
      (UUID(), 'visual_statistics', '{}'),
      (UUID(), 'statistics_metadata', '{"lastReset":"${new Date().toISOString()}","flags":{"dataReset":false}}')
    `);
    
    console.log('Banco de dados inicializado com sucesso!');
    await connection.end();
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

export default {
  getDbConnection,
  initializeDatabase
}; 