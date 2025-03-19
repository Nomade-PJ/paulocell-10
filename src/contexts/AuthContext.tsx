import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem('pauloCell_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('User loaded from localStorage:', parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('pauloCell_user');
        }
      }
    };
    
    loadUserFromStorage();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      console.log('Tentativa de login com:', emailOrUsername, password);
      // Normalize email/username (trim whitespace and convert to lowercase)
      const normalizedInput = emailOrUsername.trim().toLowerCase();
      const validEmail = 'paullo.celullar2020@gmail.com'.toLowerCase();
      
      // For demo purposes, using hardcoded credentials
      // Allow login with either email or username 'paulocell'
      if ((normalizedInput === validEmail || normalizedInput === 'paulocell') && password === 'paulocell@admin') {
        const user = {
          id: '1',
          name: 'Paulo Cell Admin',
          email: normalizedInput === 'paulocell' ? 'paullo.celullar2020@gmail.com' : emailOrUsername
        };
        setUser(user);
        localStorage.setItem('pauloCell_user', JSON.stringify(user));
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao sistema Paulo Cell.'
        });
        navigate('/dashboard');
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login.'
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Clear any previous error messages
      const errorElement = document.getElementById('google-login-error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }

      console.log('Iniciando login com Google...');
      // Use signInWithRedirect instead of signInWithPopup to avoid popup blockers
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Login com Google bem-sucedido:', result);
      
      // The signed-in user info
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      
      console.log('Usuário autenticado:', user);
      
      // Create a user object with the data we need
      const newUser = {
        id: user.uid,
        name: user.displayName || 'Usuário Google',
        email: user.email || ''
      };
      
      setUser(newUser);
      localStorage.setItem('pauloCell_user', JSON.stringify(newUser));
      
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao sistema Paulo Cell.'
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Ocorreu um erro ao fazer login com Google.';
      
      if (error instanceof Error) {
        // Check for specific Firebase auth error codes
        const errorCode = (error as any).code;
        console.error('Código de erro:', errorCode);
        console.error('Mensagem de erro completa:', error.message);
        
        if (errorCode === 'auth/popup-closed-by-user') {
          errorMessage = 'O popup de login foi fechado antes de completar a autenticação.';
        } else if (errorCode === 'auth/popup-blocked') {
          errorMessage = 'O popup de login foi bloqueado pelo navegador. Por favor, permita popups para este site.';
        } else if (errorCode === 'auth/cancelled-popup-request') {
          errorMessage = 'A solicitação de login foi cancelada.';
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = 'Falha na conexão de rede. Verifique sua conexão com a internet.';
        } else if (errorCode === 'auth/invalid-api-key') {
          errorMessage = 'A chave de API do Firebase é inválida. Contate o administrador do sistema.';
        } else if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = 'Este domínio não está autorizado para operações OAuth. Contate o administrador do sistema.';
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorMessage = 'O login com Google não está habilitado. Contate o administrador do sistema.';
        } else if (errorCode === 'auth/internal-error') {
          errorMessage = 'Ocorreu um erro interno no servidor de autenticação. Tente novamente mais tarde.';
        } else {
          // Use the actual error message if available
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login com Google',
        description: errorMessage
      });
      
      // Display a UI element with the error message
      const errorElement = document.getElementById('google-login-error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // For demo purposes, store user in localStorage
      const newUser = {
        id: Date.now().toString(),
        name,
        email
      };
      setUser(newUser);
      localStorage.setItem('pauloCell_user', JSON.stringify(newUser));
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Bem-vindo ao sistema Paulo Cell.'
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer cadastro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer cadastro.'
      });
    }
  };

  const logout = () => {
    setUser(null);
    // Remove apenas os dados do usuário, mantendo as configurações da API
    localStorage.removeItem('pauloCell_user');
    // Não remove 'pauloCell_invoiceApiConfig' para manter as configurações da API
    toast({
      title: 'Logout realizado com sucesso!',
      description: 'Até logo!'
    });
    navigate('/login');
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
