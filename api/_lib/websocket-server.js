/**
 * Servidor WebSocket para sincronização em tempo real
 * 
 * Este módulo configura e gerencia as conexões WebSocket para permitir
 * a sincronização em tempo real entre diferentes dispositivos e usuários.
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './config.js';

// Lista de conexões ativas
const activeConnections = new Map();

// Evento de WebSocket
const EVENTS = {
  // Eventos de dados
  DATA_UPDATED: 'data:updated',
  DATA_CREATED: 'data:created',
  DATA_DELETED: 'data:deleted',
  
  // Eventos específicos de entidades
  CUSTOMER_UPDATED: 'customer:updated',
  INVENTORY_UPDATED: 'inventory:updated',
  SERVICE_UPDATED: 'service:updated',
  
  // Eventos de usuário
  USER_CONNECTED: 'user:connected',
  USER_DISCONNECTED: 'user:disconnected'
};

/**
 * Configura o servidor WebSocket
 * @param {Object} httpServer - Servidor HTTP para anexar o WebSocket
 * @returns {Object} Instância do servidor Socket.io
 */
export function setupWebSocketServer(httpServer) {
  console.log('🔌 Configurando servidor WebSocket...');
  
  // Opções do servidor WebSocket
  const ioOptions = {
    cors: {
      origin: config.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    // Configurações adicionais para produção
    ...(config.NODE_ENV === 'production' ? {
      // Usar transporte WebSocket diretamente para melhor desempenho
      transports: ['websocket', 'polling'],
      // Compressão para reduzir o tráfego
      perMessageDeflate: true,
      // Tempo de ping para manter conexões vivas
      pingInterval: 25000,
      pingTimeout: 10000,
    } : {})
  };
  
  // Criar servidor Socket.io
  const io = new Server(httpServer, ioOptions);
  
  // Middleware para autenticação de conexões
  io.use((socket, next) => {
    try {
      // Obter token de autenticação
      const token = socket.handshake.auth.token || 
                    socket.handshake.query.token;
      
      if (!token) {
        console.log('WebSocket: conexão sem token de autenticação');
        // Permitir conexão anônima para algumas operações
        socket.user = { isAnonymous: true };
        return next();
      }
      
      // Verificar token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (!decoded) {
        return next(new Error('Token de autenticação inválido'));
      }
      
      // Armazenar informações do usuário na socket
      socket.user = decoded;
      console.log(`WebSocket: usuário autenticado: ${decoded.email || decoded.id}`);
      
      next();
    } catch (error) {
      console.error('WebSocket: erro ao autenticar conexão:', error);
      next(new Error('Falha na autenticação'));
    }
  });
  
  // Gerenciar conexões de clientes
  io.on('connection', (socket) => {
    const userId = socket.user?.id || `anon_${socket.id}`;
    
    console.log(`WebSocket: nova conexão estabelecida. ID: ${socket.id}, Usuário: ${userId}`);
    
    // Registrar conexão ativa
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(socket.id);
    
    // Notificar outros usuários sobre nova conexão
    if (!socket.user?.isAnonymous) {
      socket.broadcast.emit(EVENTS.USER_CONNECTED, { 
        userId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Configurar handlers para eventos de dados
    setupDataEventListeners(socket);
    
    // Lidar com desconexão
    socket.on('disconnect', () => {
      console.log(`WebSocket: conexão fechada. ID: ${socket.id}, Usuário: ${userId}`);
      
      // Remover da lista de conexões ativas
      if (activeConnections.has(userId)) {
        activeConnections.get(userId).delete(socket.id);
        if (activeConnections.get(userId).size === 0) {
          activeConnections.delete(userId);
        }
      }
      
      // Notificar outros usuários sobre desconexão
      if (!socket.user?.isAnonymous) {
        socket.broadcast.emit(EVENTS.USER_DISCONNECTED, { 
          userId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  console.log('✅ Servidor WebSocket configurado com sucesso');
  return io;
}

/**
 * Configura listeners para eventos de dados
 * @param {Object} socket - Conexão Socket.io
 */
function setupDataEventListeners(socket) {
  // Evento de atualização de dados
  socket.on(EVENTS.DATA_UPDATED, (data) => {
    console.log(`WebSocket: dados atualizados por ${socket.user?.id || 'anônimo'}:`, data.entityType);
    
    // Enviar para todos os outros clientes conectados
    socket.broadcast.emit(EVENTS.DATA_UPDATED, {
      entityType: data.entityType,
      entityId: data.entityId,
      updatedBy: socket.user?.id || 'anônimo',
      timestamp: new Date().toISOString(),
      data: data.data
    });
    
    // Enviar evento específico para o tipo de entidade
    switch (data.entityType) {
      case 'customers':
        socket.broadcast.emit(EVENTS.CUSTOMER_UPDATED, {
          customerId: data.entityId,
          updatedBy: socket.user?.id || 'anônimo',
          timestamp: new Date().toISOString(),
          data: data.data
        });
        break;
      case 'inventory':
        socket.broadcast.emit(EVENTS.INVENTORY_UPDATED, {
          itemId: data.entityId,
          updatedBy: socket.user?.id || 'anônimo',
          timestamp: new Date().toISOString(),
          data: data.data
        });
        break;
      case 'services':
        socket.broadcast.emit(EVENTS.SERVICE_UPDATED, {
          serviceId: data.entityId,
          updatedBy: socket.user?.id || 'anônimo',
          timestamp: new Date().toISOString(),
          data: data.data
        });
        break;
    }
  });
  
  // Evento de criação de dados
  socket.on(EVENTS.DATA_CREATED, (data) => {
    console.log(`WebSocket: novos dados criados por ${socket.user?.id || 'anônimo'}:`, data.entityType);
    
    // Enviar para todos os outros clientes conectados
    socket.broadcast.emit(EVENTS.DATA_CREATED, {
      entityType: data.entityType,
      entityId: data.entityId,
      createdBy: socket.user?.id || 'anônimo',
      timestamp: new Date().toISOString(),
      data: data.data
    });
  });
  
  // Evento de exclusão de dados
  socket.on(EVENTS.DATA_DELETED, (data) => {
    console.log(`WebSocket: dados excluídos por ${socket.user?.id || 'anônimo'}:`, data.entityType);
    
    // Enviar para todos os outros clientes conectados
    socket.broadcast.emit(EVENTS.DATA_DELETED, {
      entityType: data.entityType,
      entityId: data.entityId,
      deletedBy: socket.user?.id || 'anônimo',
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Envia uma atualização em tempo real para todos os clientes
 * @param {string} eventName - Nome do evento
 * @param {Object} data - Dados do evento
 * @param {Object} io - Instância do servidor Socket.io
 */
export function broadcastUpdate(eventName, data, io) {
  if (!io) {
    console.warn('WebSocket: tentativa de broadcast sem servidor inicializado');
    return false;
  }
  
  try {
    io.emit(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('WebSocket: erro ao transmitir atualização:', error);
    return false;
  }
}

/**
 * Obtém estatísticas de conexões ativas
 * @returns {Object} Estatísticas de conexões
 */
export function getConnectionStats() {
  // Contar conexões
  let totalConnections = 0;
  activeConnections.forEach(connections => {
    totalConnections += connections.size;
  });
  
  return {
    users: activeConnections.size,
    connections: totalConnections,
    activeUsers: Array.from(activeConnections.keys())
      .filter(id => !id.startsWith('anon_')),
    timestamp: new Date().toISOString()
  };
}

export default {
  setupWebSocketServer,
  broadcastUpdate,
  getConnectionStats,
  EVENTS
}; 