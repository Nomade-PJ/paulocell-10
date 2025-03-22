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
   * Função para carregar dados do servidor com prioridade
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      console.warn('Tentativa de carregar dados sem usuário autenticado');
      setError(new Error('Usuário não autenticado'));
      setLoading(false);
      return [];
    }
    
    if (!store) {
      console.warn('Nome do armazenamento (store) não informado');
      setError(new Error('Nome do armazenamento é obrigatório'));
      setLoading(false);
      return [];
    }
    
    console.log(`[useServerData] Carregando dados da store '${store}' para usuário ${userId}${forceRefresh ? ' (forçando atualização)' : ''}`);
    setLoading(true);
    setError(null);
    
    try {
      // Definir um timeout para o servidor responder
      const serverDataPromise = new Promise(async (resolve, reject) => {
        try {
          // Sempre tentar buscar do servidor primeiro, mesmo quando offline
          // O serviço getUserData já implementa fallback para dados locais
          const serverData = await getUserData(userId, store);
          console.log(`[useServerData] Dados recebidos do servidor: ${serverData.length} itens`);
          resolve(serverData);
        } catch (serverError) {
          console.warn(`[useServerData] Falha ao buscar do servidor:`, serverError);
          reject(serverError);
        }
      });
      
      // Timeout de 8 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tempo limite excedido ao buscar dados do servidor'));
        }, 8000);
      });
      
      // Competição entre servidor e timeout
      let data;
      
      try {
        data = await Promise.race([serverDataPromise, timeoutPromise]);
        
        // Dados vieram do servidor, atualizar estado e localStorage
        setData(data);
        console.log(`[useServerData] Estado atualizado com ${data.length} itens`);
      } catch (timeoutError) {
        console.warn('[useServerData] Timeout ou erro ao buscar do servidor:', timeoutError);
        
        // Em caso de timeout, usar dados locais
        console.log('[useServerData] Usando dados locais devido a timeout');
        
        try {
          // Recuperar dados locais através do serviço
          // O serviço implementa a lógica de buscar do localStorage
          const localData = await getLocalData(userId, store);
          data = localData;
          setData(localData);
          
          // Mostrar toast informativo
          if (navigator.onLine) {
            toast.warning('O servidor está demorando para responder. Usando dados locais.');
          } else {
            toast.info('Você está offline. Usando dados salvos localmente.');
          }
        } catch (localError) {
          console.error('[useServerData] Erro ao buscar dados locais:', localError);
          setError('Não foi possível carregar seus dados');
          data = [];
          setData([]);
        }
      }
      
      setLoading(false);
      setLastSync(new Date());
      return data;
    } catch (error) {
      console.error(`[useServerData] Erro ao carregar dados para ${store}:`, error);
      setError(`Erro ao carregar dados: ${error.message}`);
      setLoading(false);
      
      // Exibir mensagem para o usuário
      toast.error(`Não foi possível carregar seus dados: ${error.message}`);
      
      // Retornar array vazio em caso de falha
      setData([]);
      return [];
    }
  }, [userId, store]);
  
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
            console.warn(`Item inválido no localStorage: ${key}`);
          }
        }
      }
      return localData;
    } catch (error) {
      console.error('Erro ao ler dados do localStorage:', error);
      return [];
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
      console.error(error);
      showToast('Você precisa estar logado para salvar dados', 'error');
      return { success: false, error };
    }
    
    if (!key) {
      const error = new Error('Chave do item é obrigatória');
      console.error(error);
      showToast('Erro: Identificador do item é obrigatório', 'error');
      return { success: false, error };
    }
    
    if (itemData === undefined || itemData === null) {
      const error = new Error('Dados do item não podem ser vazios');
      console.error(error);
      showToast('Erro: Os dados não podem estar vazios', 'error');
      return { success: false, error };
    }
    
    try {
      console.log(`Salvando item '${key}' na store '${store}'`);
      const result = await saveUserData(userId, store, key, itemData);
      
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
            id: result.id || prevData[existingIndex].id
          };
          return newData;
        } else {
          // Adicionar novo item
          return [...prevData, {
            ...itemData,
            key,
            id: result.id
          }];
        }
      });
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      
      return { success: true, id: result.id };
    } catch (err) {
      console.error(`Erro ao salvar item '${key}':`, err);
      showToast(`Erro ao salvar: ${err.message}`, 'error');
      
      // Se estiver offline, mostrar mensagem específica
      if (!navigator.onLine) {
        showToast('Você está offline. Os dados serão sincronizados quando a conexão for restabelecida.', 'info');
      }
      
      return { success: false, error: err };
    }
  }, [userId, store, showToast]);
  
  /**
   * Função para remover um item do servidor
   * @param {string} key - Chave do item a ser removido
   * @returns {Promise<object>} - Objeto com resultado da operação
   */
  const removeItem = useCallback(async (key) => {
    if (!userId) {
      const error = new Error('Usuário não autenticado');
      console.error(error);
      showToast('Você precisa estar logado para remover dados', 'error');
      return { success: false, error };
    }
    
    if (!key) {
      const error = new Error('Chave do item é obrigatória');
      console.error(error);
      showToast('Erro: Identificador do item é obrigatório', 'error');
      return { success: false, error };
    }
    
    try {
      console.log(`Removendo item '${key}' da store '${store}'`);
      await removeUserData(userId, store, key);
      
      // Remover o item do estado local
      setData(prevData => prevData.filter(item => item.key !== key));
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      
      return { success: true };
    } catch (err) {
      console.error(`Erro ao remover item '${key}':`, err);
      showToast(`Erro ao remover: ${err.message}`, 'error');
      
      // Se estiver offline, mostrar mensagem específica
      if (!navigator.onLine) {
        showToast('Você está offline. A remoção será sincronizada quando a conexão for restabelecida.', 'info');
      }
      
      return { success: false, error: err };
    }
  }, [userId, store, showToast]);
  
  /**
   * Função para sincronizar dados pendentes
   * @returns {Promise<object>} - Resultado da sincronização
   */
  const syncData = useCallback(async () => {
    if (!userId) {
      const error = new Error('Usuário não autenticado');
      console.error(error);
      showToast('Você precisa estar logado para sincronizar dados', 'error');
      return { success: false, error };
    }
    
    // Verificar conexão com a internet
    if (!navigator.onLine) {
      const error = new Error('Dispositivo offline');
      console.warn('Tentativa de sincronização com dispositivo offline');
      showToast('Você está offline. Impossível sincronizar agora.', 'warning');
      return { success: false, error };
    }
    
    setSyncStatus('syncing');
    
    try {
      console.log('Iniciando sincronização de dados pendentes');
      const result = await syncPendingData(userId);
      
      if (result.success) {
        console.log('Sincronização concluída com sucesso');
        showToast(result.message, 'success');
        
        // Recarregar os dados após sincronização
        await loadData(true);
      } else {
        console.warn('Sincronização concluída com alertas:', result.message);
        showToast(result.message, result.failed > 0 ? 'error' : 'warning');
      }
      
      // Atualizar timestamp de sincronização
      setLastSync(new Date());
      setSyncStatus('completed');
      
      return result;
    } catch (err) {
      console.error('Erro durante sincronização:', err);
      showToast(`Erro ao sincronizar: ${err.message}`, 'error');
      setSyncStatus('error');
      
      return { success: false, error: err };
    }
  }, [userId, loadData, showToast]);
  
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
      console.log('Conexão restabelecida, tentando sincronizar');
      showToast('Conexão restabelecida. Sincronizando dados...', 'info');
      syncData().catch(err => {
        console.error('Erro ao sincronizar após ficar online:', err);
      });
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData, showToast]);
  
  // Carregar dados quando o componente montar (se autoLoad=true)
  useEffect(() => {
    if (autoLoad && userId && store) {
      loadData();
    }
  }, [autoLoad, userId, store, loadData]);
  
  // Efeito para sincronizar após login
  useEffect(() => {
    if (userId && store && navigator.onLine) {
      // Quando o usuário faz login, sincronizar dados imediatamente
      loadData(true).then(() => {
        // Após carregar dados do servidor, verificar se há dados pendentes
        syncData().catch(e => console.error('Erro na sincronização inicial:', e));
      });
    }
  }, [userId, store]); // Dependência em userId para sincronizar quando mudar (login/logout)
  
  // Carregar dados ao inicializar o hook
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      console.log('[useServerData] Esperando autenticação do usuário');
      setLoading(false);
      setData([]);
    }
  }, [user, loadData]);

  // Monitorar estado de conexão para sincronização automática
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[useServerData] Conexão restabelecida, sincronizando dados');
      
      toast.info('Conexão restabelecida. Sincronizando suas alterações...', { autoClose: 2000 });
      
      // Aguardar um momento antes de sincronizar para garantir que a conexão é estável
      setTimeout(async () => {
        try {
          await syncData();
        } catch (error) {
          console.error('[useServerData] Erro ao sincronizar após conexão restabelecida:', error);
        }
      }, 2000);
    };
    
    const handleOffline = () => {
      console.log('[useServerData] Conexão perdida, trabalhando offline');
      toast.info('Você está offline. As alterações serão salvas localmente.', { autoClose: 3000 });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar conectividade ao montar o componente
    if (!navigator.onLine) {
      console.log('[useServerData] Inicializando em modo offline');
      toast.info('Você está offline. Os dados serão salvos localmente até que a conexão seja restabelecida.', { autoClose: 4000 });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);
  
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
    hasPendingChanges: syncStatus === 'pending'
  };
} 