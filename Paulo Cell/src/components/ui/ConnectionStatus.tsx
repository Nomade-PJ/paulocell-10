import React from 'react';
import { WifiIcon, WifiOffIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnection } from '@/lib/ConnectionContext';
import { toast } from 'sonner';

/**
 * Componente para exibir o status de conexão com o servidor
 * Mostra um ícone verde quando online e vermelho quando offline
 */
const ConnectionStatus: React.FC = () => {
  const { isApiConnected, isSyncing, lastSyncTime, syncData } = useConnection();

  // Formatando o tempo da última sincronização
  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Nunca sincronizado';
    
    const minutes = Math.floor((Date.now() - lastSyncTime) / 60000);
    
    if (minutes < 1) return 'Sincronizado agora';
    if (minutes === 1) return 'Sincronizado há 1 minuto';
    if (minutes < 60) return `Sincronizado há ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Sincronizado há 1 hora';
    if (hours < 24) return `Sincronizado há ${hours} horas`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Sincronizado há 1 dia';
    return `Sincronizado há ${days} dias`;
  };

  const handleSync = () => {
    toast.info('Iniciando sincronização...');
    console.log('Iniciando sincronização manual...');
    syncData();
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center gap-1" 
        title={isApiConnected ? 'Conectado ao servidor' : 'Offline - Dados salvos localmente'}
      >
        {isApiConnected ? (
          <>
            <WifiIcon className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500 font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOffIcon className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-500 font-medium">Offline</span>
          </>
        )}
      </div>
      
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-6 w-6" 
        onClick={handleSync} 
        disabled={isSyncing}
        title={isSyncing ? 'Sincronizando...' : getLastSyncText()}
      >
        <RefreshCwIcon className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default ConnectionStatus; 