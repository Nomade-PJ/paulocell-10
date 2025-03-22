import { query } from './db.js';

export default async function handler(req, res) {
  try {
    // Definir cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Responder ao método preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Verificar se o userId está presente
    const userId = req.query.userId || (req.body && req.body.userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    // GET: Buscar dados do usuário
    if (req.method === 'GET') {
      try {
        const store = req.query.store || 'user_data';
        console.log(`Buscando dados do usuário ${userId} na store ${store}`);
        
        // Buscar dados do usuário na tabela user_data
        const data = await query(
          'SELECT * FROM user_data WHERE user_id = ? AND store_name = ?',
          [userId, store]
        );
        
        if (data.length === 0) {
          return res.status(200).json({ data: [] });
        }
        
        // Extrair e processar os dados JSON armazenados
        const processedData = data.map(item => {
          try {
            const parsedData = JSON.parse(item.data);
            return {
              id: item.id,
              key: item.item_key,
              ...parsedData
            };
          } catch (e) {
            return {
              id: item.id,
              key: item.item_key,
              data: item.data
            };
          }
        });
        
        return res.status(200).json({ data: processedData });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return res.status(500).json({ 
          message: 'Erro ao buscar dados do usuário',
          error: error.message
        });
      }
    }
    
    // POST: Salvar dados do usuário
    if (req.method === 'POST') {
      try {
        const { store, key, data } = req.body;
        
        if (!store || !key || !data) {
          return res.status(400).json({ 
            message: 'Parâmetros incompletos. Necessário: store, key e data'
          });
        }
        
        console.log(`Salvando dados para usuário ${userId} na store ${store}`);
        
        // Converter dados para string JSON
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
        
        // Verificar se já existe um registro com esta chave
        const existingData = await query(
          'SELECT id FROM user_data WHERE user_id = ? AND store_name = ? AND item_key = ?',
          [userId, store, key]
        );
        
        if (existingData.length > 0) {
          // Atualizar registro existente
          await query(
            'UPDATE user_data SET data = ?, updated_at = NOW() WHERE id = ?',
            [jsonData, existingData[0].id]
          );
          
          return res.status(200).json({ 
            message: 'Dados atualizados com sucesso',
            id: existingData[0].id
          });
        } else {
          // Inserir novo registro
          const result = await query(
            'INSERT INTO user_data (user_id, store_name, item_key, data, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [userId, store, key, jsonData]
          );
          
          return res.status(201).json({ 
            message: 'Dados salvos com sucesso',
            id: result.insertId
          });
        }
      } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        return res.status(500).json({ 
          message: 'Erro ao salvar dados do usuário',
          error: error.message
        });
      }
    }
    
    // DELETE: Remover dados do usuário
    if (req.method === 'DELETE') {
      try {
        const { store, key } = req.body;
        
        if (!store || !key) {
          return res.status(400).json({ 
            message: 'Parâmetros incompletos. Necessário: store e key'
          });
        }
        
        console.log(`Removendo dados do usuário ${userId} na store ${store}, key ${key}`);
        
        // Remover dados do banco
        const result = await query(
          'DELETE FROM user_data WHERE user_id = ? AND store_name = ? AND item_key = ?',
          [userId, store, key]
        );
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Dados não encontrados' });
        }
        
        return res.status(200).json({ message: 'Dados removidos com sucesso' });
      } catch (error) {
        console.error('Erro ao remover dados do usuário:', error);
        return res.status(500).json({ 
          message: 'Erro ao remover dados do usuário',
          error: error.message
        });
      }
    }

    // Método não suportado
    return res.status(405).json({ message: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de dados do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 