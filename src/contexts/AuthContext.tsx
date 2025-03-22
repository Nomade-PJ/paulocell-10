import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { clearLocalStorageCache, syncPendingData } from '../services/userDataService';

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

// Hook personalizado para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para navegar para uma rota
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Verificar se o usuário está autenticado ao carregar o contexto
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('[Auth] Usuário restaurado do localStorage:', userData.name);
        
        // Quando restaura o usuário do localStorage, verificar se há dados pendentes
        // para sincronizar com o servidor imediatamente
        if (navigator.onLine && userData.id) {
          console.log('[Auth] Verificando dados pendentes após restaurar sessão');
          
          // Atrasar para garantir que outros componentes carreguem primeiro
          setTimeout(() => {
            syncPendingData(userData.id)
              .then(result => {
                if (result.success && result.succeeded > 0) {
                  toast.success(`Sincronizado: ${result.succeeded} item(s)`);
                  console.log('[Auth] Sincronização automática concluída:', result);
                }
              })
              .catch(err => {
                console.error('[Auth] Erro na sincronização automática:', err);
              });
          }, 5000);
        }
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
      
      // Limpar cache local antigo para este usuário
      try {
        console.log('[Auth] Limpando TODOS os dados locais antigos para o usuário');
        
        // Limpar todos os dados antigos do localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          // Remover apenas dados que não estão pendentes para sincronização
          if (key && key.startsWith(`${data.user.id}_`) && !key.endsWith('_delete')) {
            try {
              const value = JSON.parse(localStorage.getItem(key) || '{}');
              if (!value.pendingSync) {
                localStorage.removeItem(key);
                console.log(`[Auth] Removido item ${key} do localStorage`);
              } else {
                console.log(`[Auth] Mantido item pendente ${key} para sincronização posterior`);
              }
            } catch (e) {
              // Se não conseguir ler, remover de qualquer forma
              localStorage.removeItem(key);
            }
          }
        }
        
        console.log('[Auth] Limpeza de dados antigos concluída');
      } catch (cacheError) {
        console.warn('[Auth] Erro ao limpar cache:', cacheError);
      }
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('[Auth] Login bem-sucedido para:', data.user.name);
      
      // Mostrar mensagem de boas-vindas
      toast.success(`Bem-vindo, ${data.user.name}!`);
      
      // Redirecionar para a página inicial após login
      navigateTo('/');
    } catch (err: any) {
      console.error('[Auth] Erro no login:', err);
      setError(err.message);
      toast.error(`Erro no login: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Salvar o ID do usuário antes de limpar
    const userId = user?.id;
    
    // Limpar o estado e o localStorage
    setUser(null);
    localStorage.removeItem('user');
    
    // Opcional: limpar todos os dados deste usuário do localStorage
    if (userId) {
      try {
        console.log('[Auth] Limpando dados do usuário ao fazer logout');
        
        // Pegar todas as chaves do localStorage que pertencem a este usuário
        const userKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`${userId}_`)) {
            userKeys.push(key);
          }
        }
        
        // Remover cada item
        userKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`[Auth] Removido ${key} ao fazer logout`);
        });
        
        console.log(`[Auth] Removidos ${userKeys.length} itens do localStorage`);
      } catch (e) {
        console.error('[Auth] Erro ao limpar dados do usuário no logout:', e);
      }
    }
    
    console.log('[Auth] Usuário deslogado');
    toast.info('Você foi desconectado com sucesso.');
    
    // Redirecionar para a página de login
    navigateTo('/login');
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
