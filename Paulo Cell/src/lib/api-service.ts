/**
 * API Service - Serviço de comunicação com o backend
 * Este arquivo contém funções para comunicação com a API do servidor,
 * permitindo a persistência de dados no banco de dados MySQL.
 */

// URL base da API
const API_URL = '/api';

/**
 * Função para realizar requisições HTTP para a API
 */
async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
  try {
    const url = `${API_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Para enviar cookies com a requisição
    };

    // Adicionar corpo da requisição para métodos POST, PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    // Verificar se a resposta é OK (status 2xx)
    if (!response.ok) {
      // Tentar obter mensagem de erro do servidor
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Erro ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Se a resposta for vazia (por exemplo, para DELETE)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição API:', error);
    throw error;
  }
}

/**
 * Funções para gerenciamento de clientes
 */
export const CustomerAPI = {
  // Obter todos os clientes
  async getAll() {
    return await apiRequest('/customers');
  },

  // Obter cliente por ID
  async getById(id: string) {
    return await apiRequest(`/customers/${id}`);
  },

  // Criar novo cliente
  async create(customer: any) {
    return await apiRequest('/customers', 'POST', customer);
  },

  // Atualizar cliente existente
  async update(id: string, customer: any) {
    return await apiRequest(`/customers/${id}`, 'PUT', customer);
  },

  // Excluir cliente
  async delete(id: string) {
    return await apiRequest(`/customers/${id}`, 'DELETE');
  },

  // Buscar clientes por termo
  async search(term: string) {
    return await apiRequest(`/customers/search/${term}`);
  },
  
  // Mover cliente para lixeira (soft delete)
  async moveToTrash(id: string) {
    return await apiRequest(`/customers/${id}/trash`, 'PUT');
  },
  
  // Restaurar cliente da lixeira
  async restore(id: string) {
    return await apiRequest(`/customers/${id}/restore`, 'PUT');
  },
  
  // Excluir cliente permanentemente
  async deletePermanently(id: string) {
    return await apiRequest(`/customers/${id}/permanent`, 'DELETE');
  }
};

/**
 * Funções para gerenciamento de dispositivos
 */
export const DeviceAPI = {
  // Obter todos os dispositivos
  async getAll() {
    return await apiRequest('/devices');
  },

  // Obter dispositivo por ID
  async getById(id: string) {
    return await apiRequest(`/devices/${id}`);
  },

  // Obter dispositivos por proprietário (cliente)
  async getByOwner(ownerId: string) {
    return await apiRequest(`/devices/owner/${ownerId}`);
  },

  // Criar novo dispositivo
  async create(device: any) {
    return await apiRequest('/devices', 'POST', device);
  },

  // Atualizar dispositivo existente
  async update(id: string, device: any) {
    return await apiRequest(`/devices/${id}`, 'PUT', device);
  },

  // Excluir dispositivo
  async delete(id: string) {
    return await apiRequest(`/devices/${id}`, 'DELETE');
  },
  
  // Mover dispositivo para lixeira (soft delete)
  async moveToTrash(id: string) {
    return await apiRequest(`/devices/${id}/trash`, 'PUT');
  },
  
  // Restaurar dispositivo da lixeira
  async restore(id: string) {
    return await apiRequest(`/devices/${id}/restore`, 'PUT');
  },
  
  // Excluir dispositivo permanentemente
  async deletePermanently(id: string) {
    return await apiRequest(`/devices/${id}/permanent`, 'DELETE');
  }
};

/**
 * Funções para gerenciamento de serviços
 */
export const ServiceAPI = {
  // Obter todos os serviços
  async getAll() {
    return await apiRequest('/services');
  },

  // Obter serviço por ID
  async getById(id: string) {
    return await apiRequest(`/services/${id}`);
  },

  // Obter serviços por cliente
  async getByCustomer(customerId: string) {
    return await apiRequest(`/services/customer/${customerId}`);
  },

  // Obter serviços por dispositivo
  async getByDevice(deviceId: string) {
    return await apiRequest(`/services/device/${deviceId}`);
  },

  // Criar novo serviço
  async create(service: any) {
    return await apiRequest('/services', 'POST', service);
  },

  // Atualizar serviço existente
  async update(id: string, service: any) {
    return await apiRequest(`/services/${id}`, 'PUT', service);
  },

  // Excluir serviço
  async delete(id: string) {
    return await apiRequest(`/services/${id}`, 'DELETE');
  },
  
  // Mover serviço para lixeira (soft delete)
  async moveToTrash(id: string) {
    return await apiRequest(`/services/${id}/trash`, 'PUT');
  },
  
  // Restaurar serviço da lixeira
  async restore(id: string) {
    return await apiRequest(`/services/${id}/restore`, 'PUT');
  },
  
  // Excluir serviço permanentemente
  async deletePermanently(id: string) {
    return await apiRequest(`/services/${id}/permanent`, 'DELETE');
  }
};

/**
 * Funções para gerenciamento de inventário
 */
export const InventoryAPI = {
  // Obter todos os itens do inventário
  async getAll() {
    return await apiRequest('/inventory');
  },

  // Obter item do inventário por ID
  async getById(id: string) {
    return await apiRequest(`/inventory/${id}`);
  },

  // Buscar itens do inventário por termo
  async search(term: string) {
    return await apiRequest(`/inventory/search/${term}`);
  },

  // Criar novo item no inventário
  async create(item: any) {
    return await apiRequest('/inventory', 'POST', item);
  },

  // Atualizar item existente no inventário
  async update(id: string, item: any) {
    return await apiRequest(`/inventory/${id}`, 'PUT', item);
  },

  // Excluir item do inventário
  async delete(id: string) {
    return await apiRequest(`/inventory/${id}`, 'DELETE');
  }
};

/**
 * Funções para gerenciamento de configurações
 */
export const SettingsAPI = {
  // Obter configurações da empresa
  async getCompanySettings() {
    return await apiRequest('/settings/company');
  },

  // Atualizar configurações da empresa
  async updateCompanySettings(settings: any) {
    return await apiRequest('/settings/company', 'PUT', settings);
  },

  // Obter configurações de notificações
  async getNotificationSettings() {
    return await apiRequest('/settings/notifications');
  },

  // Atualizar configurações de notificações
  async updateNotificationSettings(settings: any) {
    return await apiRequest('/settings/notifications', 'PUT', settings);
  },

  // Obter configurações da API de notas fiscais
  async getInvoiceApiSettings() {
    return await apiRequest('/settings/invoice-api');
  },

  // Atualizar configurações da API de notas fiscais
  async updateInvoiceApiSettings(settings: any) {
    return await apiRequest('/settings/invoice-api', 'PUT', settings);
  }
};

/**
 * Funções para gerenciamento de documentos fiscais
 */
export const DocumentAPI = {
  // Obter todos os documentos
  async getAll() {
    return await apiRequest('/documents');
  },

  // Obter documento por ID
  async getById(id: string) {
    return await apiRequest(`/documents/${id}`);
  },

  // Obter documentos por cliente
  async getByCustomer(customerId: string) {
    return await apiRequest(`/documents/customer/${customerId}`);
  },

  // Criar novo documento
  async create(document: any) {
    return await apiRequest('/documents', 'POST', document);
  },

  // Atualizar documento existente
  async update(id: string, document: any) {
    return await apiRequest(`/documents/${id}`, 'PUT', document);
  },

  // Excluir documento
  async delete(id: string) {
    return await apiRequest(`/documents/${id}`, 'DELETE');
  },
  
  // Emitir documento fiscal
  async issue(id: string) {
    return await apiRequest(`/documents/${id}/issue`, 'POST');
  },
  
  // Cancelar documento fiscal
  async cancel(id: string, reason: string) {
    return await apiRequest(`/documents/${id}/cancel`, 'POST', { reason });
  },
  
  // Mover documento para lixeira (soft delete)
  async moveToTrash(id: string) {
    return await apiRequest(`/documents/${id}/trash`, 'PUT');
  },
  
  // Restaurar documento da lixeira
  async restore(id: string) {
    return await apiRequest(`/documents/${id}/restore`, 'PUT');
  },
  
  // Excluir documento permanentemente
  async deletePermanently(id: string) {
    return await apiRequest(`/documents/${id}/permanent`, 'DELETE');
  },
  
  // Obter configurações da API de notas fiscais
  async getInvoiceApiSettings() {
    try {
      return await apiRequest('/settings/invoice-api');
    } catch (error) {
      console.error('Erro ao obter configurações da API de notas fiscais:', error);
      // Em caso de erro, tentar obter do SettingsAPI
      return await SettingsAPI.getInvoiceApiSettings();
    }
  }
};

/**
 * Funções para sincronização de dados com o banco de dados
 */
export const SyncAPI = {
  // Sincronizar dados do cliente para o servidor
  async syncToServer(data: any) {
    return await apiRequest('/sync', 'POST', data);
  },
  
  // Sincronizar todos os dados
  async syncAll() {
    try {
      // Realizar a sincronização completa
      const response = await apiRequest('/sync/all', 'POST');
      return response;
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      throw error;
    }
  },
  
  // Buscar dados atualizados do servidor
  async fetchFromServer() {
    try {
      // Obter dados diretamente da API para cada entidade
      const response = await apiRequest('/sync/fetch', 'GET');
      
      // Verificar se a resposta contém dados atualizados
      if (response?.data) {
        console.log('Dados atualizados recebidos do servidor');
        // Os dados serão usados diretamente pelos componentes via API
      }
      
      return response;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  },
  
  // Resetar todas as estatísticas no servidor
  async resetAllStatistics() {
    return await apiRequest('/statistics/reset-all', 'POST');
  },
  
  // Resetar apenas estatísticas visuais no servidor
  async resetVisualStatistics() {
    return await apiRequest('/statistics/reset-visual', 'POST');
  },
  
  // Obter todos os itens da lixeira
  async getTrashItems() {
    return await apiRequest('/trash', 'GET');
  },
  
  // Limpar itens expirados da lixeira (mais de 60 dias)
  async cleanupExpiredTrash() {
    return await apiRequest('/trash/cleanup', 'POST');
  }
};

export default {
  Customer: CustomerAPI,
  Device: DeviceAPI,
  Service: ServiceAPI,
  Inventory: InventoryAPI,
  Settings: SettingsAPI,
  Document: DocumentAPI,
  Sync: SyncAPI
}; 