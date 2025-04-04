/**
 * Serviço para gerenciar dados do usuário no servidor
 * Este serviço permite salvar e recuperar dados vinculados ao ID do usuário logado
 * Versão 100% online: Sem armazenamento local, todos os dados são sincronizados em tempo real
 */

import realtimeService from './realtimeService';

export interface SyncResult {
  success: boolean;
  message?: string;
  syncedItems?: number;
  errors?: Array<{ key: string; error: string }>;
}

/**
 * Função para salvar dados no servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento (ex: 'customers', 'settings')
 * @param {string} key - Chave única para o item
 * @param {object|string} data - Dados a serem salvos
 * @returns {Promise<object>} - Resposta da API
 */
export async function saveUserData(
  userId: string, 
  store: string, 
  key: string, 
  data: any
): Promise<any> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Validar store e key
    if (!store || typeof store !== 'string') {
      throw new Error('Nome do armazenamento (store) é obrigatório e deve ser uma string');
    }

    if (!key || typeof key !== 'string') {
      throw new Error('Chave (key) é obrigatória e deve ser uma string');
    }

    if (data === undefined || data === null) {
      throw new Error('Dados não podem ser null ou undefined');
    }

    console.log(`[UserData] Salvando dados para usuário ${userId} na store ${store}, key ${key}`);
    
    // Verificar se estamos online - se não, informar o usuário que não é possível salvar
    if (!navigator.onLine) {
      console.error('[UserData] Dispositivo offline. Não é possível salvar dados.');
      throw new Error('Dispositivo offline. Verifique sua conexão e tente novamente.');
    }
    
    // Enviar para o servidor usando a API REST
    const response = await fetch(`/api/user-data/${userId}/${store}/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify({ data }),
    });

    // Verificar erro HTTP
    if (!response.ok) {
      // Tentar obter detalhes do erro
      let errorMessage = 'Erro ao salvar dados no servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Se não conseguir parse do JSON, usar mensagem genérica
      }
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    const result = await response.json();
    console.log('[UserData] Dados salvos com sucesso no servidor:', result);
    
    // Notificar outros usuários sobre a atualização via WebSocket
    realtimeService.emit('data:updated', {
      entityType: store,
      entityId: key,
      data: data,
      userId: userId
    });
    
    return result;
  } catch (error: any) {
    console.error('[UserData] Erro ao salvar dados do usuário:', error);
    
    // Notificar a UI sobre o erro
    window.dispatchEvent(new CustomEvent('userdata:error', { 
      detail: { 
        message: error.message,
        operation: 'save',
        store,
        key
      } 
    }));
    
    throw error;
  }
}

/**
 * Função para buscar dados do servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @returns {Promise<Array>} - Dados do usuário
 */
export async function getUserData(userId: string, store: string): Promise<any[]> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Validar store
    if (!store || typeof store !== 'string') {
      throw new Error('Nome do armazenamento (store) é obrigatório e deve ser uma string');
    }

    console.log(`[UserData] Buscando dados para usuário ${userId} na store ${store}`);
    
    // Verificar se estamos online
    if (!navigator.onLine) {
      console.error('[UserData] Dispositivo offline. Não é possível buscar dados.');
      throw new Error('Dispositivo offline. Verifique sua conexão e tente novamente.');
    }
    
    // Buscar dados do servidor
    const response = await fetch(`/api/user-data/${userId}/${store}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken') || ''}`
      },
      // Definir timeout para evitar bloqueio
      signal: AbortSignal.timeout(10000) // 10 segundos de timeout
    });
    
    if (!response.ok) {
      // Tentar obter detalhes do erro
      let errorMessage = 'Erro ao buscar dados do servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Se não conseguir parse do JSON, usar mensagem genérica
      }
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }
    
    const result = await response.json();
    
    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Formato de resposta inválido do servidor');
    }
    
    console.log(`[UserData] ${result.data.length} itens recuperados do servidor para ${store}`);
    
    // Subscrever para atualizações em tempo real via WebSocket
    subscribeToRealTimeUpdates(userId, store);
    
    return result.data;
  } catch (error: any) {
    console.error(`[UserData] Erro ao buscar dados do usuário para ${store}:`, error);
    
    // Notificar a UI sobre o erro
    window.dispatchEvent(new CustomEvent('userdata:error', { 
      detail: { 
        message: error.message,
        operation: 'get',
        store
      } 
    }));
    
    throw error;
  }
}

