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

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.production' });

// Porta para o servidor
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware para parsing de JSON e CORS
app.use(express.json());
app.use(cors());

// Configurar middleware de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'paulocell-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies em produção
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api', apiRoutes);

// Servir arquivos estáticos da pasta dist (resultado do build)
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware para cabeçalhos de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Para qualquer rota não encontrada na API, retorna o index.html (para suportar roteamento do React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Detalhes do erro não disponíveis' : err.message
  });
});

// Inicializar o banco de dados antes de iniciar o servidor
initializeDatabase()
  .then(() => {
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em http://localhost:${PORT}/api`);
      console.log(`Aplicação disponível em http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Falha ao inicializar o servidor:', error);
    process.exit(1);
  });