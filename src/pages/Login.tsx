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
import { CheckCircle, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';

const Login: React.FC = () => {
  const { loginWithKeyword } = useAuth();
  const navigate = useNavigate();
  const [palavraChave, setPalavraChave] = useState('');
  const [palavraChaveValida, setPalavraChaveValida] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tentativasErradas, setTentativasErradas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tempoEspera, setTempoEspera] = useState(0);
  const [contadorRegressivo, setContadorRegressivo] = useState(0);
  
  // Efeito para simular carregamento da página
  useEffect(() => {
    // Simula um pequeno delay para garantir que a página esteja pronta
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Efeito para o contador regressivo de bloqueio
  useEffect(() => {
    if (contadorRegressivo <= 0) {
      setBloqueado(false);
      return;
    }

    const timer = setTimeout(() => {
      setContadorRegressivo(prevContador => prevContador - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [contadorRegressivo]);

  // Verificar a palavra-chave quando ela muda
  useEffect(() => {
    if (palavraChave.length >= 5) {
      // Marcar como potencialmente válida para mostrar feedback visual
      setPalavraChaveValida(true);
    } else {
      setPalavraChaveValida(false);
    }
    
    // Limpar mensagem de erro quando o usuário começa a digitar novamente
    if (errorMessage && !bloqueado) {
      setErrorMessage(null);
    }
  }, [palavraChave, errorMessage, bloqueado]);
  
  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Função para aplicar bloqueio com tempo de espera adequado
  const aplicarBloqueio = () => {
    const tempos = [10, 25, 30, 60]; // Tempos em segundos para cada tentativa
    const indice = Math.min(tentativasErradas, tempos.length - 1);
    const tempoDeEspera = tempos[indice];
    
    setBloqueado(true);
    setTempoEspera(tempoDeEspera);
    setContadorRegressivo(tempoDeEspera);
    
    setErrorMessage(`Palavra-chave incorreta. Tente novamente em ${tempoDeEspera} segundos.`);
    toast.error(`Bloqueado por ${tempoDeEspera} segundos`);
  };
  
  // Função para lidar com a submissão da palavra-chave
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o usuário está bloqueado
    if (bloqueado) {
      setErrorMessage(`Aguarde ${contadorRegressivo} segundos para tentar novamente.`);
      return;
    }
    
    if (!palavraChave || palavraChave.length < 5) {
      setErrorMessage("Palavra-chave muito curta");
      toast.error("Palavra-chave muito curta");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Tentando fazer login com a palavra-chave:', palavraChave);

      // Verificar se é uma das palavras-chave padrão
      const palavrasChavePadrao = ['paulocell@admin1', 'milena@admin2', 'nicolas@admin3'];
      
      if (palavrasChavePadrao.includes(palavraChave)) {
        // Simular login bem-sucedido
        console.log('Palavra-chave válida, simulando login bem-sucedido');
        
        // Resetar contagem de tentativas erradas
        setTentativasErradas(0);
        
        // Gerar uma data de expiração para o token (24 horas a partir de agora)
        const expiracaoToken = new Date();
        expiracaoToken.setHours(expiracaoToken.getHours() + 24);
        
        // Salvar dados do usuário no localStorage para simular autenticação
        const userData = {
          id: '1',
          name: palavraChave === 'paulocell@admin1' ? 'Paulo Cell Admin' : 
                palavraChave === 'milena@admin2' ? 'Milena Admin' : 'Nicolas Admin',
          email: 'admin@paulocell.com',
          role: 'admin'
        };
        
        // Salvar dados de autenticação no localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', `token-simulado-${Date.now()}`);
        localStorage.setItem('refreshToken', `refresh-token-simulado-${Date.now()}`);
        localStorage.setItem('sessionId', `session-id-simulado-${Date.now()}`);
        localStorage.setItem('tokenExpiration', expiracaoToken.toISOString());
        
        toast.success(`Bem-vindo, ${userData.name}!`);
        
        // Redirecionar para o dashboard
        console.log('Redirecionando para /dashboard via React Router');
        navigate('/dashboard');
      } else {
        // Incrementar tentativas erradas
        setTentativasErradas(prev => prev + 1);
        
        console.log('Palavra-chave inválida, tentativa:', tentativasErradas + 1);
        setPalavraChaveValida(false);
        
        // Aplicar bloqueio após a primeira tentativa errada
        aplicarBloqueio();
      }
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setPalavraChaveValida(false);
      setErrorMessage("Erro ao autenticar. Por favor, tente novamente mais tarde.");
      toast.error('Erro ao autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePalavraChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPalavraChave(e.target.value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && palavraChaveValida && !isLoading && !bloqueado) {
      handleSubmit(e);
    }
  };

  // Formatar o tempo de contador de forma legível
  const formatarTempo = (segundos: number) => {
    if (segundos < 60) return `${segundos} segundos`;
    
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    if (segundosRestantes === 0) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return `${minutos} minuto${minutos > 1 ? 's' : ''} e ${segundosRestantes} segundo${segundosRestantes > 1 ? 's' : ''}`;
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Insira sua palavra-chave"
                  value={palavraChave}
                  onChange={handlePalavraChaveChange}
                  onKeyPress={handleKeyPress}
                  className={`pr-20 ${palavraChaveValida ? 'border-green-500' : errorMessage ? 'border-red-500' : ''}`}
                  disabled={isLoading || bloqueado}
                  autoFocus
                  autoComplete="off"
                />
                
                <div className="absolute right-3 top-2.5 flex items-center gap-1">
                  {/* Botão para mostrar/ocultar senha */}
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                    tabIndex={-1}
                    disabled={bloqueado}
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </button>
                  
                  {/* Indicador de validação */}
                  {palavraChaveValida && !bloqueado && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* Mensagem de erro */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm flex items-center gap-1.5 p-3 rounded-md ${
                    bloqueado 
                      ? 'bg-amber-50 border border-amber-300 text-amber-700' 
                      : 'text-red-500'
                  }`}
                >
                  {bloqueado ? (
                    <>
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Palavra-chave incorreta. Tente novamente em{' '}
                        <span className="font-semibold">{formatarTempo(contadorRegressivo)}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </>
                  )}
                </motion.div>
              )}
              
              {isLoading && (
                <div className="text-center text-sm text-muted-foreground">
                  Entrando no sistema...
                </div>
              )}
              
              <button
                type="submit"
                className="w-full rounded-md bg-primary py-2 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading || !palavraChaveValida || bloqueado}
              >
                {isLoading ? 'Autenticando...' : bloqueado ? `Aguarde ${contadorRegressivo}s` : 'Entrar'}
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
