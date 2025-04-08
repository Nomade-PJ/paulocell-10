import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos das tabelas do Supabase
export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
};

export type Device = {
  id: number;
  customer_id: number;
  brand: string;
  model: string;
  serial_number?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: number;
  device_id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  technician_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

// Funções auxiliares para manipulação de dados do Supabase
export const supabaseService = {
  // Clientes
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Customer[];
  },
  
  async getCustomerById(id: number) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
  
  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
  
  async updateCustomer(id: number, customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
  
  async deleteCustomer(id: number) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Dispositivos
  async getDevices() {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Device[];
  },
  
  async getDevicesByCustomerId(customerId: number) {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Device[];
  },
  
  async createDevice(device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('devices')
      .insert(device)
      .select()
      .single();
    
    if (error) throw error;
    return data as Device;
  },
  
  // Serviços
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Service[];
  },
  
  async getServicesByDeviceId(deviceId: number) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Service[];
  },
  
  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data as Service;
  },
  
  async updateServiceStatus(id: number, status: Service['status']) {
    const updates: Partial<Service> = { status };
    
    // Se o status for 'completed', atualizar o completed_at
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Service;
  }
}; 