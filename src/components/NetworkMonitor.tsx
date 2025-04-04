/**
 * Componente de monitoramento e tratamento de problemas de rede
 * Monitora o estado da conexão e exibe notificações para o usuário
 */

import React, { useEffect, useState } from 'react';
import realtimeService, { REALTIME_EVENTS } from '../services/realtimeService';

// Opções de estilo para o componente conforme status
const alertStyles = {
  online: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    color: 'white'
  },
  offline: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: 'white'
  },
  connecting: {
    backgroundColor: 'rgba(234, 179, 8, 0.9)',
    color: 'white'
  },
  hidden: {
    display: 'none'
  }
};

interface NetworkMonitorProps {
  autoHideDelay?: number; // ms para auto-esconder mensagens de sucesso
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ 
  autoHideDelay = 3000 // 3 segundos padrão para auto-esconder
}) => {
  const [status, setStatus] = useState<'online' | 'offline' | 'connecting' | 'hidden'>(
    navigator.onLine ? 'connecting' : 'offline'
  );
  const [message, setMessage] = useState<string>('Verificando conexão...');
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Configurar monitoramento de eventos de rede
  useEffect(() => {
    // Handler para quando o navegador detecta que está online
    const handleOnline = () => {
      setStatus('connecting');
      setMessage('Restaurando conexão com o servidor...');
      
      // Tentar reconectar WebSocket se necessário
      if (realtimeService.getConnectionStatus && !realtimeService.getConnectionStatus().isConnected) {
        realtimeService.forceReconnect();
      }
    };
    
    // Handler para quando o navegador detecta que está offline
    const handleOffline = () => {
      setStatus('offline');
      setMessage('Conexão com a internet perdida. Os dados serão sincronizados quando a conexão for restaurada.');
      
      // Limpar qualquer timeout existente
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    };
    
    // Handler para quando a conexão WebSocket é estabelecida
    const handleConnected = () => {
      setStatus('online');
      setMessage('Conexão estabelecida com sucesso.');
      
      // Auto-esconder após delay
      const timeout = setTimeout(() => {
        setStatus('hidden');
      }, autoHideDelay);
      
      setHideTimeout(timeout);
    };
    
    // Handler para quando a conexão WebSocket é perdida
    const handleDisconnected = (event: CustomEvent) => {
      // Se já estamos offline, não alterar o status
      if (!navigator.onLine) return;
      
      const { reason, isAuthError } = event.detail || {};
      
      if (isAuthError) {
        setStatus('offline');
        setMessage('Sessão expirada ou inválida. Por favor, faça login novamente.');
      } else {
        setStatus('offline');
        setMessage('Conexão com o servidor perdida. Tentando reconectar...');
      }
      
      // Limpar qualquer timeout existente
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    };
    
    // Handler para quando a aplicação está tentando reconectar
    const handleReconnecting = (event: CustomEvent) => {
      const { attempt, max } = event.detail || { attempt: 0, max: 0 };
      setStatus('connecting');
      setMessage(`Tentando reconectar ao servidor (${attempt}/${max})...`);
      
      // Limpar qualquer timeout existente
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    };
    
    // Registrar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('realtime:connected', handleConnected as EventListener);
    window.addEventListener('realtime:disconnected', handleDisconnected as EventListener);
    window.addEventListener('realtime:reconnecting', handleReconnecting as EventListener);
    
    // Verificar estado inicial
    if (navigator.onLine) {
      const connectionStatus = realtimeService.getConnectionStatus && realtimeService.getConnectionStatus();
      
      if (connectionStatus && connectionStatus.isConnected) {
        handleConnected();
      } else {
        setStatus('connecting');
        setMessage('Estabelecendo conexão com o servidor...');
      }
    } else {
      setStatus('offline');
      setMessage('Sem conexão com a internet. Conecte-se para sincronizar dados.');
    }
    
    // Limpar listeners ao desmontar
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('realtime:connected', handleConnected as EventListener);
      window.removeEventListener('realtime:disconnected', handleDisconnected as EventListener);
      window.removeEventListener('realtime:reconnecting', handleReconnecting as EventListener);
      
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [autoHideDelay, hideTimeout]);
  
  // Se o status for 'hidden', não renderizar nada
  if (status === 'hidden') return null;
  
  return (
    <div 
      className="network-status-alert"
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        padding: '10px 15px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        maxWidth: '300px',
        ...alertStyles[status]
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {status === 'online' && (
          <span style={{ marginRight: '8px' }}>✅</span>
        )}
        {status === 'offline' && (
          <span style={{ marginRight: '8px' }}>❌</span>
        )}
        {status === 'connecting' && (
          <span style={{ marginRight: '8px' }}>⏳</span>
        )}
        <span>{message}</span>
      </div>
      
      {/* Botão para dispensar a notificação */}
      <button
        onClick={() => setStatus('hidden')}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: 0.7
        }}
      >
        ×
      </button>
    </div>
  );
};

export default NetworkMonitor; 