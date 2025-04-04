import React, { useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';
import api from '../services/api';

// Estilos para o componente
const styles = {
  container: {
    position: 'fixed' as 'fixed',
    bottom: '10px',
    right: '10px',
    zIndex: 1000
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: 500,
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  statusIndicator: (status: 'online' | 'offline' | 'connecting') => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
    backgroundColor: 
      status === 'online' ? '#4caf50' : 
      status === 'offline' ? '#f44336' : 
      '#ff9800'
  }),
  modal: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100%'
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px'
  },
  alertMessage: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #f44336',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '4px'
  }
};

const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const [socketConnected, setSocketConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Verificar a conexão geral baseada nas conexões específicas
  useEffect(() => {
    if (apiConnected && socketConnected) {
      setConnectionStatus('online');
    } else if (!navigator.onLine) {
      setConnectionStatus('offline');
    } else {
      setConnectionStatus('connecting');
    }
  }, [apiConnected, socketConnected]);
  
  // Monitorar eventos de online/offline do navegador
  useEffect(() => {
    const handleOnline = () => {
      console.log('Navegador detectou conexão online');
      checkConnections();
    };
    
    const handleOffline = () => {
      console.log('Navegador detectou desconexão');
      setConnectionStatus('offline');
      setApiConnected(false);
      setSocketConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Monitorar eventos de WebSocket
  useEffect(() => {
    const handleSocketConnect = () => {
      console.log('WebSocket conectado');
      setSocketConnected(true);
      setLastUpdate(new Date());
    };
    
    const handleSocketDisconnect = () => {
      console.log('WebSocket desconectado');
      setSocketConnected(false);
      setLastUpdate(new Date());
    };
    
    const handleSocketError = (event: Event) => {
      console.error('Erro no WebSocket:', event);
      setSocketConnected(false);
      setLastUpdate(new Date());
    };
    
    const handleApiError = (event: CustomEvent) => {
      console.error('Erro na API:', event.detail);
      setErrorMessage(event.detail.message);
      setLastUpdate(new Date());
    };
    
    // Registrar listeners
    window.addEventListener('realtime:connected', handleSocketConnect);
    window.addEventListener('realtime:disconnected', handleSocketDisconnect);
    window.addEventListener('realtime:error', handleSocketError);
    window.addEventListener('api:connection-error', handleApiError as EventListener);
    
    // Verificar conexão inicial
    checkConnections();
    
    // Periodicamene verificar a conexão
    const intervalId = setInterval(checkConnections, 30000); // 30 segundos
    
    return () => {
      window.removeEventListener('realtime:connected', handleSocketConnect);
      window.removeEventListener('realtime:disconnected', handleSocketDisconnect);
      window.removeEventListener('realtime:error', handleSocketError);
      window.removeEventListener('api:connection-error', handleApiError as EventListener);
      clearInterval(intervalId);
    };
  }, []);
  
  // Função para verificar as conexões
  const checkConnections = async () => {
    // Verificar se o navegador está online
    if (!navigator.onLine) {
      setConnectionStatus('offline');
      setApiConnected(false);
      setSocketConnected(false);
      return;
    }
    
    // Verificar conexão com a API
    try {
      const result = await api.checkServerStatus();
      setApiConnected(result.online);
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      setApiConnected(false);
    }
    
    // Verificar conexão WebSocket - já é feito através dos eventos
    setSocketConnected(realtimeService.isConnected);
    
    setLastUpdate(new Date());
  };
  
  // Formatar a hora da última atualização
  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString();
  };
  
  // Abrir/fechar modal de detalhes
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  // Tentar reconectar manualmente
  const handleReconnect = () => {
    checkConnections();
    
    // Se o token existe, tentar reconectar o WebSocket
    const token = sessionStorage.getItem('authToken');
    if (token) {
      realtimeService.connect(token);
    }
    
    setErrorMessage(null);
  };
  
  // Renderizar o componente
  return (
    <>
      <div style={styles.container} onClick={toggleDetails}>
        <div 
          style={{
            ...styles.statusBadge,
            backgroundColor: 
              connectionStatus === 'online' ? '#e8f5e9' : 
              connectionStatus === 'offline' ? '#ffebee' : 
              '#fff3e0',
            color: 
              connectionStatus === 'online' ? '#1b5e20' : 
              connectionStatus === 'offline' ? '#b71c1c' : 
              '#e65100'
          }}
        >
          <span style={styles.statusIndicator(connectionStatus)}></span>
          {connectionStatus === 'online' ? 'Online' : 
           connectionStatus === 'offline' ? 'Offline' : 
           'Conectando...'}
        </div>
      </div>
      
      {showDetails && (
        <div style={styles.modal} onClick={toggleDetails}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Status da Conexão</h3>
            
            {errorMessage && (
              <div style={styles.alertMessage}>
                <strong>Erro:</strong> {errorMessage}
              </div>
            )}
            
            <div>
              <p><strong>Status geral:</strong> {
                connectionStatus === 'online' ? 'Conectado' : 
                connectionStatus === 'offline' ? 'Desconectado' : 
                'Estabelecendo conexão...'
              }</p>
              <p><strong>API:</strong> {apiConnected ? 'Conectada' : 'Desconectada'}</p>
              <p><strong>WebSocket:</strong> {socketConnected ? 'Conectado' : 'Desconectado'}</p>
              <p><strong>Última verificação:</strong> {formatLastUpdate()}</p>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                style={styles.closeButton} 
                onClick={handleReconnect}
              >
                Reconectar
              </button>
              
              <button 
                style={styles.closeButton} 
                onClick={toggleDetails}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionStatus; 