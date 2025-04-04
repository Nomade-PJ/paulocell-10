import React, { useEffect, useState } from 'react';
import realtimeSupabaseService from '../services/realtimeSupabaseService';
import databaseService from '../services/databaseService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

/**
 * Componente de exemplo que demonstra o uso do Supabase Realtime
 * para observar alterações em tempo real em uma tabela.
 */
const RealtimeExample = ({ table = 'customers' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const { user } = useSupabaseAuth();
  
  // Carregar dados iniciais
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do Supabase
        const fetchedData = await databaseService.getAll(table, {
          filter: { user_id: user.id },
          orderBy: { column: 'created_at', ascending: false }
        });
        
        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Tente novamente.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [table, user]);
  
  // Configurar Realtime para observar alterações na tabela
  useEffect(() => {
    if (!user) return;
    
    // Função que lida com eventos recebidos
    const handleRealtimeEvent = (event) => {
      console.log(`Evento Realtime recebido (${table}):`, event);
      
      // Verificar se o evento é do mesmo usuário
      if (event.data.user_id !== user.id) {
        console.log('Ignorando evento de outro usuário.');
        return;
      }
      
      // Atualizar dados com base no tipo de evento
      switch (event.type) {
        case 'data_created':
          setData(current => [event.data, ...current]);
          break;
          
        case 'data_updated':
          setData(current => 
            current.map(item => 
              item.id === event.data.id ? event.data : item
            )
          );
          break;
          
        case 'data_deleted':
          setData(current => 
            current.filter(item => item.id !== event.data.id)
          );
          break;
          
        default:
          console.log('Tipo de evento desconhecido:', event.type);
      }
    };
    
    // Assinar na tabela com filtro para o usuário atual
    const channel = realtimeSupabaseService.subscribeToTable(
      table,
      handleRealtimeEvent,
      { user_id: user.id }
    );
    
    // Verificar estado da conexão
    const interval = setInterval(() => {
      const status = realtimeSupabaseService.getConnectionStatus();
      setConnectionStatus(status.isConnected);
    }, 5000);
    
    // Limpar recursos ao desmontar
    return () => {
      console.log(`Cancelando inscrição na tabela ${table}`);
      realtimeSupabaseService.unsubscribeFromTable(table);
      clearInterval(interval);
    };
  }, [table, user]);
  
  if (loading) {
    return <div>Carregando dados...</div>;
  }
  
  if (error) {
    return <div>Erro: {error}</div>;
  }
  
  return (
    <div className="realtime-example">
      <h3>Dados da tabela {table} (em tempo real)</h3>
      
      <div className="connection-status">
        Status da conexão: 
        <span className={connectionStatus ? 'status-online' : 'status-offline'}>
          {connectionStatus ? ' Online' : ' Offline'}
        </span>
      </div>
      
      {data.length === 0 ? (
        <p>Nenhum dado encontrado.</p>
      ) : (
        <ul className="data-list">
          {data.map(item => (
            <li key={item.id} className="data-item">
              <div className="data-header">
                <strong>{item.name || item.description || item.key}</strong>
                <small>ID: {item.id}</small>
              </div>
              <div className="data-body">
                {Object.entries(item)
                  .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="data-field">
                      <span className="field-name">{key}:</span>
                      <span className="field-value">
                        {typeof value === 'object' 
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))
                }
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <style jsx>{`
        .realtime-example {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .connection-status {
          margin-bottom: 15px;
          font-size: 14px;
        }
        
        .status-online {
          color: green;
          font-weight: bold;
        }
        
        .status-offline {
          color: red;
          font-weight: bold;
        }
        
        .data-list {
          list-style: none;
          padding: 0;
        }
        
        .data-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
        }
        
        .data-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        
        .data-body {
          font-size: 14px;
        }
        
        .data-field {
          margin-bottom: 5px;
        }
        
        .field-name {
          font-weight: bold;
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default RealtimeExample; 