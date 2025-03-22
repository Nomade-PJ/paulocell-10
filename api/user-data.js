/**
 * API para gerenciar dados do usuário no banco de dados
 */

const { query } = require('../server/db/db');
const { v4: uuidv4 } = require('uuid');

// Sanitização básica para evitar SQL injection
const escapeString = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/[\0\n\r\b\t\\'"\x1a]/g, (s) => {
    switch (s) {
      case "\0": return "\\0";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\b": return "\\b";
      case "\t": return "\\t";
      case "\x1a": return "\\Z";
      case "'": return "''";
      case '"': return '""';
      default: return "\\" + s;
    }
  });
};

// Configurar o cache para evitar múltiplas consultas desnecessárias
const cache = {
  items: {},
  ttl: 5 * 60 * 1000, // 5 minutos
  set: function(key, data) {
    this.items[key] = {
      data,
      timestamp: Date.now()
    };
  },
  get: function(key) {
    const item = this.items[key];
    if (!item) return null;
    
    // Verificar se expirou
    if (Date.now() - item.timestamp > this.ttl) {
      delete this.items[key];
      return null;
    }
    
    return item.data;
  },
  invalidate: function(key) {
    if (key) {
      delete this.items[key];
    } else {
      this.items = {};
    }
  }
};

// Adicionar cabeçalhos CORS para permitir requisições cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Cache para reduzir número de consultas ao banco
const dataCache = {};

/**
 * Handler principal para a API de dados do usuário
 */
module.exports = async (req, res) => {
  try {
    // Verificar se é uma requisição OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).set(corsHeaders).send('OK');
      return;
    }

    // Adicionar cabeçalhos CORS em todas as respostas
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Verificar se o userId foi fornecido
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    // Processar requisição com base no método HTTP
    switch (req.method) {
      case 'GET':
        return await handleGetData(req, res);
      case 'POST':
        return await handleSaveData(req, res);
      case 'DELETE':
        return await handleDeleteData(req, res);
      default:
        return res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao processar requisição de dados do usuário:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtém os dados do usuário
 */
async function handleGetData(req, res) {
  const { userId, store } = req.query;

  // Validar parâmetros
  if (!store) {
    return res.status(400).json({ success: false, message: 'Nome do armazenamento (store) é obrigatório' });
  }

  console.log(`[DIAGNÓSTICO] Buscando dados do banco para usuário=${userId}, store=${store}`);
  
  try {
    // Buscar dados do usuário no banco de dados
    const { db } = await import('../lib/db');
    
    console.log(`[DB] Executando consulta para buscar dados do usuário ${userId} na store ${store}`);
    
    const query = `
      SELECT * FROM user_data 
      WHERE user_id = ? AND store_name = ?
      ORDER BY updated_at DESC
    `;
    
    const results = await db.query(query, [userId, store]);
    
    console.log(`[DB] Consulta retornou ${results.length} resultados`);
    
    // Processar os resultados para um formato mais amigável
    const data = results.map(item => {
      try {
        // Tentar converter a string JSON em objeto
        const parsedData = JSON.parse(item.data);
        return {
          id: item.id,
          key: item.item_key,
          ...parsedData,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      } catch (e) {
        // Se não for um JSON válido, retornar o dado bruto
        return {
          id: item.id,
          key: item.item_key,
          data: item.data,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }
    });

    console.log(`[DB] Retornando ${data.length} itens convertidos`);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return res.status(500).json({ success: false, message: `Erro de banco de dados: ${error.message}` });
  }
}

/**
 * Salva os dados do usuário
 */
async function handleSaveData(req, res) {
  const { userId } = req.query;
  const { store, key, data } = req.body;

  // Validar dados obrigatórios
  if (!store || !key || data === undefined) {
    return res.status(400).json({ success: false, message: 'Store, key e data são obrigatórios' });
  }

  try {
    console.log(`[DB] Salvando dados para usuário ${userId}, store=${store}, key=${key}`);
    
    // Converter os dados para JSON se for objeto ou array
    const jsonData = typeof data === 'object' ? JSON.stringify(data) : data;

    // Buscar se já existe um registro para este usuário, store e key
    const { db } = await import('../lib/db');
    
    const existingQuery = `
      SELECT id FROM user_data 
      WHERE user_id = ? AND store_name = ? AND item_key = ?
    `;
    
    const existing = await db.query(existingQuery, [userId, store, key]);
    
    let result;
    let id;
    
    if (existing && existing.length > 0) {
      // Atualizar registro existente
      id = existing[0].id;
      const updateQuery = `
        UPDATE user_data 
        SET data = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      
      result = await db.query(updateQuery, [jsonData, id]);
      console.log(`[DB] Atualizado registro existente com ID ${id}`);
    } else {
      // Inserir novo registro
      const insertQuery = `
        INSERT INTO user_data (user_id, store_name, item_key, data, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      result = await db.query(insertQuery, [userId, store, key, jsonData]);
      id = result.insertId;
      console.log(`[DB] Criado novo registro com ID ${id}`);
    }

    // Invalidar o cache para forçar uma nova leitura do banco
    const cacheKey = `${userId}_${store}`;
    if (dataCache[cacheKey]) {
      delete dataCache[cacheKey];
      console.log(`[Cache] Cache invalidado para ${cacheKey}`);
    }

    return res.status(200).json({
      success: true,
      id,
      message: existing && existing.length > 0 ? 'Dados atualizados' : 'Dados criados'
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return res.status(500).json({ success: false, message: `Erro de banco de dados: ${error.message}` });
  }
}

/**
 * Remove os dados do usuário
 */
async function handleDeleteData(req, res) {
  const { userId } = req.query;
  const { store, key } = req.body;

  // Validar dados obrigatórios
  if (!store || !key) {
    return res.status(400).json({ success: false, message: 'Store e key são obrigatórios' });
  }

  try {
    console.log(`[DB] Removendo dados para usuário ${userId}, store=${store}, key=${key}`);
    
    // Excluir registro
    const { db } = await import('../lib/db');
    
    const deleteQuery = `
      DELETE FROM user_data 
      WHERE user_id = ? AND store_name = ? AND item_key = ?
    `;
    
    const result = await db.query(deleteQuery, [userId, store, key]);

    // Invalidar o cache para forçar uma nova leitura do banco
    const cacheKey = `${userId}_${store}`;
    if (dataCache[cacheKey]) {
      delete dataCache[cacheKey];
      console.log(`[Cache] Cache invalidado para ${cacheKey}`);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum dado encontrado com estas informações'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dados removidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover dados:', error);
    return res.status(500).json({ success: false, message: `Erro de banco de dados: ${error.message}` });
  }
} 