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
    
    // Verificar se estamos online - se não, salvar localmente com flag de pendente
    if (!navigator.onLine) {
      console.warn('[UserData] Dispositivo offline. Salvando apenas localmente.');
      // Salvar no localStorage como pendente para sincronização
      const storageKey = `${userId}_${store}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        updatedAt: new Date().toISOString(),
        pendingSync: true
      }));
      
      return { 
        success: true, 
        id: key, 
        fromLocalStorage: true,
        needsSync: true,
        message: 'Salvo localmente. Será sincronizado quando online.' 
      };
    }
    
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
    
    // Salvar uma cópia local para acesso offline também
    try {
      const storageKey = `${userId}_${store}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        updatedAt: new Date().toISOString(),
        pendingSync: false, // Não está pendente, pois foi salvo com sucesso
        id: result.id // Armazenar o ID do registro para futuras atualizações
      }));
      console.log('[UserData] Cópia local dos dados atualizada');
    } catch (localError) {
      console.warn('[UserData] Não foi possível salvar cópia local:', localError);
      // Não lançar erro, pois os dados foram salvos com sucesso no servidor
    }
    
    return result;
  } catch (error) {
    console.error('[UserData] Erro ao salvar dados do usuário:', error);
    
    // Salvar no localStorage como fallback para caso offline
    try {
      const storageKey = `${userId}_${store}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        updatedAt: new Date().toISOString(),
        pendingSync: true,
        error: error.message
      }));
      console.log('[UserData] Dados salvos no localStorage como fallback (pendentes para sincronização)');
    } catch (localError) {
      console.error('[UserData] Erro crítico: Falha ao salvar no servidor E no localStorage:', localError);
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

    // Validar store
    if (!store || typeof store !== 'string') {
      throw new Error('Nome do armazenamento (store) é obrigatório e deve ser uma string');
    }

    console.log(`[UserData] Buscando dados para usuário ${userId} na store ${store}`);
    
    // Diagnóstico
    console.log(`[DIAGNÓSTICO] Tentando buscar dados para userId=${userId}, store=${store}`);
    
    // Verificar se a API está acessível
    try {
      const pingResponse = await fetch('/api/ping', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      console.log(`[DIAGNÓSTICO] API acessível: ${pingResponse.ok ? 'SIM' : 'NÃO'}`);
      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        console.log(`[DIAGNÓSTICO] Status do banco: ${pingData.database}`);
      }
    } catch (pingError) {
      console.warn(`[DIAGNÓSTICO] API não acessível: ${pingError.message}`);
    }
    
    // Tentar buscar dados do servidor sempre primeiro, a menos que estejamos offline
    const serverPromise = fetch(`/api/user-data?userId=${userId}&store=${store}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Definir timeout para evitar bloqueio
      signal: AbortSignal.timeout(10000) // 10 segundos de timeout
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar dados do servidor');
      }
      return response.json();
    });
    
    // Se estivermos offline, usar apenas dados locais
    if (!navigator.onLine) {
      console.warn('[UserData] Dispositivo offline, usando apenas dados locais');
      const localData = getLocalData(userId, store);
      return localData;
    }
    
    // Buscar dados do localStorage enquanto aguarda o servidor
    const localData = getLocalData(userId, store);
    
    // Tentar obter dados do servidor primeiro
    try {
      const result = await serverPromise;
      
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Formato de resposta inválido do servidor');
      }
      
      console.log(`[UserData] ${result.data.length} itens recuperados do servidor para ${store}`);
      
      // Atualizar localStorage com os dados mais recentes do servidor
      updateLocalCache(userId, store, result.data);
      
      return result.data;
    } catch (serverError) {
      console.warn(`[UserData] Falha ao buscar dados do servidor: ${serverError.message}. Usando dados locais.`);
      
      // Se o servidor falhar, usar os dados locais
      console.log(`[UserData] ${localData.length} itens recuperados do localStorage para ${store}`);
      return localData;
    }
  } catch (error) {
    console.error(`[UserData] Erro ao buscar dados do usuário para ${store}:`, error);
    
    // Em caso de erro geral, tentar retornar dados locais
    try {
      const localData = getLocalData(userId, store);
      console.log(`[UserData] Fallback: ${localData.length} itens recuperados do localStorage para ${store}`);
      return localData;
    } catch (localError) {
      console.error('[UserData] Erro crítico: Falha ao buscar do servidor E do localStorage:', localError);
      return [];
    }
  }
}

