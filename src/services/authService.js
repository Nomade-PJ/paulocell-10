/**
 * Serviço de Autenticação com Supabase
 * 
 * Este serviço gerencia a autenticação de usuários utilizando o Supabase Auth.
 */

import supabase from '../lib/supabase';

const authService = {
  /**
   * Faz login com email e senha
   * @param {string} email Email do usuário
   * @param {string} password Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e sessão
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        success: true,
        session: data.session,
        user: data.user
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login. Verifique suas credenciais.'
      };
    }
  },
  
  /**
   * Faz login com o Google
   * @returns {Promise<void>}
   */
  async loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // O redirecionamento é gerenciado pelo Supabase
      return { success: true };
    } catch (error) {
      console.error('Erro no login com Google:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login com Google.'
      };
    }
  },
  
  /**
   * Faz logout do usuário atual
   * @returns {Promise<Object>} Resultado da operação
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer logout.'
      };
    }
  },
  
  /**
   * Obtém a sessão atual
   * @returns {Promise<Object|null>} Sessão atual ou null se não estiver autenticado
   */
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return data.session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  },
  
  /**
   * Obtém o usuário atual
   * @returns {Promise<Object|null>} Usuário atual ou null se não estiver autenticado
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return data.user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {Promise<boolean>} True se estiver autenticado
   */
  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return !!session;
  },
  
  /**
   * Registra um novo usuário
   * @param {string} email Email do usuário
   * @param {string} password Senha do usuário
   * @param {Object} userData Dados adicionais do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  async register(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Metadados do usuário
        }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao registrar usuário.'
      };
    }
  }
};

export default authService; 