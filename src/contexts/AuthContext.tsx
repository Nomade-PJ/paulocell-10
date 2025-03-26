import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { loginWithKeyword, logout as apiLogout } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

// Intervalo de verificação para renovação do token (a cada 5 minutos)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

// Definir tipos
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithKeyword: (keyword: string) => Promise<boolean>;
  logout: (logoutFromAllDevices?: boolean) => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
}

// Criar contexto
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Hook para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenCheckTimer, setTokenCheckTimer] = useState<NodeJS.Timeout | null>(null);

  // Função para verificar a validade do token
  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }
      
      // Decodificar o token para obter a data de expiração
      const decoded = jwtDecode<{ exp: number }>(token);
      const expirationTime = decoded.exp * 1000; // Converter para milissegundos
      const currentTime = Date.now();
      
      // Se o token expirar nos próximos 15 minutos, vamos renová-lo
      if (expirationTime - currentTime < 15 * 60 * 1000) {
        console.log('[Auth] Token expirará em breve, renovando...');
        
        // Implementar renovação automática usando o refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.warn('[Auth] Refresh token não disponível');
          return false;
        }
        
        // Aqui usaríamos o api.post, mas como este é o módulo que define o contexto,
        // teríamos uma dependência circular. A renovação já é tratada pelos interceptors do axios.
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao verificar token:', error);
      return false;
    }
  };

  // Verificar autenticação ao carregar o contexto
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      
      if (storedUser && storedToken) {
        try {
          // Verificar se o token ainda é válido com base na data de expiração
          let isValid = true;
          
          if (tokenExpiration) {
            const expirationDate = new Date(tokenExpiration);
            const now = new Date();
            
            // Verificar se o token expirou
            if (now > expirationDate) {
              console.log('[Auth] Token expirado', { expiração: expirationDate, agora: now });
              isValid = false;
            }
          }
          
          if (isValid) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('[Auth] Usuário restaurado do localStorage:', userData.name);
          } else {
            // Token inválido ou expirado, limpar dados
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('tokenExpiration');
            console.log('[Auth] Token inválido ou expirado, sessão encerrada');
          }
        } catch (e) {
          // Erro ao restaurar sessão, limpar dados
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('tokenExpiration');
          console.error('[Auth] Erro ao restaurar sessão:', e);
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
    
    // Configurar verificação periódica de token
    const timer = setInterval(() => {
      checkTokenValidity()
        .catch(err => console.error('[Auth] Erro na verificação periódica do token:', err));
    }, TOKEN_CHECK_INTERVAL);
    
    setTokenCheckTimer(timer);
    
    // Cleanup ao desmontar
    return () => {
      if (tokenCheckTimer) {
        clearInterval(tokenCheckTimer);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para login tradicional (email/senha)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Tentando login para:', email);
      
      // Implementar se necessário usando o API client
      
      return false;
    } catch (err: any) {
      console.error('[Auth] Erro no login:', err);
      setError(err.message);
      toast.error(`Erro no login: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para login com palavra-chave
  const loginWithKeywordFn = async (keyword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Iniciando autenticação com palavra-chave');
      
      const result = await loginWithKeyword(keyword);
      console.log('[Auth] Resultado da autenticação:', result);
      
      if (result.success && result.user) {
        console.log('[Auth] Autenticação bem-sucedida, definindo usuário:', result.user);
        setUser(result.user);
        console.log('[Auth] Estado do usuário atualizado');
        toast.success(`Bem-vindo, ${result.user.name}!`);
        return true;
      } else {
        console.log('[Auth] Autenticação falhou:', result.message);
        setError(result.message || 'Erro na autenticação');
        toast.error(result.message || 'Palavra-chave inválida');
        return false;
      }
    } catch (error: any) {
      console.error('[Auth] Erro ao autenticar com palavra-chave:', error);
      setError(error.message || 'Erro ao conectar ao servidor');
      toast.error(error.message || 'Erro ao conectar ao servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logoutFn = async (logoutFromAllDevices: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      
      try {
        // Tentar fazer logout na API (se disponível)
        await apiLogout(logoutFromAllDevices);
      } catch (apiError) {
        console.warn('[Auth] Erro ao fazer logout na API, continuando com logout local:', apiError);
      }
      
      // Limpar todos os dados de autenticação do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('tokenExpiration');
      
      // Limpar estado
      setUser(null);
      
      // Exibir mensagem
      toast.info('Você foi desconectado com sucesso.');
      
      // Redirecionar para a página de login (usando window.location para garantir um refresh completo)
      window.location.href = '/login';
    } catch (error) {
      console.error('[Auth] Erro ao fazer logout:', error);
      
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('tokenExpiration');
      setUser(null);
      
      toast.error('Erro ao fazer logout, mas você foi desconectado localmente.');
      
      // Redirecionar para a página de login mesmo com erro
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithKeyword: loginWithKeywordFn,
        logout: logoutFn,
        isAuthenticated: !!user,
        checkTokenValidity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