/**
 * Função auxiliar para buscar dados do localStorage
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @returns {Array} - Dados locais
 */
function getLocalData(userId, store) {
  try {
    const localData = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${userId}_${store}_`) && !key.endsWith('_delete')) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          const itemKey = key.replace(`${userId}_${store}_`, '');
          
          if (value && value.data) {
            localData.push({
              id: value.id || itemKey, // Usar ID do servidor se disponível
              key: itemKey,
              ...(typeof value.data === 'object' ? value.data : { data: value.data }),
              pendingSync: value.pendingSync === true,
              _localUpdatedAt: value.updatedAt
            });
          }
        } catch (e) {
          console.warn(`[UserData] Item inválido no localStorage: ${key}`);
        }
      }
    }
    return localData;
  } catch (error) {
    console.error('[UserData] Erro ao ler dados do localStorage:', error);
    return [];
  }
}

/**
 * Função auxiliar para atualizar o cache local com dados do servidor
 * @param {string} userId - ID do usuário
 * @param {string} store - Nome do armazenamento
 * @param {Array} serverData - Dados do servidor
 */
function updateLocalCache(userId, store, serverData) {
  try {
    // Para cada item do servidor, atualizar o localStorage
    serverData.forEach(item => {
      if (item && item.key) {
        const storageKey = `${userId}_${store}_${item.key}`;
        
        // Buscar item atual do localStorage
        let currentItem = null;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            currentItem = JSON.parse(stored);
          }
        } catch (e) {
          // Ignorar se não conseguir ler
        }
        
        // Se tiver mudanças pendentes locais, não sobrescrever
        if (currentItem && currentItem.pendingSync) {
          console.log(`[UserData] Item ${item.key} tem alterações pendentes locais, não atualizando do servidor`);
          return;
        }
        
        // Extrair os dados do item sem os metadados
        const { id, key, pendingSync, _localUpdatedAt, ...data } = item;
        
        // Salvar no localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          id: item.id,
          updatedAt: new Date().toISOString(),
          pendingSync: false
        }));
      }
    });
    
    console.log('[UserData] Cache local atualizado com dados do servidor');
  } catch (error) {
    console.warn('[UserData] Erro ao atualizar cache local:', error);
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

    if (!store || !key) {
      throw new Error('Store e key são obrigatórios');
    }

    console.log(`[UserData] Removendo dados para usuário ${userId} da store ${store}, key ${key}`);
    
    // Se estiver offline, apenas marcar como pendente para exclusão
    if (!navigator.onLine) {
      const storageKey = `${userId}_${store}_${key}`;
      
      // Remover o item original do localStorage para evitar uso acidental
      localStorage.removeItem(storageKey);
      
      // Marcar como pendente para exclusão
      localStorage.setItem(`${storageKey}_delete`, JSON.stringify({
        updatedAt: new Date().toISOString(),
        pendingDelete: true
      }));
      
      return { 
        success: true, 
        fromLocalStorage: true,
        needsSync: true,
        message: 'Marcado para exclusão quando online.' 
      };
    }
    
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
    
    // Remover também do localStorage
    const storageKey = `${userId}_${store}_${key}`;
    localStorage.removeItem(storageKey);
    // Remover qualquer marcação de exclusão pendente
    localStorage.removeItem(`${storageKey}_delete`);
    
    return result;
  } catch (error) {
    console.error('[UserData] Erro ao remover dados do usuário:', error);
    
    // Marcar como "a ser removido" no localStorage para sincronização posterior
    try {
      const storageKey = `${userId}_${store}_${key}`;
      
      // Remover o item original do localStorage para evitar uso acidental
      localStorage.removeItem(storageKey);
      
      // Marcar como pendente para exclusão
      localStorage.setItem(`${storageKey}_delete`, JSON.stringify({
        updatedAt: new Date().toISOString(),
        pendingDelete: true
      }));
      console.log('[UserData] Item marcado para remoção no localStorage em sincronização futura');
    } catch (localError) {
      console.error('[UserData] Erro ao marcar para remoção no localStorage:', localError);
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

  // Verificar se está online
  if (!navigator.onLine) {
    return {
      success: false,
      message: 'Dispositivo offline. Sincronização não é possível.',
      results
    };
  }

  try {
    console.log(`[UserData] Iniciando sincronização para usuário ${userId}`);
    
    // Verificar se a API está acessível antes de tentar sincronizar
    try {
      const pingResponse = await fetch('/api/ping', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (!pingResponse.ok) {
        throw new Error('API não está respondendo');
      }
      const pingData = await pingResponse.json();
      if (pingData.database !== 'connected') {
        throw new Error(`Problema com o banco de dados: ${pingData.database}`);
      }
      console.log('[UserData] API e banco de dados estão operacionais');
    } catch (pingError) {
      console.error('[UserData] Falha na verificação do servidor:', pingError);
      return {
        success: false,
        message: `Servidor indisponível: ${pingError.message}`,
        error: pingError.message,
        results
      };
    }
    
    // Buscar todos os itens no localStorage que pertencem ao usuário
    const pendingSaves = [];
    const pendingDeletes = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Processar itens para salvar
      if (key && key.startsWith(`${userId}_`) && !key.endsWith('_delete')) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          if (value && value.pendingSync === true) {
            const parts = key.split('_');
            if (parts.length >= 3) {
              const store = parts[1];
              const itemKey = parts.slice(2).join('_'); // Reconstruir a chave se tiver underscores
              pendingSaves.push({ key, store, itemKey, data: value.data });
            }
          }
        } catch (e) {
          console.warn(`[UserData] Item inválido no localStorage: ${key}`, e);
        }
      }
      
      // Processar itens para deletar
      if (key && key.startsWith(`${userId}_`) && key.endsWith('_delete')) {
        const originalKey = key.replace('_delete', '');
        const parts = originalKey.split('_');
        if (parts.length >= 3) {
          const store = parts[1];
          const itemKey = parts.slice(2).join('_'); // Reconstruir a chave se tiver underscores
          pendingDeletes.push({ key, store, itemKey });
        }
      }
    }
    
    console.log(`[UserData] Sincronizando ${pendingSaves.length} itens para salvar e ${pendingDeletes.length} para remover`);
    
    if (pendingSaves.length === 0 && pendingDeletes.length === 0) {
      return {
        success: true,
        message: 'Não há dados pendentes para sincronização',
        results
      };
    }
    
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
        value.updatedAt = new Date().toISOString();
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
    
    // Buscar dados atualizados do servidor após sincronização
    try {
      // Identificar todas as stores únicas que foram modificadas
      const uniqueStores = [...new Set([
        ...pendingSaves.map(item => item.store),
        ...pendingDeletes.map(item => item.store)
      ])];
      
      // Buscar dados atualizados de cada store
      for (const store of uniqueStores) {
        await getUserData(userId, store);
      }
    } catch (error) {
      console.warn('[UserData] Erro ao atualizar dados após sincronização:', error);
    }
    
    return {
      success: results.failed === 0,
      message: results.failed === 0 
        ? 'Sincronização concluída com sucesso' 
        : `Sincronização parcial: ${results.succeeded} sucessos, ${results.failed} falhas`,
      ...results
    };
  } catch (error) {
    console.error('[UserData] Erro durante sincronização:', error);
    return {
      success: false,
      message: `Erro durante sincronização: ${error.message}`,
      error: error.message,
      ...results
    };
  }
}

/**
 * Limpa o cache local para um usuário específico
 * Útil após login para garantir dados frescos
 * @param {string} userId - ID do usuário 
 */
export function clearLocalStorageCache(userId) {
  if (!userId) return;
  
  console.log(`[UserData] Limpando cache local antigo para usuário ${userId}`);
  
  try {
    // Limpar apenas dados antigos (não pendentes) deste usuário
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${userId}_`) && !key.endsWith('_delete')) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          if (!value?.pendingSync) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Se não conseguir ler, incluir para remoção
          keysToRemove.push(key);
        }
      }
    }
    
    // Remover as chaves em um loop separado para evitar problemas de índice
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`[UserData] Removidos ${keysToRemove.length} itens antigos do cache local`);
  } catch (error) {
    console.warn('[UserData] Erro ao limpar cache local:', error);
  }
} 