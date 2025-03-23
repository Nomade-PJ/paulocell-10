import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { CheckCircle } from 'lucide-react';

// Lista de palavras-chave válidas
const PALAVRAS_CHAVE_VALIDAS = [
  "paulocell@admin1",
  "milena@admin2",
  "nicolas@admin3"
];

// Mapeamento de palavras-chave para dados de usuário
const USUARIOS_POR_CHAVE = {
  "paulocell@admin1": {
    id: "1",
    name: "Paulo Cell Admin",
    email: "paulo@admin.com",
    role: "admin"
  },
  "milena@admin2": {
    id: "2",
    name: "Milena Admin",
    email: "milena@admin.com",
    role: "admin"
  },
  "nicolas@admin3": {
    id: "3",
    name: "Nicolas Admin",
    email: "nicolas@admin.com",
    role: "admin"
  }
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [palavraChave, setPalavraChave] = useState('');
  const [palavraChaveValida, setPalavraChaveValida] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simula um pequeno delay para garantir que a página esteja pronta
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Verificar a palavra-chave quando ela muda
  useEffect(() => {
    if (PALAVRAS_CHAVE_VALIDAS.includes(palavraChave)) {
      setPalavraChaveValida(true);
      
      // Fazer login automático após um pequeno delay
      setTimeout(async () => {
        setIsLoading(true);
        try {
          // Simular o login com os dados do usuário correspondente
          const usuarioData = USUARIOS_POR_CHAVE[palavraChave];
          
          // Armazenar no localStorage para o AuthContext
          localStorage.setItem('user', JSON.stringify(usuarioData));
          
          // Mostrar mensagem de sucesso
          toast.success(`Bem-vindo, ${usuarioData.name}!`);
          
          // Navegar para a página do dashboard em vez da página inicial
          navigate('/dashboard');
        } catch (error) {
          console.error('Erro ao fazer login automático:', error);
          toast.error('Erro ao fazer login automático');
        } finally {
          setIsLoading(false);
          setPalavraChaveValida(false);
        }
      }, 1000);
    } else {
      setPalavraChaveValida(false);
    }
  }, [palavraChave, navigate]);

  const handlePalavraChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPalavraChave(e.target.value);
  };

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-16 w-32" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <img src="/logo.svg" alt="Paulo Cell Sistema PDV Logo" className="h-16" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">
              Insira sua palavra-chave para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Insira sua palavra-chave"
                  value={palavraChave}
                  onChange={handlePalavraChaveChange}
                  className={`pr-10 ${palavraChaveValida ? 'border-green-500' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
                {palavraChaveValida && (
                  <div className="absolute right-3 top-2.5">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              
              {isLoading && (
                <div className="text-center text-sm text-muted-foreground">
                  Entrando no sistema...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
