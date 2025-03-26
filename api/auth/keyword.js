import { validateKeyword, getUserById, generateTokens } from '../_lib/auth';

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
    const { keyword } = req.body;

    // Verificar se a palavra-chave foi fornecida
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Palavra-chave não fornecida'
      });
    }

    // Validar a palavra-chave
    const validationResult = await validateKeyword(keyword);
    
    if (!validationResult) {
      return res.status(401).json({
        success: false,
        message: 'Palavra-chave inválida'
      });
    }

    // Buscar dados do usuário
    const user = getUserById(validationResult.userId);
    
    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do usuário'
      });
    }

    // Gerar tokens
    const { token, refreshToken, sessionId } = generateTokens(user);

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Autenticação bem-sucedida',
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role
        },
        token,
        refreshToken,
        sessionId
      }
    });

  } catch (error) {
    console.error('Erro durante autenticação:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 