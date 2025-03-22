import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveItem,
  getAllItems,
  getItemById,
  removeItem,
  syncWithAPI
} from '../services/storageService';

/**
 * Hook para gerenciar dados localmente com IndexedDB e sincronizar com API
 * @param {string} storeName - Nome do store no IndexedDB (ex: 'customers')
 * @param {string} apiEndpoint - Endpoint da API para sincronização (ex: 'customers')
 */
function useLocalData(storeName, apiEndpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ lastSync: null, syncing: false });

  // Carregar todos os itens
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllItems(storeName);
      setItems(data || []);
      setError(null);
    } catch (err) {
      console.error(`Erro ao carregar ${storeName}:`, err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadItems();
    
    // Adicionar listener para sincronizar quando online
    const handleOnline = () => {
      console.log('Conexão restabelecida. Iniciando sincronização...');
      syncData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [loadItems]);

  // Adicionar novo item
  const addItem = useCallback(async (item) => {
    try {
      // Certificar que tem um ID
      const newItem = { 
        ...item, 
        id: item.id || uuidv4(),
        created_at: item.created_at || Date.now(),
        updated_at: Date.now() 
      };
      
      // Salvar localmente
      await saveItem(storeName, newItem);
      
      // Atualizar estado
      setItems(prevItems => [...prevItems, newItem]);
      
      // Tentar sincronizar se online
      if (navigator.onLine) {
        syncData();
      }
      
      return newItem;
    } catch (err) {
      console.error(`Erro ao adicionar ${storeName}:`, err);
      setError(`Erro ao adicionar: ${err.message}`);
      throw err;
    }
  }, [storeName]);

  // Atualizar item existente
  const updateItem = useCallback(async (id, updates) => {
    try {
      // Buscar item atual
      const currentItem = await getItemById(storeName, id);
      
      if (!currentItem) {
        throw new Error(`Item com ID ${id} não encontrado`);
      }
      
      // Mesclar atualizações
      const updatedItem = { 
        ...currentItem, 
        ...updates, 
        updated_at: Date.now() 
      };
      
      // Salvar localmente
      await saveItem(storeName, updatedItem);
      
      // Atualizar estado
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      
      // Tentar sincronizar se online
      if (navigator.onLine) {
        syncData();
      }
      
      return updatedItem;
    } catch (err) {
      console.error(`Erro ao atualizar ${storeName}:`, err);
      setError(`Erro ao atualizar: ${err.message}`);
      throw err;
    }
  }, [storeName]);

  // Remover item
  const deleteItem = useCallback(async (id) => {
    try {
      // Remover localmente
      await removeItem(storeName, id);
      
      // Atualizar estado
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Tentar sincronizar se online
      if (navigator.onLine) {
        syncData();
      }
      
      return { success: true, id };
    } catch (err) {
      console.error(`Erro ao remover ${storeName}:`, err);
      setError(`Erro ao remover: ${err.message}`);
      throw err;
    }
  }, [storeName]);

  // Sincronizar com a API
  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
      return { success: false, message: 'Dispositivo offline' };
    }
    
    try {
      setSyncStatus({ ...syncStatus, syncing: true });
      
      const result = await syncWithAPI(storeName, apiEndpoint);
      
      setSyncStatus({ 
        lastSync: new Date().toISOString(), 
        syncing: false,
        success: result.success
      });
      
      return result;
    } catch (err) {
      console.error(`Erro na sincronização de ${storeName}:`, err);
      setSyncStatus({ 
        lastSync: syncStatus.lastSync, 
        syncing: false,
        error: err.message
      });
      
      return { success: false, error: err.message };
    }
  }, [storeName, apiEndpoint, syncStatus]);

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

export default useLocalData; 