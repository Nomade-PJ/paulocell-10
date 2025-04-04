/**
 * Middleware de autenticação para validar tokens JWT
 * Este middleware garante que todas as requisições à API sejam autenticadas
 */

import jwt from 'jsonwebtoken';
import config from './config.js';

/**
 * Middleware que valida o token JWT em cada requisição
 * @param {Object} req - Objeto da requisição Express
 * @param {Object} res - Objeto da resposta Express
 * @param {Function} next - Função para prosseguir para o próximo middleware
 */
export const validateToken = (req, res, next) => {
  // Extrair token do header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN
  
  // Se não há token, retornar erro 401
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token não fornecido',
      message: 'Autenticação necessária para acessar este recurso'
    });
  }
  
  try {
    // Verificar token com a chave secreta
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Adicionar o usuário decodificado ao objeto da requisição
    req.user = decoded;
    
    // Prosseguir para o próximo middleware
    next();
  } catch (error) {
    console.error(`[Auth] Erro na validação do token: ${error.message}`);
    
    // Tipos específicos de erros
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        expired: true,
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'Credenciais inválidas. Por favor, faça login novamente.'
      });
    }
    
    // Outros erros de autenticação
    return res.status(401).json({
      success: false,
      error: 'Falha na autenticação',
      message: error.message
    });
  }
};

/**
 * Middleware opcional que verifica o token mas não bloqueia a requisição
 * Útil para rotas que podem ser acessadas com ou sem autenticação
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Se não há token, apenas continua com req.user indefinido
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Não bloqueia a requisição mesmo se o token for inválido
    console.warn(`[Auth] Token inválido em rota opcional: ${error.message}`);
  }
  
  next();
};

/**
 * Middleware que verifica se o usuário tem a função (role) necessária
 * @param {string[]} roles - Array de funções permitidas
 */
export const requireRoles = (roles) => {
  return (req, res, next) => {
    // Primeiro verifica se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticação necessária',
        message: 'Você precisa estar autenticado para acessar este recurso'
      });
    }
    
    // Verifica se o usuário tem uma das funções necessárias
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso proibido',
        message: 'Você não tem permissão para acessar este recurso'
      });
    }
    
    // Se tudo estiver correto, prossegue
    next();
  };
};

export default {
  validateToken,
  optionalAuth,
  requireRoles
}; 