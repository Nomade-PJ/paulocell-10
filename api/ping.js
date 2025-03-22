/**
 * API para verificar a disponibilidade do servidor e banco de dados
 * Utilizado como ponto de diagnóstico para o cliente
 */

// Adicionar cabeçalhos CORS para permitir requisições cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(req, res) {
  // Adicionar cabeçalhos CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Verificar se é uma requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).set(corsHeaders).send('OK');
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    });
  }

  // Preparar resposta
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    server: 'online',
    database: 'unknown'
  };

  try {
    // Testar conexão com o banco de dados
    const { db } = await import('../lib/db');
    
    // Executar uma consulta simples para verificar conexão
    await db.query('SELECT 1');
    
    response.database = 'connected';
  } catch (error) {
    console.error('Erro ao verificar conexão com o banco de dados:', error);
    response.database = 'error';
    response.databaseError = error.message;
  }

  // Retornar resposta
  return res.status(200).json(response);
} 