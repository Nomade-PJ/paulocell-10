// Interfaces para os modelos de dados da aplicação
// Estas interfaces serão usadas tanto para o frontend quanto para o backend

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  cpfCnpj?: string;
  birthdate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Device {
  id: string;
  owner: string;
  ownerName?: string;
  type: string;
  brand: string;
  model: string;
  color?: string;
  serialNumber?: string;
  imei?: string;
  password?: string;
  condition?: string;
  accessories?: string[];
  problemDescription?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  id: string;
  customerId?: string;
  customerName: string;
  deviceId?: string;
  deviceDescription?: string;
  type: string;
  customType?: string;
  description: string;
  budget?: number;
  status: string;
  priority: string;
  warranty?: string;
  parts?: { name: string; price: number; quantity: number }[];
  laborCost?: number;
  startDate: number;
  endDate?: number;
  technician?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  minQuantity?: number;
  supplier?: string;
  location?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: string;
  type: string;
  customerId?: string;
  customerName: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  status: string;
  dueDate?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompanyData {
  name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  logo?: string;
  cpfCnpj?: string;
  notes?: string;
}

export interface NotificationSettings {
  newService: boolean;
  serviceCompleted: boolean;
  lowInventory: boolean;
  customerBirthday: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role: 'admin' | 'technician' | 'receptionist';
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  link?: string;
  createdAt: number;
}

export interface ApiSettings {
  apiKey: string;
  environment: 'sandbox' | 'production';
  companyId: string;
} 