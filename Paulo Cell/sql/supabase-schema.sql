-- Paulo Cell - Esquema de banco de dados para Supabase

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp na tabela de clientes
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de dispositivos
CREATE TABLE IF NOT EXISTS public.devices (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o timestamp na tabela de dispositivos
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de técnicos
CREATE TABLE IF NOT EXISTS public.technicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o timestamp na tabela de técnicos
CREATE TRIGGER update_technicians_updated_at
BEFORE UPDATE ON public.technicians
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  price NUMERIC(10,2) NOT NULL,
  technician_id INTEGER REFERENCES public.technicians(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Trigger para atualizar o timestamp na tabela de serviços
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de usuários (para autenticação)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'technician', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o timestamp na tabela de usuários
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança do Supabase (RLS - Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de clientes (todos podem ver, apenas autenticados podem modificar)
CREATE POLICY "Clientes visíveis para todos" ON public.customers
  FOR SELECT USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir clientes" ON public.customers
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem atualizar clientes" ON public.customers
  FOR UPDATE USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem excluir clientes" ON public.customers
  FOR DELETE USING (auth.role() IN ('authenticated', 'service_role'));

-- Políticas similares para as outras tabelas
-- Dispositivos
CREATE POLICY "Dispositivos visíveis para todos" ON public.devices
  FOR SELECT USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir dispositivos" ON public.devices
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem atualizar dispositivos" ON public.devices
  FOR UPDATE USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem excluir dispositivos" ON public.devices
  FOR DELETE USING (auth.role() IN ('authenticated', 'service_role'));

-- Serviços
CREATE POLICY "Serviços visíveis para todos" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir serviços" ON public.services
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem atualizar serviços" ON public.services
  FOR UPDATE USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Apenas usuários autenticados podem excluir serviços" ON public.services
  FOR DELETE USING (auth.role() IN ('authenticated', 'service_role'));

-- Índices para melhorar a performance
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_phone ON public.customers(phone);

CREATE INDEX idx_devices_customer_id ON public.devices(customer_id);
CREATE INDEX idx_devices_brand_model ON public.devices(brand, model);

CREATE INDEX idx_services_device_id ON public.services(device_id);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_services_technician_id ON public.services(technician_id); 