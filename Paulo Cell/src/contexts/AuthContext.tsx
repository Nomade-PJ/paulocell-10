import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar sessão atual no servidor ao montar o componente
  useEffect(() => {
    const checkCurrentSession = async () => {
      try {
        // Verificar se há uma sessão ativa no servidor
        const response = await fetch('/api/auth/check-session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Importante para enviar cookies
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email
          });
          console.log('Sessão ativa encontrada:', userData);
        } else {
          console.log('Nenhuma sessão ativa encontrada');
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      }
    };
    
    checkCurrentSession();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Tentativa de login com:', emailOrUsername, password);
      // Normalize email/username (trim whitespace and convert to lowercase)
      const normalizedInput = emailOrUsername.trim().toLowerCase();
      
      // Tentar autenticar com o servidor
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            emailOrUsername: normalizedInput,
            password 
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao fazer login');
        }
        
        const userData = await response.json();
        const user = {
          id: userData.id,
          name: userData.name,
          email: userData.email
        };
        
        // Primeiro definimos o usuário no estado
        setUser(user);
        
        // Em seguida, salvamos no localStorage
        localStorage.setItem('pauloCell_user', JSON.stringify(user));
        console.log('Usuário salvo no localStorage:', user);
        
        // Exibimos a mensagem de sucesso
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao sistema Paulo Cell.'
        });
        
        console.log('Redirecionando para o dashboard...');
        navigate('/dashboard');
      } catch (apiError) {
        console.error('Erro na API de autenticação:', apiError);
        
        if (
          (normalizedInput === 'paullo.celullar2020@gmail.com' || 
           normalizedInput === 'paulocell') && 
          password === 'paulocell@admin'
        ) {
          console.log('Usando fallback de login com credenciais hardcoded');
          
          const user = {
            id: '1',
            name: 'Paulo Cell',
            email: 'paullo.celullar2020@gmail.com'
          };
          
          setUser(user);
          localStorage.setItem('pauloCell_user', JSON.stringify(user));
          
          toast({
            title: 'Login realizado com sucesso! (modo offline)',
            description: 'Bem-vindo ao sistema Paulo Cell.'
          });
          
          navigate('/dashboard');
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Erro durante o login:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Limpar mensagens de erro anteriores
      const errorElement = document.getElementById('google-login-error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }

      console.log('Iniciando login com Google via servidor...');
      
      // Redirecionar para a rota de autenticação do Google no servidor
      window.location.href = '/api/auth/google';
      
      // Nota: O redirecionamento ocorrerá, então o código abaixo não será executado
      // até que o usuário retorne do fluxo de autenticação do Google
      
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocorreu um erro ao iniciar o login com Google.';
      
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login com Google',
        description: errorMessage
      });
      
      // Exibir mensagem de erro na UI
      const errorElement = document.getElementById('google-login-error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Enviar dados de registro para o servidor
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer cadastro');
      }
      
      const userData = await response.json();
      
      // Definir o usuário no estado
      const newUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email
      };
      
      setUser(newUser);
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Bem-vindo ao sistema Paulo Cell.'
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro durante o registro:', error);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer cadastro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer cadastro.'
      });
    }
  };

  const logout = async () => {
    try {
      // Chamar a API para encerrar a sessão no servidor
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Importante para enviar cookies
      });
      
      if (!response.ok) {
        throw new Error('Falha ao encerrar sessão no servidor');
      }
      
      // Limpar o estado do usuário
      setUser(null);
      
      toast({
        title: 'Logout realizado com sucesso!',
        description: 'Até logo!'
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      // Mesmo com erro, limpar o estado do usuário
      setUser(null);
      navigate('/login');
      
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Logout realizado, mas houve um erro ao comunicar com o servidor.'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
