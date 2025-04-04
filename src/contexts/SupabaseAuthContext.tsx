import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import realtimeSupabaseService from '../services/realtimeSupabaseService';

// Tipos para o usuário e contexto de autenticação
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Criar o contexto com um valor padrão
const SupabaseAuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  loading: true
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Verificar estado de autenticação ao iniciar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          console.log('Autenticação restaurada com sucesso');
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Configurar listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session) {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        } else if (event === 'TOKEN_REFRESHED') {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        }
      }
    );
    
    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
      }
      
      console.log('Login bem-sucedido');
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer login. Verifique suas credenciais.' 
      };
    }
  };
  
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // Redirecionamento gerenciado pelo Supabase
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login com Google.'
      };
    }
  };
  
  const logout = async () => {
    try {
      // Cancelar todas as inscrições Realtime
      realtimeSupabaseService.unsubscribeAll();
      
      // Fazer logout
      await supabase.auth.signOut();
      
      // Atualizar estado
      setUser(null);
      
      // Redirecionar para login
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  return (
    <SupabaseAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
      loading
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export default SupabaseAuthContext; 