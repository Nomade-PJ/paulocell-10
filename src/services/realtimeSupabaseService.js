/**
 * Serviço de Comunicação em Tempo Real com Supabase
 * 
 * Este serviço gerencia a sincronização em tempo real usando o Supabase Realtime.
 * Substitui a implementação anterior baseada em Socket.io.
 */

import supabase from '../lib/supabase';

// Eventos de tempo real
export const REALTIME_EVENTS = {
  // Eventos de dados
  DATA_UPDATED: 'data_updated',
  DATA_CREATED: 'data_created',
  DATA_DELETED: 'data_deleted',
  
  // Eventos específicos de entidades
  CUSTOMER_UPDATED: 'customer_updated',
  INVENTORY_UPDATED: 'inventory_updated',
  SERVICE_UPDATED: 'service_updated',
  
  // Eventos de presença
  PRESENCE_CHANGE: 'presence_change'
};

class RealtimeSupabaseService {
  subscriptions = new Map();
  channels = new Map();
  isConnected = false;
  
  constructor() {
    this._setupNetworkListeners();
  }
  
  /**
   * Configura listeners para monitorar a conexão de rede do navegador
   */
  _setupNetworkListeners() {
    window.addEventListener('online', this._handleNetworkOnline.bind(this));
    window.addEventListener('offline', this._handleNetworkOffline.bind(this));
  }
  
  /**
   * Handler para quando a conexão de rede é restaurada
   */
  _handleNetworkOnline = () => {
    console.log('Rede: Conexão de internet restaurada');
    
    // Reconectar canais
    this._reconnectChannels();
  }
  
  /**
   * Handler para quando a conexão de rede é perdida
   */
  _handleNetworkOffline = () => {
    console.log('Rede: Conexão de internet perdida');
  }
  
  /**
   * Reconecta todos os canais ativos
   */
  _reconnectChannels() {
    // O Supabase Realtime tenta reconectar automaticamente,
    // mas podemos forçar a reconexão se necessário
    this.channels.forEach((channel, name) => {
      console.log(`Reconectando canal: ${name}`);
      channel.unsubscribe();
      
      // Resubscribe com as mesmas configurações
      const config = this._getChannelConfig(name);
      if (config) {
        this._subscribeToChannel(name, config.table, config.filter, config.callback);
      }
    });
  }
  
  /**
   * Obtém a configuração de um canal pelo nome
   */
  _getChannelConfig(channelName) {
    return this.subscriptions.get(channelName);
  }
  
  /**
   * Inscreve-se em um canal do Supabase Realtime
   */
  _subscribeToChannel(channelName, table, filter, callback) {
    console.log(`Inscrevendo no canal ${channelName} para tabela ${table}`);
    
    // Criar canal
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table
      }, (payload) => {
        console.log(`Evento recebido no canal ${channelName}:`, payload);
        
        // Mapear tipo de evento
        let eventType;
        switch (payload.eventType) {
          case 'INSERT':
            eventType = REALTIME_EVENTS.DATA_CREATED;
            break;
          case 'UPDATE':
            eventType = REALTIME_EVENTS.DATA_UPDATED;
            break;
          case 'DELETE':
            eventType = REALTIME_EVENTS.DATA_DELETED;
            break;
          default:
            eventType = payload.eventType;
        }
        
        // Executar callback com evento mapeado
        callback({
          type: eventType,
          table: payload.table,
          schema: payload.schema,
          data: payload.new || {},
          oldData: payload.old || {},
          timestamp: new Date().toISOString()
        });
      })
      .subscribe((status) => {
        console.log(`Status da inscrição no canal ${channelName}:`, status);
        
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
        }
      });
    
    // Armazenar referência do canal
    this.channels.set(channelName, channel);
    
    // Armazenar configuração
    this.subscriptions.set(channelName, {
      table,
      filter,
      callback
    });
    
    return channel;
  }
  
  /**
   * Inscreve-se em alterações em uma tabela
   */
  subscribeToTable(table, callback, filter = {}) {
    const channelName = `realtime:${table}`;
    
    // Verificar se já existe inscrição
    if (this.channels.has(channelName)) {
      console.log(`Já existe inscrição para ${table}. Cancelando inscrição anterior.`);
      this.unsubscribeFromTable(table);
    }
    
    return this._subscribeToChannel(channelName, table, filter, callback);
  }
  
  /**
   * Cancela inscrição em uma tabela
   */
  unsubscribeFromTable(table) {
    const channelName = `realtime:${table}`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      channel.unsubscribe();
      
      this.channels.delete(channelName);
      this.subscriptions.delete(channelName);
      
      console.log(`Inscrição cancelada para ${table}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Inscreve-se em alterações em um registro específico
   */
  subscribeToRecord(table, recordId, callback) {
    const channelName = `realtime:${table}:${recordId}`;
    
    // Verificar se já existe inscrição
    if (this.channels.has(channelName)) {
      console.log(`Já existe inscrição para ${table}:${recordId}. Cancelando inscrição anterior.`);
      this.unsubscribeFromRecord(table, recordId);
    }
    
    return this._subscribeToChannel(
      channelName, 
      table, 
      { id: recordId }, 
      callback
    );
  }
  
  /**
   * Cancela inscrição em um registro específico
   */
  unsubscribeFromRecord(table, recordId) {
    const channelName = `realtime:${table}:${recordId}`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      channel.unsubscribe();
      
      this.channels.delete(channelName);
      this.subscriptions.delete(channelName);
      
      console.log(`Inscrição cancelada para ${table}:${recordId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Cancela todas as inscrições
   */
  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      console.log(`Cancelando inscrição em ${name}`);
      channel.unsubscribe();
    });
    
    this.channels.clear();
    this.subscriptions.clear();
    
    console.log('Todas as inscrições foram canceladas');
  }
  
  /**
   * Verifica se está conectado ao servidor
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      activeChannels: Array.from(this.channels.keys()),
      networkOnline: navigator.onLine
    };
  }
}

// Criar instância única do serviço
const realtimeSupabaseService = new RealtimeSupabaseService();

export default realtimeSupabaseService; 