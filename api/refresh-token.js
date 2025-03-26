import { verifyRefreshToken, getUserById, generateTokens } from './_lib/auth';

// Variáveis de ambiente para tokens
const JWT_SECRET = process.env.JWT_SECRET || 'd8b66e199e08aefd9e5bf091c3a77fefdf8e0a51c3b729de1a3cb096a1f0d825';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '8h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Lidar com requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { refreshToken } = req.body;

    // Verificar se o refresh token foi fornecido
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de atualização não fornecido'
      });
    }

    // Verificar e decodificar o refresh token
    let decodedToken;
    try {
      decodedToken = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token de atualização inválido ou expirado'
      });
    }

    // Obter o ID do usuário do token decodificado
    const userId = decodedToken.sub;
    
    // Buscar o usuário no sistema
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Extrair o sessionId do token anterior, se disponível
    const oldSessionId = decodedToken.sessionId;
    
    // Gerar novos tokens, preservando o sessionId se disponível
    const tokensData = generateTokens({
      ...user,
      sessionId: oldSessionId
    });

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role
        },
        token: tokensData.token,
        refreshToken: tokensData.refreshToken,
        sessionId: tokensData.sessionId
      }
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 