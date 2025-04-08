import express from 'express';
const router = express.Router();

// Importar rotas
import customerRoutes from './customerRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import syncRoutes from './syncRoutes.js';
import authRoutes from './authRoutes.js';

// Importar rotas de documentos e estatísticas
import * as documentRoutesModule from './documentRoutes.js';
import * as statisticsRoutesModule from './statisticsRoutes.js';

// Converter módulos CommonJS para compatibilidade com ESM
const documentRoutes = documentRoutesModule.default || documentRoutesModule;
const statisticsRoutes = statisticsRoutesModule.default || statisticsRoutesModule;

// Middleware para todas as rotas da API
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} [${new Date().toISOString()}]`);
  next();
});

// Rota de health check
router.get('/health', (req, res) => {
  console.log('Health check solicitado');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Paulo Cell API',
    database: 'connected'
  });
});

// Rota raiz
router.get('/', (req, res) => {
  res.json({
    message: 'API do Paulo Cell',
    version: '1.0.0',
    docs: 'Servidor do sistema Paulo Cell para gerenciamento de assistência técnica',
    endpoints: [
      '/api/customers',
      '/api/devices',
      '/api/services',
      '/api/inventory',
      '/api/settings',
      '/api/sync',
      '/api/auth',
      '/api/documents',
      '/api/statistics'
    ]
  });
});

// Registrar rotas
router.use('/customers', customerRoutes);
router.use('/devices', deviceRoutes);
router.use('/services', serviceRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/settings', settingsRoutes);
router.use('/sync', syncRoutes);
router.use('/auth', authRoutes);

// Rotas de documentos e estatísticas
router.use('/documents', documentRoutes);
router.use('/statistics', statisticsRoutes);

// Middleware para rotas não encontradas
router.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

export default router;