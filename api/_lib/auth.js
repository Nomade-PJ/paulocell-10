import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Configurações para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'd8b66e199e08aefd9e5bf091c3a77fefdf8e0a51c3b729de1a3cb096a1f0d825';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '1b2e9ac8d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Lista de palavras-chave válidas (em produção, isso viria do banco de dados)
const validKeywords = [
  { hash: '$2a$10$rVt4sMkv.lJ/H.FOh8HuZ.OeejEcvKZSvc/WW9Gk3T/Tx4zIFO28i', userId: 1 }, // 'admin123'
  { hash: '$2a$10$TH/zGHbpI6lsOx9NXfRrfO2J1L/9X0vy7Fwob0OCMvYBJEf.gvYpW', userId: 2 }, // 'manager456'
  { hash: '$2a$10$YSdCaIoFvzH3h3yQkP5JiOXDGrCAuEFgK0bJJIev9dyPtRf9ik82C', userId: 3 }  // 'user789'
];

// Usuários correspondentes às palavras-chave (em produção, viriam do banco de dados)
const users = [
  { id: 1, username: 'admin', name: 'Administrador', role: 'admin' },
  { id: 2, username: 'gerente', name: 'Gerente', role: 'manager' },
  { id: 3, username: 'usuario', name: 'Usuário', role: 'user' }
];

/**
 * Verifica uma palavra-chave com as palavras-chave válidas
 * @param {string} keyword - A palavra-chave a ser verificada
 * @returns {object|null} - Objeto contendo userId se válido, ou null se inválido
 */
export async function validateKeyword(keyword) {
  if (!keyword) {
    return null;
  }

  // Verifica a palavra-chave com cada hash
  for (const validKeyword of validKeywords) {
    try {
      const isValid = await bcrypt.compare(keyword, validKeyword.hash);
      if (isValid) {
        return { userId: validKeyword.userId };
      }
    } catch (error) {
      console.error('Erro ao verificar palavra-chave:', error);
    }
  }

  return null;
}

/**
 * Busca informações do usuário pelo ID
 * @param {number} userId - ID do usuário
 * @returns {object|null} - Dados do usuário ou null se não encontrado
 */
export function getUserById(userId) {
  return users.find(user => user.id === userId) || null;
}

/**
 * Gera tokens de acesso e atualização para um usuário
 * @param {object} user - Dados do usuário
 * @returns {object} - Tokens de acesso e atualização
 */
export function generateTokens(user) {
  const sessionId = uuidv4();
  
  // Payload para o token JWT
  const payload = {
    sub: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    sessionId
  };

  // Gerando token JWT
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  // Gerando token de atualização
  const refreshToken = jwt.sign(
    { sub: user.id, sessionId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return {
    token,
    refreshToken,
    sessionId
  };
}

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT a ser verificado
 * @returns {object} - Payload decodificado ou erro
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

/**
 * Verifica um token de autorização a partir dos cabeçalhos da requisição
 * @param {object} req - Objeto de requisição
 * @returns {object} - Payload do token decodificado
 */
export function verifyAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido ou inválido');
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

/**
 * Verifica e decodifica um token de atualização
 * @param {string} refreshToken - Token de atualização a ser verificado
 * @returns {object} - Payload decodificado ou erro
 */
export function verifyRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Token de atualização inválido ou expirado');
  }
} 