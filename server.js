const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const http = require('http');

// Carregar variáveis de ambiente do arquivo .env.production
try {
  const envConfig = dotenv.config({ path: '.env.production' });
  if (envConfig.error) {
    console.warn('⚠️ Arquivo .env.production não encontrado');
  } else {
    console.log('✅ Configurações de ambiente de produção carregadas');
    console.log('📝 NODE_ENV:', process.env.NODE_ENV);
    console.log('📝 SITE_APP_URL:', process.env.SITE_APP_URL);
    console.log('📝 PORT:', process.env.PORT);
    console.log('📝 HOST:', process.env.HOST);
  }
} catch (error) {
  console.warn('⚠️ Erro ao carregar arquivo .env.production:', error.message);
}

// Importar a configuração centralizada
const config = require('./api/_lib/config.js').default;

const app = express();
// Definir portas a tentar em ordem
const PORTS_TO_TRY = [
  parseInt(process.env.PORT) || 3000,  // Primeira opção: porta configurada ou 3000
  8080,
  8081,
  8082
];
const HOST = process.env.HOST || '0.0.0.0';

// Middleware para servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Configurar middleware para JSON e formulários
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração das APIs
const setupApiRoutes = () => {
  console.log('🔌 Configurando rotas da API...');
  
  // Adicionar rotas da API aqui quando disponíveis
  // app.use('/api/customers', require('./api/customers'));
  // app.use('/api/inventory', require('./api/inventory'));
  
  // Health check endpoint
  app.get('/api/health-check', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};

// Para qualquer rota, incluindo a raiz, retorna o index.html da pasta dist (para suportar roteamento do React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Função para tentar iniciar o servidor em várias portas
function tryPorts(portIndex = 0) {
  if (portIndex >= PORTS_TO_TRY.length) {
    console.error('❌ Todas as portas estão ocupadas. Não foi possível iniciar o servidor.');
    process.exit(1);
    return;
  }
  
  const port = PORTS_TO_TRY[portIndex];
  console.log(`🔄 Tentando iniciar o servidor na porta ${port}...`);
  
  // Criar servidor HTTP para que possamos anexar WebSockets
  const server = http.createServer(app);
  
  // Importar e configurar WebSockets
  const setupWebSocketServer = async () => {
    try {
      const wsModule = await import('./api/_lib/websocket-server.js');
      const io = wsModule.setupWebSocketServer(server);
      
      // Tornar a instância io disponível globalmente
      app.set('socketio', io);
      
      console.log('✅ WebSockets configurados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao configurar WebSockets:', error);
    }
  };
  
  // Configurar API e WebSockets
  setupApiRoutes();
  setupWebSocketServer();
  
  server.listen(port, HOST);
  
  server.on('listening', () => {
    console.log(`🚀 Servidor rodando em ${HOST}:${port}`);
    
    // Usar a URL do site configurada no arquivo .env.production
    let siteUrl = process.env.SITE_APP_URL;
    if (!siteUrl) {
      siteUrl = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}`;
    }
    
    console.log(`Aplicação disponível em ${siteUrl}`);
    console.log(`API disponível em ${siteUrl}/api`);
    console.log(`WebSockets disponíveis em ${siteUrl}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ A porta ${port} já está em uso.`);
      server.close();
      // Tentar a próxima porta
      tryPorts(portIndex + 1);
    } else {
      console.error(`❌ Erro ao iniciar o servidor na porta ${port}:`, err);
      process.exit(1);
    }
  });
}

// Iniciar o processo de tentar portas
tryPorts();

// Exporta a app para ser usada em outros ambientes
module.exports = app; 