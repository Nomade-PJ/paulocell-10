import { Document } from '../../types/document';
import { api } from '../api';

/**
 * Busca todos os documentos
 */
export const getAll = async (): Promise<Document[]> => {
  try {
    const response = await api.get('/documents');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

/**
 * Busca um documento pelo ID
 */
export const getById = async (id: string): Promise<Document> => {
  try {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar documento ${id}:`, error);
    throw error;
  }
};

/**
 * Cria um novo documento
 */
export const create = async (document: Partial<Document>): Promise<Document> => {
  try {
    const response = await api.post('/documents', document);
    
    // Disparar evento de criação
    window.dispatchEvent(new CustomEvent('documentCreated', { 
      detail: { document: response.data }
    }));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error;
  }
};

/**
 * Atualiza um documento existente
 */
export const update = async (id: string, document: Partial<Document>): Promise<Document> => {
  try {
    const response = await api.put(`/documents/${id}`, document);
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('documentUpdated', { 
      detail: { document: response.data }
    }));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar documento ${id}:`, error);
    throw error;
  }
};

/**
 * Atualiza o status de um documento
 */
export const updateStatus = async (id: string, status: string): Promise<Document> => {
  try {
    const response = await api.patch(`/documents/${id}/status`, { status });
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('documentUpdated', { 
      detail: { document: response.data }
    }));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status do documento ${id}:`, error);
    throw error;
  }
};

/**
 * Remove um documento
 */
export const remove = async (id: string): Promise<void> => {
  try {
    await api.delete(`/documents/${id}`);
    
    // Disparar evento de remoção
    window.dispatchEvent(new CustomEvent('documentDeleted', { 
      detail: { id }
    }));
  } catch (error) {
    console.error(`Erro ao excluir documento ${id}:`, error);
    throw error;
  }
};

/**
 * Envia um documento por e-mail
 */
export const sendByEmail = async (id: string, email: string): Promise<boolean> => {
  try {
    const response = await api.post(`/documents/${id}/email`, { email });
    return response.data.success;
  } catch (error) {
    console.error(`Erro ao enviar documento ${id} por email:`, error);
    throw error;
  }
};

/**
 * Gera um PDF para um documento
 */
export const generatePdf = async (id: string): Promise<Blob> => {
  try {
    const response = await api.get(`/documents/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error(`Erro ao gerar PDF do documento ${id}:`, error);
    throw error;
  }
};

/**
 * Marca um documento como pago
 */
export const markAsPaid = async (id: string, paymentInfo?: any): Promise<Document> => {
  try {
    const response = await api.patch(`/documents/${id}/paid`, paymentInfo || {});
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('documentUpdated', { 
      detail: { document: response.data }
    }));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao marcar documento ${id} como pago:`, error);
    throw error;
  }
};

/**
 * Cancela um documento
 */
export const cancel = async (id: string, reason: string): Promise<Document> => {
  try {
    const response = await api.post(`/documents/${id}/cancel`, { reason });
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('documentUpdated', { 
      detail: { document: response.data }
    }));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao cancelar documento ${id}:`, error);
    throw error;
  }
}; 