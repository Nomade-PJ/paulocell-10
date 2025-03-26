import { verifyAuthHeader } from '../_lib/auth';

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Lidar com requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const user = verifyAuthHeader(req);
    
    // Em uma implementação real, buscaríamos esses dados no banco de dados
    // Aqui estamos retornando dados estáticos para demonstração
    
    const stats = {
      services: {
        today: 5,
        pending: 12,
        completed: 28
      },
      inventory: {
        total: 150,
        lowStock: 8
      },
      revenue: {
        today: 1250.75,
        week: 6870.50,
        month: 24350.00
      }
    };
    
    return res.status(200).json({
      success: true,
      data: stats,
      user
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    
    if (error.message === 'Token não fornecido ou inválido' || error.message === 'Token inválido ou expirado') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
} 