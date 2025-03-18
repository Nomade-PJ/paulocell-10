-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS paulocell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paulocell;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  photo_url TEXT,
  role ENUM('admin', 'technician', 'receptionist') NOT NULL DEFAULT 'technician',
  created_at BIGINT NOT NULL
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  cpf_cnpj VARCHAR(20),
  birthdate DATE,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Tabela de dispositivos
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(36) PRIMARY KEY,
  owner VARCHAR(36),
  owner_name VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  serial_number VARCHAR(100),
  imei VARCHAR(50),
  password VARCHAR(100),
  condition_desc VARCHAR(255),
  accessories JSON,
  problem_description TEXT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (owner) REFERENCES customers(id) ON DELETE SET NULL
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36),
  customer_name VARCHAR(255) NOT NULL,
  device_id VARCHAR(36),
  device_description TEXT,
  type VARCHAR(100) NOT NULL,
  custom_type VARCHAR(100),
  description TEXT NOT NULL,
  budget DECIMAL(10,2),
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  warranty VARCHAR(50),
  parts JSON,
  labor_cost DECIMAL(10,2),
  start_date BIGINT NOT NULL,
  end_date BIGINT,
  technician VARCHAR(100),
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

-- Tabela de inventário
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  min_quantity INT,
  supplier VARCHAR(255),
  location VARCHAR(100),
  description TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  customer_id VARCHAR(36),
  customer_name VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  due_date BIGINT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
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