import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveUserData, 
  getUserData, 
  removeUserData,
  syncPendingData
} from '@/services/userDataService';

/**
 * Hook para gerenciar dados persistentes no servidor
 * @param {string} storeName - Nome do store para os dados (ex: 'customers')
 * @returns {object} - Métodos e estado para gerenciar os dados
 */
export function useServerData(storeName) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ 
    lastSync: null, 
    syncing: false, 
    pendingChanges: false 
  });

  // Verificar se existem mudanças pendentes
  const checkPendingChanges = useCallback(() => {
    if (!user?.id) return;
    
    try {
      let hasPendingChanges = false;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`${user.id}_${storeName}_`)) {
          try {
            const value = JSON.parse(localStorage.getItem(key));
            if (value.pendingSync) {
              hasPendingChanges = true;
              break;
            }
          } catch (e) {
            // Ignorar itens inválidos
          }
        }
      }
      
      setSyncStatus(prev => ({ ...prev, pendingChanges: hasPendingChanges }));
    } catch (error) {
      console.error('Erro ao verificar mudanças pendentes:', error);
    }
  }, [user, storeName]);

  // Carregar dados do servidor
  const loadItems = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserData(user.id, storeName);
      setItems(data || []);
      
      // Verificar se existem mudanças pendentes
      checkPendingChanges();
    } catch (err) {
      console.error(`Erro ao carregar dados de ${storeName}:`, err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, storeName, checkPendingChanges]);

  // Carregar dados quando o usuário ou store mudar
  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, loadItems]);

  // Adicionar ouvinte para ficar online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('Conexão restabelecida. Iniciando sincronização automática...');
      syncData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  // Adicionar um novo item
  const addItem = useCallback(async (item) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      // Certificar que tem um ID
      const newItem = { 
        ...item, 
        id: item.id || uuidv4(),
        created_at: item.created_at || Date.now(),
        updated_at: Date.now() 
      };
      
      // Salvar no servidor
      const key = newItem.id;
      await saveUserData(user.id, storeName, key, newItem);
      
      // Atualizar estado
      setItems(prevItems => [...prevItems, newItem]);
      
      return newItem;
    } catch (err) {
      console.error(`Erro ao adicionar item em ${storeName}:`, err);
      // Se falhar, o serviço já tenta salvar no localStorage como fallback
      setError(`Erro ao adicionar item: ${err.message}`);
      
      // Verificar status de pendência
      checkPendingChanges();
      
      throw err;
    }
  }, [user, storeName, checkPendingChanges]);

  // Atualizar item existente
  const updateItem = useCallback(async (id, updates) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      // Buscar item atual na lista
      const currentItem = items.find(item => item.id === id);
      
      if (!currentItem) {
        throw new Error(`Item com ID ${id} não encontrado`);
      }
      
      // Mesclar atualizações
      const updatedItem = { 
        ...currentItem, 
        ...updates, 
        updated_at: Date.now() 
      };
      
      // Salvar no servidor
      await saveUserData(user.id, storeName, id, updatedItem);
      
      // Atualizar estado
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      
      return updatedItem;
    } catch (err) {
      console.error(`Erro ao atualizar item em ${storeName}:`, err);
      setError(`Erro ao atualizar item: ${err.message}`);
      
      // Verificar status de pendência
      checkPendingChanges();
      
      throw err;
    }
  }, [user, storeName, items, checkPendingChanges]);

  // Remover item
  const deleteItem = useCallback(async (id) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      // Remover do servidor
      await removeUserData(user.id, storeName, id);
      
      // Atualizar estado
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      return { success: true, id };
    } catch (err) {
      console.error(`Erro ao remover item de ${storeName}:`, err);
      setError(`Erro ao remover item: ${err.message}`);
      
      // Verificar status de pendência
      checkPendingChanges();
      
      throw err;
    }
  }, [user, storeName, checkPendingChanges]);

  // Sincronizar dados com o servidor
  const syncData = useCallback(async () => {
    if (!user?.id || !navigator.onLine) {
      return { 
        success: false, 
        message: !user?.id 
          ? 'Usuário não autenticado' 
          : 'Dispositivo offline'
      };
    }
    
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      // Sincronizar dados pendentes
      const result = await syncPendingData(user.id);
      
      // Recarregar dados após sincronização
      await loadItems();
      
      setSyncStatus({ 
        lastSync: new Date().toISOString(), 
        syncing: false,
        pendingChanges: false,
        success: result.success
      });
      
      return result;
    } catch (err) {
      console.error(`Erro na sincronização de ${storeName}:`, err);
      setSyncStatus(prev => ({ 
        ...prev,
        lastSync: prev.lastSync, 
        syncing: false,
        error: err.message
      }));
      
      // Verificar status de pendência
      checkPendingChanges();
      
      return { success: false, error: err.message };
    }
  }, [user, storeName, loadItems, checkPendingChanges]);

  return {
    items,
    loading,
    error,
    syncStatus,
    addItem,
    updateItem,
    deleteItem,
    syncData,
    refreshItems: loadItems
  };
} 