/**
 * Função para remover dados do servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @param {string} key - Chave única para o item
 * @returns {Promise<object>} - Resposta da API
 */
export async function removeUserData(userId: string, store: string, key: string): Promise<any> {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Validar store e key
    if (!store || typeof store !== 'string') {
      throw new Error('Nome do armazenamento (store) é obrigatório e deve ser uma string');
    }

    if (!key || typeof key !== 'string') {
      throw new Error('Chave (key) é obrigatória e deve ser uma string');
    }

    console.log(`[UserData] Removendo dados do usuário ${userId} na store ${store}, key ${key}`);
    
    // Verificar se estamos online
    if (!navigator.onLine) {
      console.error('[UserData] Dispositivo offline. Não é possível remover dados.');
      throw new Error('Dispositivo offline. Verifique sua conexão e tente novamente.');
    }
    
    // Enviar requisição para o servidor
    const response = await fetch(`/api/user-data/${userId}/${store}/${key}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken') || ''}`
      }
    });

    // Verificar erro HTTP
    if (!response.ok) {
      // Tentar obter detalhes do erro
      let errorMessage = 'Erro ao remover dados do servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Se não conseguir parse do JSON, usar mensagem genérica
      }
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    const result = await response.json();
    console.log('[UserData] Dados removidos com sucesso do servidor:', result);
    
    // Notificar outros usuários sobre a remoção via WebSocket
    realtimeService.emit('data:deleted', {
      entityType: store,
      entityId: key,
      userId: userId
    });
    
    return result;
  } catch (error: any) {
    console.error('[UserData] Erro ao remover dados do usuário:', error);
    
    // Notificar a UI sobre o erro
    window.dispatchEvent(new CustomEvent('userdata:error', { 
      detail: { 
        message: error.message,
        operation: 'remove',
        store,
        key
      } 
    }));
    
    throw error;
  }
}

/**
 * Se inscreve para receber atualizações em tempo real via WebSocket
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 */
function subscribeToRealTimeUpdates(userId: string, store: string) {
  // Inscrever para eventos de atualização
  realtimeService.on(`${store}:updated`, (data) => {
    console.log(`[UserData] Atualização em tempo real recebida para ${store}:`, data);
    
    // Notificar a UI sobre a atualização
    window.dispatchEvent(new CustomEvent('userdata:updated', {
      detail: {
        store,
        entityId: data.entityId,
        data: data.data,
        updatedBy: data.updatedBy
      }
    }));
  });
  
  // Inscrever para eventos de criação
  realtimeService.on(`${store}:created`, (data) => {
    console.log(`[UserData] Novo item criado para ${store}:`, data);
    
    // Notificar a UI sobre o novo item
    window.dispatchEvent(new CustomEvent('userdata:created', {
      detail: {
        store,
        entityId: data.entityId,
        data: data.data,
        createdBy: data.createdBy
      }
    }));
  });
  
  // Inscrever para eventos de remoção
  realtimeService.on(`${store}:deleted`, (data) => {
    console.log(`[UserData] Item removido de ${store}:`, data);
    
    // Notificar a UI sobre a remoção
    window.dispatchEvent(new CustomEvent('userdata:deleted', {
      detail: {
        store,
        entityId: data.entityId,
        deletedBy: data.deletedBy
      }
    }));
  });
}

export default {
  saveUserData,
  getUserData,
  removeUserData
};