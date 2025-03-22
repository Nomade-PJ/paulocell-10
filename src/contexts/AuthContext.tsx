import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { clearLocalStorageCache } from '../services/userDataService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar se o usuário está autenticado ao carregar o contexto
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('[Auth] Usuário restaurado do localStorage:', userData.name);
      } catch (e) {
        localStorage.removeItem('user');
        console.error('[Auth] Erro ao restaurar sessão:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Tentando login para:', email);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Tentar obter detalhes do erro
        let errorMessage = 'Falha na autenticação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Se não conseguir parse do JSON, usar mensagem genérica
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Falha na autenticação');
      }

      // Atualizar estado do usuário
      setUser(data.user);
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('[Auth] Login bem-sucedido para:', data.user.name);
      
      // Limpar cache local antigo para este usuário
      try {
        console.log('[Auth] Limpando cache local antigo para o usuário');
        clearLocalStorageCache(data.user.id);
      } catch (cacheError) {
        console.warn('[Auth] Erro ao limpar cache:', cacheError);
      }
      
      // Redirecionar para a página inicial após login
      router.push('/');
      
      // Mostrar mensagem de boas-vindas
      toast.success(`Bem-vindo, ${data.user.name}!`);
    } catch (err: any) {
      console.error('[Auth] Erro no login:', err);
      setError(err.message);
      toast.error(`Erro no login: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('[Auth] Usuário deslogado');
    
    // Redirecionar para a página de login
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
