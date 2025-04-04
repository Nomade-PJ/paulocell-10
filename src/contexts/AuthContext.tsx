import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import realtimeService from '../services/realtimeService';

// Tipos para o usuário e contexto de autenticação
export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Verificar estado de autenticação ao iniciar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Verificar sessão atual
        const token = sessionStorage.getItem('authToken');
        
        if (token) {
          try {
            // Validar token no servidor
            const response = await api.get('/auth/validate-token');
            const userData = response.data.user;
            
            setUser(userData);
            
            // Iniciar conexão WebSocket com o token validado
            realtimeService.connect(token);
            
            console.log('Autenticação restaurada com sucesso');
          } catch (error) {
            // Token inválido ou expirado
            console.error('Erro ao validar token:', error);
            sessionStorage.removeItem('authToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Listener para eventos de expiração de token
    const tokenExpiredHandler = () => {
      console.log('Token expirado. Redirecionando para login...');
      sessionStorage.removeItem('authToken');
      setUser(null);
      navigate('/login');
    };
    
    window.addEventListener('auth:token-expired', tokenExpiredHandler);
    
    return () => {
      window.removeEventListener('auth:token-expired', tokenExpiredHandler);
      // Desconectar WebSocket quando o componente for desmontado
      realtimeService.disconnect();
    };
  }, [navigate]);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('Dados de autenticação inválidos');
      }
      
      // Armazenar apenas no sessionStorage (não em localStorage)
      // Isso garante que a sessão expire quando o navegador é fechado
      sessionStorage.setItem('authToken', token);
      
      // Atualizar estado do usuário
      setUser(userData);
      
      // Iniciar conexão WebSocket com o token
      realtimeService.connect(token);
      
      console.log('Login bem-sucedido');
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.' 
      };
    }
  };
  
  const logout = () => {
    // Remover token e dados da sessão
    sessionStorage.removeItem('authToken');
    
    // Atualizar estado
    setUser(null);
    
    // Desconectar WebSocket
    realtimeService.disconnect();
    
    // Redirecionar para login
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 