-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS paulocell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paulocell;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'technician', 'receptionist') NOT NULL DEFAULT 'technician',
  photo_url TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address JSON,
  is_company BOOLEAN DEFAULT FALSE,
  cpf_cnpj VARCHAR(20),
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Tabela de dispositivos
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(36) PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  owner VARCHAR(36),
  serial_number VARCHAR(100),
  imei VARCHAR(50),
  purchase_date BIGINT,
  status VARCHAR(50) DEFAULT 'active',
  condition VARCHAR(50) DEFAULT 'good',
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (owner) REFERENCES customers(id) ON DELETE SET NULL
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(36),
  type VARCHAR(50) DEFAULT 'repair',
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  price DECIMAL(10,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  warranty_days INT DEFAULT 0,
  diagnosis TEXT,
  solution TEXT,
  technician VARCHAR(100),
  scheduled_date BIGINT,
  start_date BIGINT,
  finish_date BIGINT,
  parts_used JSON,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

-- Tabela de inventário
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  category VARCHAR(100) DEFAULT 'Outros',
  quantity INT DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'un',
  cost_price DECIMAL(10,2) DEFAULT 0,
  sell_price DECIMAL(10,2) DEFAULT 0,
  min_stock INT DEFAULT 0,
  location VARCHAR(100),
  supplier VARCHAR(255),
  last_purchase BIGINT,
  image_url TEXT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  number VARCHAR(100),
  customer_id VARCHAR(36),
  customer_name VARCHAR(255) NOT NULL,
  date BIGINT NOT NULL,
  items JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'Pendente',
  due_date BIGINT,
  invoice_id VARCHAR(100),
  invoice_url TEXT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address JSON,
  cpf_cnpj VARCHAR(20),
  logo_url TEXT,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  notes TEXT,
  updated_at BIGINT NOT NULL
);

-- Tabela de configurações de notificações
CREATE TABLE IF NOT EXISTS notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  new_service BOOLEAN NOT NULL DEFAULT TRUE,
  service_completed BOOLEAN NOT NULL DEFAULT TRUE,
  low_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  customer_birthday BOOLEAN NOT NULL DEFAULT FALSE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at BIGINT NOT NULL
);

-- Tabela de configurações da API de notas fiscais
CREATE TABLE IF NOT EXISTS invoice_api_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  api_key VARCHAR(255),
  environment ENUM('sandbox', 'production') NOT NULL DEFAULT 'sandbox',
  company_id VARCHAR(255),
  updated_at BIGINT NOT NULL
);

-- Inserir usuário administrador padrão se a tabela estiver vazia (senha: paulocell@admin)
INSERT INTO users (id, username, email, password, name, role, created_at, updated_at)
SELECT 
  'admin',
  'paulocell',
  'admin@paulocell.com',
  '$2b$10$PGY5aMsVR0YxvRtimIJjMuMp2u8lPEnODFO2PJQM9vH6rMdW5Khry',
  'Administrador',
  'admin',
  UNIX_TIMESTAMP() * 1000,
  UNIX_TIMESTAMP() * 1000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'paulocell');

-- Inserir configurações iniciais da empresa se a tabela estiver vazia
INSERT INTO company_settings (id, name, phone, email, address, cpf_cnpj, notes, updated_at)
SELECT 
  1, 
  'Paulo Cell', 
  '98 984031640', 
  'Paullo.celullar2020@gmail.com', 
  JSON_OBJECT(
    'street', 'Rua Dr. Paulo Ramos',
    'number', 'S/n',
    'neighborhood', 'Centro',
    'city', 'Coelho Neto',
    'state', 'MA',
    'postalCode', '65620-000'
  ), 
  '42.054.453/0001-40', 
  'Assistência técnica especializada em celulares android e Iphone',
  UNIX_TIMESTAMP() * 1000
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 1);

-- Inserir configurações iniciais de notificações se a tabela estiver vazia
INSERT INTO notification_settings (id, new_service, service_completed, low_inventory, customer_birthday, email_notifications, sms_notifications, updated_at)
SELECT 
  1, 
  TRUE, 
  TRUE, 
  TRUE, 
  FALSE, 
  TRUE, 
  FALSE,
  UNIX_TIMESTAMP() * 1000
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE id = 1);

-- Inserir configurações iniciais da API se a tabela estiver vazia
INSERT INTO invoice_api_settings (id, api_key, environment, company_id, updated_at)
SELECT 
  1, 
  '', 
  'sandbox', 
  '',
  UNIX_TIMESTAMP() * 1000
WHERE NOT EXISTS (SELECT 1 FROM invoice_api_settings WHERE id = 1); 