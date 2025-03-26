// Serviço API para gerenciar requisições HTTP e tokens JWT
import axios from 'axios';

// Criar instância do axios
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação e renovar tokens expirados
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Verificar se é erro de token expirado e se já não tentamos renovar
    if (
      error.response && 
      error.response.status === 401 && 
      error.response.data && 
      error.response.data.expired && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Sem refresh token, redirecionar para login
          console.log('Sem refresh token disponível, redirecionando para login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('sessionId');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        console.log('Tentando renovar token expirado...');
        
        // Chamar API para renovar o token
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken
        });
        
        if (response.data && response.data.success) {
          console.log('Token renovado com sucesso');
          
          // Atualizar tokens no localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('sessionId', response.data.sessionId);
          
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          
          // Atualizar token no cabeçalho da requisição original
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          
          // Tentar novamente a requisição original
          return api(originalRequest);
        } else {
          console.error('Falha ao renovar token:', response.data.message);
          // Redirecionar para login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('sessionId');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
        // Falha ao renovar, redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Outros erros 401, sem possibilidade de renovação, redirecionar para login
    if (error.response && error.response.status === 401) {
      console.error('Erro de autenticação não recuperável:', error.response.data);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Função para autenticação por palavra-chave
export const loginWithKeyword = async (keyword) => {
  try {
    console.log('Enviando requisição de login com palavra-chave...');
    const response = await api.post('/auth/keyword', { keyword });
    
    console.log('Resposta recebida:', response.status, response.data ? 'Dados recebidos' : 'Sem dados');
    
    if (response.data && response.data.success) {
      // Armazenar tokens e dados do usuário
      console.log('Login bem-sucedido, armazenando dados do usuário e tokens');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('sessionId', response.data.sessionId);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Definir token no cabeçalho para futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Login realizado com sucesso'
      };
    }
    
    console.log('Login falhou com resposta:', response.data);
    return {
      success: false,
      message: response.data.message || 'Erro de autenticação'
    };
  } catch (error) {
    console.error('Erro ao realizar login com palavra-chave:', error);
    console.error('Detalhes do erro:', error.response?.data || error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao conectar ao servidor'
    };
  }
};

// Função para logout
export const logout = async (logoutFromAllDevices = false) => {
  try {
    // Obter tokens e session ID
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Tentar fazer logout no servidor (mesmo se falhar, vamos limpar localmente)
    if (refreshToken) {
      await api.post('/auth/logout', { 
        refreshToken,
        logoutFromAllDevices
      });
    }
    
    // Limpar dados localmente independentemente do resultado
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    
    // Limpar dados localmente mesmo em caso de erro
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    
    return { 
      success: true, 
      message: 'Logout local realizado, mas houve um erro ao comunicar com o servidor'
    };
  }
};

export default api; 