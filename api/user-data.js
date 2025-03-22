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

/**
 * Handler principal para a API de dados do usuário
 */
module.exports = async (req, res) => {
  try {
    // Verificar se o usuário está autenticado
    // ... implementar verificação de autenticação real aqui ...
    const userId = req.query.userId || req.body?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    // Determinar a operação com base no método HTTP
    switch(req.method) {
      case 'GET':
        await handleGetData(req, res);
        break;
      case 'POST':
        await handleSaveData(req, res);
        break;
      case 'DELETE':
        await handleDeleteData(req, res);
        break;
      default:
        res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: `Erro no servidor: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Obtém os dados do usuário
 */
async function handleGetData(req, res) {
  const userId = req.query.userId;
  const store = req.query.store;
  const key = req.query.key;
  
  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    // Validar store
    if (!store || typeof store !== 'string') {
      return res.status(400).json({ success: false, message: 'Nome do armazenamento (store) é obrigatório e deve ser uma string' });
    }

    // Verificar se temos dados em cache
    const cacheKey = `${userId}_${store}${key ? `_${key}` : ''}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true
      });
    }

    let sql, params;
    
    // Se key for fornecido, buscar apenas esse item
    if (key) {
      // Buscar um único item
      sql = 'SELECT id, user_id, store_name, item_key, data, created_at, updated_at FROM user_data WHERE user_id = ? AND store_name = ? AND item_key = ?';
      params = [userId, store, key];
    } else {
      // Buscar todos os itens da store
      sql = 'SELECT id, user_id, store_name, item_key, data, created_at, updated_at FROM user_data WHERE user_id = ? AND store_name = ?';
      params = [userId, store];
    }

    // Executar a consulta
    const rows = await query(sql, params);
    
    // Processar os resultados
    const results = rows.map(row => {
      try {
        // Converter JSON para objeto JavaScript
        const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        
        return {
          id: row.id,
          key: row.item_key,
          ...(typeof dataObj === 'object' ? dataObj : { data: dataObj }),
          _meta: {
            created: row.created_at,
            updated: row.updated_at
          }
        };
      } catch (error) {
        console.warn(`Erro ao processar dados para item ${row.id}:`, error);
        return {
          id: row.id,
          key: row.item_key,
          data: row.data,
          _meta: {
            created: row.created_at,
            updated: row.updated_at,
            parseError: true
          }
        };
      }
    });

    // Salvar em cache
    cache.set(cacheKey, results);
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({
      success: false,
      message: `Erro ao buscar dados: ${error.message}`
    });
  }
}

/**
 * Salva os dados do usuário
 */
async function handleSaveData(req, res) {
  try {
    const userId = req.body.userId;
    const store = req.body.store;
    const key = req.body.key;
    const data = req.body.data;

    // Validar parâmetros
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    if (!store || typeof store !== 'string') {
      return res.status(400).json({ success: false, message: 'Nome do armazenamento (store) é obrigatório e deve ser uma string' });
    }

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ success: false, message: 'Chave (key) é obrigatória e deve ser uma string' });
    }

    if (data === undefined || data === null) {
      return res.status(400).json({ success: false, message: 'Dados não podem ser null ou undefined' });
    }

    // Converter dados para JSON
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    // Primeiro verificar se o item já existe
    const existingRows = await query(
      'SELECT id FROM user_data WHERE user_id = ? AND store_name = ? AND item_key = ?',
      [userId, store, key]
    );

    let result;
    let id;

    if (existingRows.length > 0) {
      // Atualizar registro existente
      id = existingRows[0].id;
      
      result = await query(
        'UPDATE user_data SET data = ?, updated_at = NOW() WHERE id = ?',
        [jsonData, id]
      );
      
      console.log(`Atualizado registro existente ID ${id}`);
    } else {
      // Gerar UUID para o novo registro
      id = uuidv4();
      
      // Inserir novo registro
      result = await query(
        'INSERT INTO user_data (id, user_id, store_name, item_key, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [id, userId, store, key, jsonData]
      );
      
      console.log(`Criado novo registro com ID ${id}`);
    }

    // Atualizar cache
    cache.invalidate(`${userId}_${store}`);
    cache.invalidate(`${userId}_${store}_${key}`);

    // Devolver resposta
    return res.status(200).json({
      success: true,
      id,
      message: existingRows.length > 0 ? 'Dados atualizados com sucesso' : 'Dados criados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    
    // Verificar erros específicos do MySQL
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'O usuário informado não existe no sistema',
        error: error.message
      });
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Este registro já existe',
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Erro ao salvar dados: ${error.message}`
    });
  }
}

/**
 * Remove os dados do usuário
 */
async function handleDeleteData(req, res) {
  try {
    const userId = req.body.userId;
    const store = req.body.store;
    const key = req.body.key;

    // Validar parâmetros
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    if (!store || typeof store !== 'string') {
      return res.status(400).json({ success: false, message: 'Nome do armazenamento (store) é obrigatório' });
    }

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ success: false, message: 'Chave (key) é obrigatória' });
    }

    // Executar a exclusão
    const result = await query(
      'DELETE FROM user_data WHERE user_id = ? AND store_name = ? AND item_key = ?',
      [userId, store, key]
    );

    // Verificar se algo foi excluído
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum dado encontrado para exclusão'
      });
    }

    // Invalidar o cache
    cache.invalidate(`${userId}_${store}`);
    cache.invalidate(`${userId}_${store}_${key}`);

    return res.status(200).json({
      success: true,
      message: 'Dados removidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir dados:', error);
    return res.status(500).json({
      success: false,
      message: `Erro ao excluir dados: ${error.message}`
    });
  }
} 