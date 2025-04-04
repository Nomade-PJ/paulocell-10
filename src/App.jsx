/**
 * Componente principal da aplicação
 * Integra o ErrorBoundary e NetworkMonitor para garantir operação 100% online
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkMonitor from './components/NetworkMonitor';
import { AuthProvider } from './contexts/AuthContext';
import ConnectionStatus from './components/ConnectionStatus';

// Carregamento preguiçoso de componentes para melhor performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Customers = lazy(() => import('./pages/Customers'));
const Orders = lazy(() => import('./pages/Orders'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Página de carregamento para componentes carregados preguiçosamente
const LoadingPage = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Carregando...</p>
  </div>
);

// Componente de fallback para o ErrorBoundary
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-container">
    <h2>Algo deu errado</h2>
    <p>Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.</p>
    <p className="error-details">{error?.message}</p>
    <button onClick={resetErrorBoundary}>Tentar novamente</button>
  </div>
);

// Componente que exige autenticação
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  // Handler para erros críticos
  const handleError = (error, errorInfo) => {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    
    // Aqui poderia ser implementado envio para sistema de monitoramento
    // como Sentry, LogRocket, etc.
  };

  return (
    <ErrorBoundary onError={handleError} fallback={<ErrorFallback />}>
      <Router>
        <AuthProvider>
          {/* Monitor de status de rede */}
          <NetworkMonitor autoHideDelay={5000} />
          
          {/* Indicador de status da conexão */}
          <ConnectionStatus />
          
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              
              {/* Rotas privadas */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <PrivateRoute>
                    <Customers />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } 
              />
              
              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 