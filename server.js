// Servidor Express para hospedar a aplicação React e a API em produção
import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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

// Middleware para logging detalhado em desenvolvimento
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Mock da API para permitir login
app.post('/api/auth/keyword', (req, res) => {
  const { keyword } = req.body;
  
  console.log('Tentativa de login com palavra-chave:', keyword);
  
  // Verificar se é uma das palavras-chave padrão (sem hash para teste)
  if (keyword === 'paulocell@admin1' || keyword === 'milena@admin2' || keyword === 'nicolas@admin3') {
    // Usuário padrão para teste
    const user = {
      id: '1',
      name: 'Usuário de Teste',
      email: 'teste@paulocell.com',
      role: 'admin'
    };
    
    console.log('Login bem-sucedido para:', user.name);
    
    res.status(200).json({
      success: true,
      message: 'Autenticação bem-sucedida',
      user,
      token: 'token-de-teste-123',
      refreshToken: 'refresh-token-de-teste-123',
      sessionId: 'session-id-de-teste-123'
    });
  } else {
    console.log('Palavra-chave inválida');
    res.status(401).json({
      success: false,
      message: 'Palavra-chave inválida'
    });
  }
});

// Configuração de MIME types corretos para JavaScript modules
express.static.mime.define({
  'text/javascript': ['js', 'mjs'],
  'application/javascript': ['js', 'mjs']
});

// Obter o diretório atual para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos da pasta dist (resultado do build)
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0, // Cache em produção
  setHeaders: (res, path) => {
    // Configurar o tipo MIME correto para arquivos JavaScript
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

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

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  console.log(`Aplicação disponível em http://localhost:${PORT}`);
  memoryStats();
});