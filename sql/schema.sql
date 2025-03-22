-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS paulocell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paulocell;

-- Tabela para usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Tabela para dados do usuário (armazenamento persistente)
CREATE TABLE IF NOT EXISTS user_data (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  store_name VARCHAR(50) NOT NULL,
  item_key VARCHAR(255) NOT NULL,
  data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_user_store_key (user_id, store_name, item_key)
);

-- Tabela para clientes
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  cpf_cnpj VARCHAR(20),
  birthdate DATE,
  notes TEXT,
  created_at BIGINT,
  updated_at BIGINT
);

-- Tabela para dispositivos
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100),
  color VARCHAR(50),
  condition_notes TEXT,
  created_at BIGINT,
  updated_at BIGINT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Tabela para serviços
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  parts_used TEXT,
  start_date BIGINT,
  completion_date BIGINT,
  created_at BIGINT,
  updated_at BIGINT,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Tabela para estoque
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity INT NOT NULL DEFAULT 0,
  min_quantity INT DEFAULT 0,
  cost_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  supplier VARCHAR(255),
  location VARCHAR(100),
  barcode VARCHAR(100),
  created_at BIGINT,
  updated_at BIGINT
);

-- Tabela para documentos (notas fiscais, recibos, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36),
  service_id VARCHAR(36),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(255),
  created_at BIGINT,
  updated_at BIGINT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at BIGINT NOT NULL
);

-- Tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  logo TEXT,
  cpf_cnpj VARCHAR(20),
  notes TEXT
);

-- Tabela de configurações de notificações
CREATE TABLE IF NOT EXISTS notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  new_service BOOLEAN NOT NULL DEFAULT TRUE,
  service_completed BOOLEAN NOT NULL DEFAULT TRUE,
  low_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  customer_birthday BOOLEAN NOT NULL DEFAULT FALSE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  sms_notifications BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabela de configurações da API
CREATE TABLE IF NOT EXISTS api_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  api_key VARCHAR(255),
  environment ENUM('sandbox', 'production') NOT NULL DEFAULT 'sandbox',
  company_id VARCHAR(255)
);

-- Inserir configurações iniciais da empresa se a tabela estiver vazia
INSERT INTO company_settings (id, name, phone, email, address, city, state, postal_code, cpf_cnpj, notes)
SELECT 1, 'Paulo Cell', '98 984031640', 'Paullo.celullar2020@gmail.com', 'Rua Dr. Paulo Ramos, S/n, Bairro: Centro', 'Coelho Neto', 'MA', '65620-000', '42.054.453/0001-40', 'Assistência técnica especializada em celulares android e Iphone'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 1);

-- Inserir configurações iniciais de notificações se a tabela estiver vazia
INSERT INTO notification_settings (id, new_service, service_completed, low_inventory, customer_birthday, email_notifications, sms_notifications)
SELECT 1, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE id = 1);

-- Inserir configurações iniciais da API se a tabela estiver vazia
INSERT INTO api_settings (id, api_key, environment, company_id)
SELECT 1, '', 'sandbox', ''
WHERE NOT EXISTS (SELECT 1 FROM api_settings WHERE id = 1);

-- Inserir usuário padrão para acesso ao sistema (apenas em desenvolvimento)
INSERT IGNORE INTO users (id, name, email, role) 
VALUES ('1', 'Paulo Cell', 'paullo.celullar2020@gmail.com', 'admin'); 