import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { SyncAPI } from './api-service';

// Interface para o estado de conexão
interface ConnectionState {
  isOnline: boolean;
  isApiConnected: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncData: () => Promise<void>;
}

// Criar o contexto com valores padrão
const ConnectionContext = createContext<ConnectionState>({
  isOnline: navigator.onLine,
  isApiConnected: false,
  lastSyncTime: null,
  isSyncing: false,
  syncData: async () => {}
});

// Hook para usar o contexto de conexão
export const useConnection = () => useContext(ConnectionContext);

// Provedor de contexto de conexão
export const ConnectionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  // Verificar conexão com a internet
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão de internet detectada!');
      setIsOnline(true);
      checkApiConnection();
    };

    const handleOffline = () => {
      console.log('⚠️ Conexão de internet perdida!');
      setIsOnline(false);
      setIsApiConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexão inicial
    console.log('🔄 Verificando conexão inicial...');
    checkApiConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar conexão com a API periodicamente (a cada 15 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        checkApiConnection();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Sincronizar dados automaticamente quando a conexão é restabelecida
  useEffect(() => {
    if (isApiConnected && lastSyncTime === null) {
      // Primeira sincronização após inicialização
      console.log('🔄 Primeira sincronização após inicialização...');
      syncData();
    } else if (isApiConnected && !isSyncing && lastSyncTime && Date.now() - lastSyncTime > 5 * 60 * 1000) {
      // Sincronizar a cada 5 minutos se estiver conectado
      console.log('🔄 Sincronização automática (última sincronização há mais de 5 minutos)...');
      syncData();
    }
  }, [isApiConnected, lastSyncTime, isSyncing]);

  // Função para verificar a conexão com a API
  const checkApiConnection = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      console.log('🔍 Verificando conexão com o servidor...');
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      });
      
      const connected = response.ok;
      
      // Se a conexão for estabelecida após estar offline, mostrar toast e tentar sincronizar
      if (!isApiConnected && connected) {
        setIsApiConnected(true);
        console.log('✅ Conexão com o servidor estabelecida!');
        toast.success('Conexão com o servidor estabelecida');
        syncData();
      } else if (isApiConnected && !connected) {
        setIsApiConnected(false);
        console.log('❌ Conexão com o servidor perdida!');
        toast.error('Conexão com o servidor perdida');
      } else {
        setIsApiConnected(connected);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão com o servidor:', error);
      if (isApiConnected) {
        setIsApiConnected(false);
        toast.error('Conexão com o servidor perdida');
      }
    } finally {
      setChecking(false);
    }
  };

  // Função para sincronizar dados com o servidor
  const syncData = async () => {
    if (!isApiConnected || isSyncing) {
      console.log('⚠️ Sincronização não iniciada: ' + (!isApiConnected ? 'Sem conexão' : 'Já em andamento'));
      return;
    }
    
    setIsSyncing(true);
    console.log('🔄 Iniciando sincronização de dados...');
    try {
      const result = await SyncAPI.syncAll();
      console.log('✅ Sincronização concluída:', result);
      setLastSyncTime(Date.now());
      toast.success('Dados sincronizados com sucesso');
      
      // Disparar evento de atualização para os componentes
      window.dispatchEvent(new Event('pauloCell_dataUpdated'));
    } catch (error) {
      console.error('❌ Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados com o servidor');
    } finally {
      setIsSyncing(false);
    }
  };

  const contextValue = {
    isOnline,
    isApiConnected,
    lastSyncTime,
    isSyncing,
    syncData
  };

  console.log('🌐 Estado de conexão:', {
    isOnline,
    isApiConnected,
    lastSyncTime: lastSyncTime ? new Date(lastSyncTime).toLocaleString() : null,
    isSyncing
  });

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionContext; 