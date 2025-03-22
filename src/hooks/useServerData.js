import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  saveUserData, 
  getUserData,
  removeUserData,
  syncPendingData
} from '../services/userDataService';
import { useToast } from '../hooks/useToast';

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
   * Função para carregar dados do servidor
   */
  const loadData = useCallback(async () => {
    if (!userId) {
      console.warn('Tentativa de carregar dados sem usuário autenticado');
      setError(new Error('Usuário não autenticado'));
      return;
    }
    
    if (!store) {
      console.warn('Nome do armazenamento (store) não informado');
      setError(new Error('Nome do armazenamento é obrigatório'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar conexão com a internet
      if (!navigator.onLine) {
        console.warn('Dispositivo está offline, usando dados locais');
        showToast('Você está offline. Dados podem não estar atualizados.', 'warning');
      }
      
      console.log(`Carregando dados da store '${store}' para usuário ${userId}`);
      const result = await getUserData(userId, store);
      
      console.log(`${result.length} itens carregados`);
      setData(result || []);
    } catch (err) {
      console.error(`Erro ao carregar dados da store '${store}':`, err);
      setError(err);
      showToast(`Erro ao carregar dados: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, store, showToast]);
  
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
        await loadData();
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