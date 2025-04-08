
import React, { createContext, useContext, useState, useEffect } from 'react';

// Criar o contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provedor de contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificação temporária, será substituída pela integração do Supabase
        const token = sessionStorage.getItem('authToken');
        if (token) {
          // Simular usuário autenticado para testes
          setUser({ id: '1', name: 'Usuário Teste', email: 'teste@example.com' });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login temporária
  const login = async (email, password) => {
    try {
      // Implementação temporária, será substituída pela integração do Supabase
      sessionStorage.setItem('authToken', 'token-temporario');
      setUser({ id: '1', name: 'Usuário Teste', email });
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: error.message };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      sessionStorage.removeItem('authToken');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, message: error.message };
    }
  };

  // Valores e funções expostos pelo contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
