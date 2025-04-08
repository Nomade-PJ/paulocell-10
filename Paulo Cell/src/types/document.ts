export interface Document {
  id: string;
  number: string;
  type: 'receipt' | 'invoice' | 'budget' | 'service-order';
  customerId: string;
  customerName: string;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'canceled';
  total: number;
  items: DocumentItem[];
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
} 