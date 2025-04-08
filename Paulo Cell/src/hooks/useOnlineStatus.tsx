import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook que fornece o status atual de conexão com a internet e a API
 * @returns Um objeto com o status de conexão com a internet e a API
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  
  // Monitorar mudanças de conexão com a internet
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão com a internet detectada!');
      setIsOnline(true);
      checkApiConnection();
    };
    
    const handleOffline = () => {
      console.log('⚠️ Conexão com a internet perdida!');
      setIsOnline(false);
      setIsApiConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar conexão inicial
    checkApiConnection();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Verificar conexão com a API periodicamente
  useEffect(() => {
    // Se estamos offline, não há necessidade de verificar a API
    if (!isOnline) return;
    
    const intervalId = setInterval(() => {
      checkApiConnection();
    }, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [isOnline]);
  
  const checkApiConnection = async () => {
    // Prevenir verificações simultâneas
    if (isChecking) return;
    
    // Verificar a API apenas a cada 10 segundos
    const now = Date.now();
    if (now - lastChecked < 10000 && lastChecked !== 0) {
      return;
    }
    
    setIsChecking(true);
    try {
      console.log('🔍 Verificando conexão com a API...');
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      });
      
      const wasConnected = isApiConnected;
      const isNowConnected = response.ok;
      
      setIsApiConnected(isNowConnected);
      setLastChecked(Date.now());
      
      if (!wasConnected && isNowConnected) {
        console.log('✅ Conexão com a API estabelecida!');
        toast.success('Conexão com o servidor estabelecida');
      } else if (wasConnected && !isNowConnected) {
        console.log('❌ Conexão com a API perdida!');
        toast.error('Conexão com o servidor perdida');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão com a API:', error);
      setIsApiConnected(false);
      
      // Notificar apenas se a conexão estava ativa antes
      if (isApiConnected) {
        toast.error('Conexão com o servidor perdida');
      }
    } finally {
      setIsChecking(false);
    }
  };
  
  return { isOnline, isApiConnected, checkApiConnection };
} 