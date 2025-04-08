/**
 * Configurações da aplicação
 */

export const appConfig = {
  // URL base da API
  API_URL: '/api',
  
  // Título da aplicação
  APP_TITLE: 'Paulo Cell',
  
  // Versão da aplicação
  APP_VERSION: '1.0.0',
  
  // Modo de operação
  MODE: import.meta.env.MODE || 'development',
  
  // Configurações de sincronização
  SYNC: {
    // Intervalo de sincronização automática (em minutos)
    AUTO_SYNC_INTERVAL: 5
  },
  
  // Configurações de armazenamento local
  STORAGE: {
    // Prefixo para chaves de localStorage
    PREFIX: 'pauloCell_',
    
    // Tempo de expiração do cache (em minutos)
    CACHE_EXPIRATION: 60
  }
}; 