/**
 * Serviço para gerenciar dados do usuário no servidor
 * Este serviço permite salvar e recuperar dados vinculados ao ID do usuário logado
 */

/**
 * Função para salvar dados no servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento (ex: 'customers', 'settings')
 * @param {string} key - Chave única para o item
 * @param {object|string} data - Dados a serem salvos
 * @returns {Promise<object>} - Resposta da API
 */
export async function saveUserData(userId, store, key, data) {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    console.log(`Salvando dados para usuário ${userId} na store ${store}`);
    
    const response = await fetch(`/api/user-data?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        store,
        key,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao salvar dados no servidor');
    }

    const result = await response.json();
    console.log('Dados salvos com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    
    // Salvar no localStorage como fallback para caso offline
    try {
      const storageKey = `${userId}_${store}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        updatedAt: new Date().toISOString(),
        pendingSync: true
      }));
      console.log('Dados salvos no localStorage como fallback');
    } catch (localError) {
      console.error('Erro ao salvar no localStorage:', localError);
    }
    
    throw error;
  }
}

/**
 * Função para buscar dados do servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @returns {Promise<Array>} - Dados do usuário
 */
export async function getUserData(userId, store) {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    console.log(`Buscando dados para usuário ${userId} na store ${store}`);
    
    const response = await fetch(`/api/user-data?userId=${userId}&store=${store}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar dados do servidor');
    }

    const result = await response.json();
    console.log(`Dados recuperados para ${store}:`, result.data.length);
    return result.data;
  } catch (error) {
    console.error(`Erro ao buscar dados do usuário para ${store}:`, error);
    
    // Tentar buscar do localStorage como fallback
    try {
      const localData = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`${userId}_${store}_`)) {
          try {
            const value = JSON.parse(localStorage.getItem(key));
            const itemKey = key.replace(`${userId}_${store}_`, '');
            localData.push({
              key: itemKey,
              ...value.data,
              pendingSync: true
            });
          } catch (e) {
            console.warn(`Item inválido no localStorage: ${key}`);
          }
        }
      }
      
      console.log(`Dados recuperados do localStorage para ${store}:`, localData.length);
      return localData;
    } catch (localError) {
      console.error('Erro ao buscar do localStorage:', localError);
      return [];
    }
  }
}

/**
 * Função para remover dados do servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @param {string} key - Chave do item a ser removido
 * @returns {Promise<object>} - Resposta da API
 */
export async function removeUserData(userId, store, key) {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    console.log(`Removendo dados para usuário ${userId} da store ${store}, key ${key}`);
    
    const response = await fetch(`/api/user-data?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        store,
        key,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao remover dados do servidor');
    }

    const result = await response.json();
    console.log('Dados removidos com sucesso:', result);
    
    // Remover também do localStorage
    const storageKey = `${userId}_${store}_${key}`;
    localStorage.removeItem(storageKey);
    
    return result;
  } catch (error) {
    console.error('Erro ao remover dados do usuário:', error);
    
    // Marcar como "a ser removido" no localStorage para sincronização posterior
    try {
      const storageKey = `${userId}_${store}_${key}`;
      localStorage.setItem(`${storageKey}_delete`, JSON.stringify({
        updatedAt: new Date().toISOString(),
        pendingDelete: true
      }));
      console.log('Item marcado para remoção no localStorage');
    } catch (localError) {
      console.error('Erro ao marcar para remoção no localStorage:', localError);
    }
    
    throw error;
  }
}

/**
 * Função para sincronizar dados pendentes
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} - Resultado da sincronização
 */
export async function syncPendingData(userId) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório');
  }

  const results = {
    succeeded: 0,
    failed: 0,
    details: []
  };

  try {
    // Buscar todos os itens no localStorage que pertencem ao usuário
    const pendingSaves = [];
    const pendingDeletes = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Processar itens para salvar
      if (key.startsWith(`${userId}_`) && !key.endsWith('_delete')) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          if (value.pendingSync) {
            const [, store, itemKey] = key.split('_');
            pendingSaves.push({ key, store, itemKey, data: value.data });
          }
        } catch (e) {
          console.warn(`Item inválido no localStorage: ${key}`);
        }
      }
      
      // Processar itens para deletar
      if (key.startsWith(`${userId}_`) && key.endsWith('_delete')) {
        const originalKey = key.replace('_delete', '');
        const [, store, itemKey] = originalKey.split('_');
        pendingDeletes.push({ key, store, itemKey });
      }
    }
    
    console.log(`Sincronizando ${pendingSaves.length} itens para salvar e ${pendingDeletes.length} para remover`);
    
    // Processar exclusões
    for (const item of pendingDeletes) {
      try {
        await removeUserData(userId, item.store, item.itemKey);
        localStorage.removeItem(item.key);
        results.succeeded++;
        results.details.push({
          action: 'delete',
          store: item.store,
          key: item.itemKey,
          success: true
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          action: 'delete',
          store: item.store,
          key: item.itemKey,
          success: false,
          error: error.message
        });
      }
    }
    
    // Processar salvamentos
    for (const item of pendingSaves) {
      try {
        await saveUserData(userId, item.store, item.itemKey, item.data);
        
        // Atualizar o localStorage para remover flag de pendingSync
        const value = JSON.parse(localStorage.getItem(item.key));
        value.pendingSync = false;
        localStorage.setItem(item.key, JSON.stringify(value));
        
        results.succeeded++;
        results.details.push({
          action: 'save',
          store: item.store,
          key: item.itemKey,
          success: true
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          action: 'save',
          store: item.store,
          key: item.itemKey,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      ...results
    };
  } catch (error) {
    console.error('Erro durante sincronização:', error);
    return {
      success: false,
      error: error.message,
      ...results
    };
  }
} 