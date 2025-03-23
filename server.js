// Servidor Express para hospedar a aplicação React e a API em produção
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initializeDatabase } from './server/db.js';
import apiRoutes from './server/routes/index.js';

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente - tenta diferentes locais para compatibilidade com cPanel
try {
  // Primeiro tenta o .env.production
  dotenv.config({ path: '.env.production' });
  console.log('Configurações carregadas de .env.production');
} catch (e) {
  try {
    // Se falhar, tenta .env
    dotenv.config();
    console.log('Configurações carregadas de .env');
  } catch (e) {
    console.log('Não foi possível carregar arquivo .env, usando variáveis de ambiente do sistema');
  }
}

// Porta para o servidor - padrão para cPanel e ambientes Node
const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// Verificar memória disponível
const memoryStats = () => {
  const used = process.memoryUsage();
  console.log(`Uso de memória:
    RSS: ${Math.round(used.rss / 1024 / 1024)} MB
    Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB
    Heap Usado: ${Math.round(used.heapUsed / 1024 / 1024)} MB
    External: ${Math.round(used.external / 1024 / 1024)} MB`);
};

// Exibir memória no início
memoryStats();

const app = express();

// Middleware para parsing de JSON e CORS com opções mais flexíveis
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN || true : true,
  credentials: true
}));

// Configurar middleware de sessão mais seguro
app.use(session({
  secret: process.env.SESSION_SECRET || 'paulocell-secret-key-for-production-environment',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Middleware para logging detalhado em desenvolvimento
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Rotas da API
app.use('/api', apiRoutes);

// Servir arquivos estáticos da pasta dist (resultado do build)
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 // Cache em produção
}));

// Middleware para cabeçalhos de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Para ambiente de produção, configurar CSP
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  }
  
  next();
});

// Verificar periodicamente o uso de memória (a cada 10 minutos)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    memoryStats();
    // Opcionalmente, forçar coleta de lixo se disponível
    if (global.gc) {
      global.gc();
      console.log('Coleta de lixo forçada executada');
    }
  }, 10 * 60 * 1000);
}

// Para qualquer rota não encontrada na API, retorna o index.html (para suportar roteamento do React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Middleware de tratamento de erros global com mais detalhes para debugging
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERRO: ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Detalhes do erro não disponíveis' : err.message,
    timestamp
  });
});

// Inicializar o banco de dados antes de iniciar o servidor
console.log('Inicializando banco de dados...');
initializeDatabase()
  .then(() => {
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
      console.log(`API disponível em http://localhost:${PORT}/api`);
      console.log(`Aplicação disponível em http://localhost:${PORT}`);
      memoryStats();
    });
  })
  .catch(error => {
    console.error('Falha ao inicializar o servidor:', error);
    process.exit(1);
  });

// Tratamento de erro não capturado
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  memoryStats();
  // Em produção, não encerre imediatamente para permitir que as solicitações em andamento sejam concluídas
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Tratamento de rejeição de promise não capturada
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'Razão:', reason);
  memoryStats();
});