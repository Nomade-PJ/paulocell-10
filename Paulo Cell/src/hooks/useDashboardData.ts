import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { CustomerAPI, DeviceAPI, ServiceAPI, SyncAPI } from '../lib/api-service';

export const useDashboardData = () => {
  // State for real-time data
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Atualizar o estado de conexão online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Função para carregar dados
  // Primeiro tenta do servidor, se falhar ou estiver offline, usa localStorage
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Se estiver online, tenta carregar do servidor
      if (isOnline) {
        try {
          // Carregar clientes do servidor
          const serverCustomers = await CustomerAPI.getAll();
          setCustomers(serverCustomers);
          
          // Atualizar localStorage com dados do servidor
          localStorage.setItem('pauloCell_customers', JSON.stringify(serverCustomers));
          
          // Carregar dispositivos do servidor
          const serverDevices = await DeviceAPI.getAll();
          setDevices(serverDevices);
          localStorage.setItem('pauloCell_devices', JSON.stringify(serverDevices));
          
          // Carregar serviços do servidor
          const serverServices = await ServiceAPI.getAll();
          setServices(serverServices);
          localStorage.setItem('pauloCell_services', JSON.stringify(serverServices));
          
          if (!isInitialLoad) {
            toast.success('Dados carregados do servidor');
          }
        } catch (error) {
          console.error('Erro ao carregar dados do servidor:', error);
          // Se falhar, carrega do localStorage como fallback
          loadFromLocalStorage();
          if (!isInitialLoad) {
            toast.error('Erro ao carregar dados do servidor, usando dados locais');
          }
        }
      } else {
        // Se offline, carrega apenas do localStorage
        loadFromLocalStorage();
        if (!isInitialLoad) {
          toast.info('Modo offline: usando dados locais');
        }
      }
      
      setLastUpdated(new Date());
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (isInitialLoad) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isOnline, isInitialLoad]);
  
  // Função auxiliar para carregar dados do localStorage
  const loadFromLocalStorage = () => {
    try {
      // Load customers
      const savedCustomers = localStorage.getItem('pauloCell_customers');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
      
      // Load services
      const savedServices = localStorage.getItem('pauloCell_services');
      if (savedServices) {
        setServices(JSON.parse(savedServices));
      }
      
      // Load devices
      const savedDevices = localStorage.getItem('pauloCell_devices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
      
      // Load inventory
      const savedInventory = localStorage.getItem('pauloCell_inventory');
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }
      
      // Load documents
      const savedDocuments = localStorage.getItem('pauloCell_documents');
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      throw error;
    }
  };
  
  // Função para sincronizar dados com o servidor
  const syncWithServer = async () => {
    if (!isOnline) {
      toast.error('Sem conexão com a internet. Sincronização não é possível.');
      return;
    }
    
    setIsSyncing(true);
    try {
      await SyncAPI.syncAll();
      toast.success('Dados sincronizados com o servidor');
      
      // Recarregar dados do servidor após sincronização
      await loadData();
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados com o servidor');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Initial load and set up polling
  useEffect(() => {
    // Initial load
    loadData();
    
    // Set up interval to check for data changes (a cada 30 segundos)
    const interval = setInterval(loadData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [loadData]);
  
  // Sincronização automática quando ficar online novamente
  useEffect(() => {
    if (isOnline && !isInitialLoad) {
      // Quando ficar online após já ter carregado inicialmente
      toast.info('Conexão de internet restaurada. Sincronizando dados...');
      syncWithServer();
    }
  }, [isOnline, isInitialLoad]);
  
  // Manual refresh function
  const handleRefresh = () => {
    loadData();
  };
  
  // Calculate total revenue from services
  const totalRevenue = services.reduce((total, service) => total + (service.price || 0), 0);
  
  // Format the last updated time
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `há ${diffInSeconds} segundo${diffInSeconds === 1 ? '' : 's'}`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} dia${diffInDays === 1 ? '' : 's'}`;
  };
  
  return {
    customers,
    services,
    devices,
    inventory,
    documents,
    isRefreshing,
    lastUpdated,
    handleRefresh,
    totalRevenue,
    formatLastUpdated,
    isInitialLoad,
    isOnline,
    syncWithServer,
    isSyncing
  };
};
