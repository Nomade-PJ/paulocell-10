import express from 'express';
import customerRoutes from './customerRoutes.js';
import authRoutes from './authRoutes.js';
// Importar outras rotas à medida que são criadas

const router = express.Router();

// Middleware para todas as rotas da API
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} [${new Date().toISOString()}]`);
  next();
});

// Health check da API
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas para entidades
router.use('/customers', customerRoutes);
router.use('/auth', authRoutes);
// Adicionar outras rotas aqui

// Middleware para rotas não encontradas
router.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

export default router;