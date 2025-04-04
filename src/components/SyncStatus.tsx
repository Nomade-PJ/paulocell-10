import React, { useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';

// Estilos para o componente
const styles = {
  container: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    fontSize: '14px'
  },
  statusText: {
    margin: 0
  },
  statusIcon: (connected: boolean) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: connected ? '#4caf50' : '#f44336',
    marginRight: '8px',
    display: 'inline-block'
  })
};

/**
 * Componente que exibe o status da sincronização em tempo real
 */
const SyncStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [message, setMessage] = useState('Verificando status da sincronização...');

  useEffect(() => {
    // Manipuladores de eventos para WebSocket
    const handleConnected = () => {
      setIsConnected(true);
      setLastUpdate(new Date());
      setMessage('Conectado e sincronizado em tempo real');
    };
    
    const handleDisconnected = (event: Event) => {
      setIsConnected(false);
      setMessage('Desconectado do serviço de sincronização em tempo real');
    };
    
    const handleUpdated = (event: CustomEvent) => {
      setLastUpdate(new Date());
      const detail = event.detail;
      setMessage(`Dados de ${detail.store} atualizados em tempo real`);
      
      // Resetar a mensagem após 3 segundos
      setTimeout(() => {
        setMessage('Conectado e sincronizado em tempo real');
      }, 3000);
    };
    
    // Verificar status inicial
    if (realtimeService.isConnected) {
      setIsConnected(true);
      setMessage('Conectado e sincronizado em tempo real');
    } else {
      setIsConnected(false);
      setMessage('Não conectado ao serviço de sincronização');
    }
    
    // Registrar event listeners
    window.addEventListener('realtime:connected', handleConnected);
    window.addEventListener('realtime:disconnected', handleDisconnected);
    window.addEventListener('userdata:updated', handleUpdated as EventListener);
    window.addEventListener('userdata:created', handleUpdated as EventListener);
    
    return () => {
      // Remover event listeners quando o componente for desmontado
      window.removeEventListener('realtime:connected', handleConnected);
      window.removeEventListener('realtime:disconnected', handleDisconnected);
      window.removeEventListener('userdata:updated', handleUpdated as EventListener);
      window.removeEventListener('userdata:created', handleUpdated as EventListener);
    };
  }, []);
  
  return (
    <div 
      style={{
        ...styles.container,
        backgroundColor: isConnected ? '#e8f5e9' : '#ffebee',
        color: isConnected ? '#1b5e20' : '#b71c1c'
      }}
    >
      <div>
        <span style={styles.statusIcon(isConnected)}></span>
        <span>{message}</span>
      </div>
      {lastUpdate && (
        <div>
          <small>Última atualização: {lastUpdate.toLocaleTimeString()}</small>
        </div>
      )}
    </div>
  );
};

export default SyncStatus; 