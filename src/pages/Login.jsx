
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Falha ao realizar login');
      }
    } catch (err) {
      setError('Erro ao tentar fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Paulo Cell</h1>
        <h2 className="mb-6 text-center text-xl text-gray-600">Sistema de Gestão</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          
          <div className="mb-4">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Sistema de gestão para assistência técnica de celulares
        </p>
      </div>
    </div>
  );
};

export default Login;
