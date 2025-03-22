import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  saveUserData, 
  getUserData,
  removeUserData,
  syncPendingData
} from '../services/userDataService';
import { useToast } from '../hooks/useToast';
import { toast } from 'react-toastify';

/**
 * Hook para gerenciar dados persistentes no servidor 
 * vinculados ao ID do usuário atual
 * 
 * @param {string} store - Nome do armazenamento (ex: 'customers', 'configurations')
 * @param {boolean} autoLoad - Se deve carregar automaticamente os dados ao montar
 * @returns {Object} - Métodos e estado para manipular os dados
 */
export function useServerData(store, autoLoad = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const { showToast } = useToast();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const userId = user?.id;
  
  /**
   * Função para carregar dados do servidor com ALTA prioridade
   * SEMPRE tenta buscar do servidor primeiro, mesmo offline
   * Usa localStorage apenas como último recurso
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      console.warn('[useServerData] Tentativa de carregar dados sem usuário autenticado');
      setError(new Error('Usuário não autenticado'));
      setLoading(false);
      return [];
    }
    
    if (!store) {
      console.warn('[useServerData] Nome do armazenamento (store) não informado');
      setError(new Error('Nome do armazenamento é obrigatório'));
      setLoading(false);
      return [];
    }
    
    console.log(`[useServerData] Carregando dados da store '${store}' para usuário ${userId}${forceRefresh ? ' (forçando atualização)' : ''}`);
    setLoading(true);
    setError(null);
    
    try {
      // DADOS DO SERVIDOR: Nossa fonte primária de verdade
      // Se estivermos ONLINE, sempre tentamos buscar do servidor primeiro
      if (navigator.onLine) {
        try {
          console.log('[useServerData] Tentando buscar dados do servidor (fonte primária)');
          
          // Chamar API diretamente sem usar o serviço para maior controle
          const response = await fetch(`/api/user-data?userId=${userId}&store=${store}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // Timeout menor para evitar bloqueios
            signal: AbortSignal.timeout(8000)
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
              console.log(`[useServerData] ✅ Sucesso: ${result.data.length} itens recebidos do servidor`);
              
              // Atualizar o estado com dados do servidor
              setData(result.data);
              setLastSync(new Date());
              setLoading(false);
              
              // MUITO IMPORTANTE: Atualizar o cache local com os dados do servidor
              // para garantir consistência
              try {
                console.log('[useServerData] Atualizando cache local com dados do servidor');
                updateLocalCache(userId, store, result.data);
              } catch (cacheError) {
                console.warn('[useServerData] Erro ao atualizar cache local:', cacheError);
              }
              
              return result.data;
            } else {
              console.warn('[useServerData] Resposta inválida do servidor:', result);
              throw new Error('Formato de resposta inválido do servidor');
            }
          } else {
            console.error(`[useServerData] Erro HTTP ${response.status} ao buscar dados do servidor`);
            throw new Error(`Erro ao buscar dados do servidor: HTTP ${response.status}`);
          }
        } catch (serverError) {
          console.error('[useServerData] Falha ao buscar dados do servidor:', serverError);
          
          // Apenas notificar o usuário, mas continuar para fallback
          toast.warning(`Erro ao buscar dados do servidor: ${serverError.message}. Tentando alternativas...`, {
            autoClose: 3000
          });
          
          // Não retornar aqui - continuar para o fallback do localStorage
        }
      } else {
        console.log('[useServerData] Dispositivo offline, pulando tentativa direta no servidor');
      }
      
      // DADOS DO SERVIÇO: Nossa segunda tentativa (útil porque ele já implementa fallback)
      try {
        console.log('[useServerData] Tentando buscar dados via serviço');
        const serviceData = await getUserData(userId, store);
        console.log(`[useServerData] ✅ Dados recuperados via serviço: ${serviceData.length} itens`);
        
        setData(serviceData);
        setLastSync(new Date());
        setLoading(false);
        
        if (serviceData.length > 0) {
          return serviceData;
        } else {
          console.warn('[useServerData] Nenhum dado recuperado via serviço');
        }
      } catch (serviceError) {
        console.error('[useServerData] Falha ao buscar dados via serviço:', serviceError);
        // Continuar para o fallback do localStorage
      }
      
      // DADOS LOCAIS: Último recurso (apenas se tudo falhar)
      try {
        console.log('[useServerData] Última tentativa: buscar dados locais');
        const localData = getLocalData(userId, store);
        console.log(`[useServerData] ⚠️ Usando ${localData.length} itens do localStorage como último recurso`);
        
        setData(localData);
        setLoading(false);
        
        // Avisar o usuário que estamos usando dados potencialmente desatualizados
        if (localData.length > 0) {
          toast.info('Usando dados salvos localmente. Eles podem não estar atualizados.', {
            autoClose: 4000
          });
        } else {
          toast.warning('Não foi possível recuperar seus dados do servidor nem localmente.');
        }
        
        return localData;
      } catch (localError) {
        console.error('[useServerData] Falha completa! Nem dados locais disponíveis:', localError);
        setData([]);
        setError(new Error(`Falha total ao recuperar dados: ${localError.message}`));
        setLoading(false);
        
        toast.error('Erro crítico: Não foi possível recuperar seus dados.');
        return [];
      }
    } catch (error) {
      console.error(`[useServerData] Erro ao carregar dados para ${store}:`, error);
      setError(error);
      setLoading(false);
      
      // Retornar array vazio em caso de falha
      setData([]);
      return [];
    }
  }, [userId, store, showToast]);
  
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
            console.warn(`[useServerData] Item inválido no localStorage: ${key}`);
          }
        }
      }
      return localData;
    } catch (error) {
      console.error('[useServerData] Erro ao ler dados do localStorage:', error);
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
            console.log(`[useServerData] Item ${item.key} tem alterações pendentes locais, não atualizando do servidor`);
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
      
      console.log('[useServerData] Cache local atualizado com dados do servidor');
    } catch (error) {
      console.warn('[useServerData] Erro ao atualizar cache local:', error);
    }
  }
  
  /**
   * Função para salvar um item no servidor
   * @param {string} key - Chave única para o item
   * @param {object} itemData - Dados a serem salvos
   * @returns {Promise<object>} - Objeto com resultado da operação
   */
  const saveItem = useCallback(async (key, itemData) => {
    if (!userId) {
      const error = new Error('Usuário não autenticado');
      console.error('[useServerData]', error);
      toast.error('Você precisa estar logado para salvar dados');
      return { success: false, error };
    }
    
    if (!key) {
      const error = new Error('Chave do item é obrigatória');
      console.error('[useServerData]', error);
      toast.error('Erro: Identificador do item é obrigatório');
      return { success: false, error };
    }
    
    if (itemData === undefined || itemData === null) {
      const error = new Error('Dados do item não podem ser vazios');
      console.error('[useServerData]', error);
      toast.error('Erro: Os dados não podem estar vazios');
      return { success: false, error };
    }
    
    try {
      console.log(`[useServerData] Salvando item '${key}' na store '${store}'`);
      setLoading(true);
      
      const result = await saveUserData(userId, store, key, itemData);
      
      // Resultado do salvamento - verificar se foi offline
      if (result.fromLocalStorage) {
        console.log('[useServerData] Item salvo apenas localmente (offline)');
        toast.info('Você está offline. Os dados serão enviados ao servidor quando a conexão for restabelecida.');
      } else {
        console.log('[useServerData] Item salvo com sucesso no servidor');
      }
      
      // Atualizar o estado local com o novo item
      setData(prevData => {
        // Verificar se o item já existe
        const existingIndex = prevData.findIndex(item => item.key === key);
        
        if (existingIndex >= 0) {
          // Atualizar item existente
          const newData = [...prevData];
          newData[existingIndex] = {
            ...itemData,
            key,
            id: result.id || prevData[existingIndex].id,
            pendingSync: result.needsSync === true
          };
          return newData;
        } else {
          // Adicionar novo item
          return [...prevData, {
            ...itemData,
            key,
            id: result.id,
            pendingSync: result.needsSync === true
          }];
        }
      });
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      setLoading(false);
      
      return { success: true, id: result.id, offline: result.fromLocalStorage };
    } catch (err) {
      console.error(`[useServerData] Erro ao salvar item '${key}':`, err);
      setLoading(false);
      toast.error(`Erro ao salvar: ${err.message}`);
      
      return { success: false, error: err };
    }
  }, [userId, store]);
  
  /**
   * Função para remover um item do servidor
   * @param {string} key - Chave do item a ser removido
   * @returns {Promise<object>} - Objeto com resultado da operação
   */
  const removeItem = useCallback(async (key) => {
    if (!userId) {
      const error = new Error('Usuário não autenticado');
      console.error('[useServerData]', error);
      toast.error('Você precisa estar logado para remover dados');
      return { success: false, error };
    }
    
    if (!key) {
      const error = new Error('Chave do item é obrigatória');
      console.error('[useServerData]', error);
      toast.error('Erro: Identificador do item é obrigatório');
      return { success: false, error };
    }
    
    try {
      console.log(`[useServerData] Removendo item '${key}' da store '${store}'`);
      setLoading(true);
      
      const result = await removeUserData(userId, store, key);
      
      // Verificar se foi offline
      if (result.fromLocalStorage) {
        console.log('[useServerData] Item marcado para remoção localmente (offline)');
        toast.info('Você está offline. A exclusão será concluída quando a conexão for restabelecida.');
      } else {
        console.log('[useServerData] Item removido com sucesso do servidor');
      }
      
      // Remover o item do estado local
      setData(prevData => prevData.filter(item => item.key !== key));
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      setLoading(false);
      
      return { success: true, offline: result.fromLocalStorage };
    } catch (err) {
      console.error(`[useServerData] Erro ao remover item '${key}':`, err);
      setLoading(false);
      toast.error(`Erro ao remover: ${err.message}`);
      
      return { success: false, error: err };
    }
  }, [userId, store]);
  
  /**
   * Função para sincronizar dados pendentes
   * @returns {Promise<object>} - Resultado da sincronização
   */
  const syncData = useCallback(async () => {
    if (!userId) {
      const error = new Error('Usuário não autenticado');
      console.error('[useServerData]', error);
      toast.error('Você precisa estar logado para sincronizar dados');
      return { success: false, error };
    }
    
    // Verificar conexão com a internet
    if (!navigator.onLine) {
      const error = new Error('Dispositivo offline');
      console.warn('[useServerData] Tentativa de sincronização com dispositivo offline');
      toast.warning('Você está offline. Impossível sincronizar agora.');
      return { success: false, error };
    }
    
    setSyncStatus('syncing');
    
    try {
      console.log('[useServerData] Iniciando sincronização de dados pendentes');
      toast.info('Sincronizando dados...', { autoClose: 2000 });
      
      const result = await syncPendingData(userId);
      
      if (result.success) {
        console.log('[useServerData] Sincronização concluída com sucesso');
        toast.success(result.message);
        
        // Recarregar os dados após sincronização
        await loadData(true);
      } else {
        console.warn('[useServerData] Sincronização concluída com alertas:', result.message);
        toast.warning(result.message);
      }
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      setSyncStatus('completed');
      
      return result;
    } catch (err) {
      console.error('[useServerData] Erro durante sincronização:', err);
      toast.error(`Erro ao sincronizar: ${err.message}`);
      setSyncStatus('error');
      
      return { success: false, error: err };
    }
  }, [userId, loadData]);
  
  /**
   * Função para obter um item específico pelo ID
   * @param {string} key - Chave do item
   * @returns {object|undefined} - Item encontrado ou undefined
   */
  const getItem = useCallback((key) => {
    return data.find(item => item.key === key);
  }, [data]);
  
  // Detectar alterações na conexão de rede
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useServerData] Conexão restabelecida, tentando sincronizar');
      toast.info('Conexão restabelecida. Sincronizando dados...', { autoClose: 2000 });
      
      // Aguardar um momento para garantir que a conexão está estável
      setTimeout(() => {
        syncData().catch(err => {
          console.error('[useServerData] Erro ao sincronizar após ficar online:', err);
        });
      }, 2000);
    };
    
    const handleOffline = () => {
      console.log('[useServerData] Dispositivo offline. Dados serão salvos localmente.');
      toast.info('Você está offline. As alterações serão salvas localmente.', { autoClose: 3000 });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);
  
  // Carregar dados quando o componente montar (se autoLoad=true)
  useEffect(() => {
    if (autoLoad && userId && store) {
      loadData();
    }
  }, [autoLoad, userId, store, loadData]);
  
  // Efeito para sincronizar após login
  useEffect(() => {
    if (userId && store) {
      console.log('[useServerData] Usuário autenticado, carregando dados iniciais');
      
      // Sempre tentar carregar dados ao inicializar com usuário autenticado
      loadData(true).then(() => {
        // Após carregar dados do servidor, tentar sincronizar pendentes
        if (navigator.onLine) {
          syncData().catch(e => console.error('[useServerData] Erro na sincronização inicial:', e));
        }
      });
    }
  }, [userId, store, loadData, syncData]);
  
  return {
    data,
    loading,
    error,
    loadData,
    saveItem,
    removeItem,
    getItem,
    syncData,
    syncStatus,
    lastSync,
    isOnline: navigator.onLine,
    hasPendingChanges: data.some(item => item.pendingSync === true)
  };
} 