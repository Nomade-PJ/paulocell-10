/**
 * Serviço de Banco de Dados com Supabase
 * 
 * Este serviço fornece métodos para interagir com o banco de dados PostgreSQL do Supabase.
 * Substitui a implementação anterior baseada em MongoDB.
 */

import supabase from '../lib/supabase';

class DatabaseService {
  /**
   * Busca todos os registros de uma tabela
   * @param {string} table Nome da tabela
   * @param {Object} options Opções de consulta
   * @returns {Promise<Array>} Registros encontrados
   */
  async getAll(table, options = {}) {
    try {
      let query = supabase.from(table).select('*');
      
      // Aplicar filtros se fornecidos
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      // Aplicar ordenação
      if (options.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      }
      
      // Aplicar paginação
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar registros da tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca um registro pelo ID
   * @param {string} table Nome da tabela
   * @param {string|number} id ID do registro
   * @returns {Promise<Object>} Registro encontrado
   */
  async getById(table, id) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar registro ${id} da tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo registro
   * @param {string} table Nome da tabela
   * @param {Object} data Dados do registro
   * @returns {Promise<Object>} Registro criado
   */
  async create(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      
      return result;
    } catch (error) {
      console.error(`Erro ao criar registro na tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Atualiza um registro existente
   * @param {string} table Nome da tabela
   * @param {string|number} id ID do registro
   * @param {Object} data Dados a atualizar
   * @returns {Promise<Object>} Registro atualizado
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar registro ${id} da tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove um registro
   * @param {string} table Nome da tabela
   * @param {string|number} id ID do registro
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir registro ${id} da tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Executa uma consulta personalizada com RPC
   * @param {string} functionName Nome da função no banco
   * @param {Object} params Parâmetros da função
   * @returns {Promise<any>} Resultado da função
   */
  async callFunction(functionName, params = {}) {
    try {
      const { data, error } = await supabase
        .rpc(functionName, params);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Erro ao chamar função ${functionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca registros com uma consulta filtrada
   * @param {string} table Nome da tabela
   * @param {Object} filters Filtros a aplicar
   * @returns {Promise<Array>} Registros encontrados
   */
  async findByFilters(table, filters = {}) {
    try {
      let query = supabase.from(table).select('*');
      
      // Aplicar cada filtro
      Object.entries(filters).forEach(([key, value]) => {
        // Suporte para diferentes operadores como eq, neq, gt, lt, etc.
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([operator, operand]) => {
            switch (operator) {
              case 'eq':
                query = query.eq(key, operand);
                break;
              case 'neq':
                query = query.neq(key, operand);
                break;
              case 'gt':
                query = query.gt(key, operand);
                break;
              case 'gte':
                query = query.gte(key, operand);
                break;
              case 'lt':
                query = query.lt(key, operand);
                break;
              case 'lte':
                query = query.lte(key, operand);
                break;
              case 'in':
                query = query.in(key, operand);
                break;
              case 'like':
                query = query.like(key, `%${operand}%`);
                break;
              case 'ilike':
                query = query.ilike(key, `%${operand}%`);
                break;
            }
          });
        } else {
          // Por padrão, usar igualdade
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar registros com filtros da tabela ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Salva dados do usuário (metadados)
   * @param {string} key Chave do dado
   * @param {any} value Valor a salvar
   * @returns {Promise<Object>} Dado salvo
   */
  async saveUserData(key, value) {
    try {
      // Obter usuário atual do Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');
      
      // Verificar se já existe um registro
      const { data: existingData } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('key', key)
        .maybeSingle();
      
      if (existingData) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('user_data')
          .update({ value })
          .eq('user_id', user.id)
          .eq('key', key)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('user_data')
          .insert([{
            user_id: user.id,
            key,
            value
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      }
    } catch (error) {
      console.error(`Erro ao salvar dados do usuário (${key}):`, error);
      throw error;
    }
  }
  
  /**
   * Busca dados do usuário (metadados)
   * @param {string} key Chave do dado
   * @returns {Promise<any>} Valor armazenado
   */
  async getUserData(key) {
    try {
      // Obter usuário atual do Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', key)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.value;
    } catch (error) {
      console.error(`Erro ao buscar dados do usuário (${key}):`, error);
      throw error;
    }
  }
}

// Criar instância única do serviço
const databaseService = new DatabaseService();

export default databaseService; 