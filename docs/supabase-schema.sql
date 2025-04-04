-- Esquema de Banco de Dados para Paulo Cell no Supabase
-- Este arquivo contém a estrutura das tabelas que devem ser criadas no Supabase

-- Habilitar Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'sua-chave-jwt-aqui';

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  total_price DECIMAL(10, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Serviço
CREATE TABLE IF NOT EXISTS public.service_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Inventário
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 5,
  price DECIMAL(10, 2),
  category TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Dados do Usuário
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida de dados do usuário
CREATE UNIQUE INDEX IF NOT EXISTS user_data_user_id_key_idx ON public.user_data (user_id, key);

-- Tabela de Health Check
CREATE TABLE IF NOT EXISTS public.health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial na tabela de health check
INSERT INTO public.health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Configuração de RLS (Row Level Security)
-- Permite que usuários só acessem seus próprios dados

-- RLS para customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar apenas seus próprios clientes" 
  ON public.customers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" 
  ON public.customers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios clientes" 
  ON public.customers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios clientes" 
  ON public.customers FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar apenas seus próprios serviços" 
  ON public.services FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios serviços" 
  ON public.services FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios serviços" 
  ON public.services FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios serviços" 
  ON public.services FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para service_items (via relacionamento com services)
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar itens de seus próprios serviços" 
  ON public.service_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.services WHERE id = service_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir itens em seus próprios serviços" 
  ON public.service_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.services WHERE id = service_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar itens de seus próprios serviços" 
  ON public.service_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.services WHERE id = service_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem excluir itens de seus próprios serviços" 
  ON public.service_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.services WHERE id = service_id AND user_id = auth.uid()
  ));

-- RLS para inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar apenas seus próprios itens de inventário" 
  ON public.inventory_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios itens de inventário" 
  ON public.inventory_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios itens de inventário" 
  ON public.inventory_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios itens de inventário" 
  ON public.inventory_items FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para user_data
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar apenas seus próprios dados" 
  ON public.user_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados" 
  ON public.user_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" 
  ON public.user_data FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios dados" 
  ON public.user_data FOR DELETE 
  USING (auth.uid() = user_id);

-- Funções de atualização automática de updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de updated_at
CREATE TRIGGER update_customers_timestamp
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

CREATE TRIGGER update_services_timestamp
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

CREATE TRIGGER update_service_items_timestamp
BEFORE UPDATE ON public.service_items
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

CREATE TRIGGER update_inventory_items_timestamp
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

CREATE TRIGGER update_user_data_timestamp
BEFORE UPDATE ON public.user_data
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp(); 