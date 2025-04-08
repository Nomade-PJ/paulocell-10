
import axios from 'axios';

// URL base da API
const baseURL = process.env.REACT_APP_API_URL || '';

// Criar uma instância do axios
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptador para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação (401)
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
