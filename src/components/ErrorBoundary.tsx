/**
 * Componente ErrorBoundary para capturar e tratar erros na aplicação
 * Este componente detecta erros em componentes filhos e renderiza uma UI de fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registrar o erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Atualizar o estado com as informações de erro
    this.setState({ errorInfo });
    
    // Executar callback de erro, se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Registrar erro em serviço de monitoramento (se implementado)
    if (window.navigator.onLine) {
      // Enviar para sistema de monitoramento
      // Exemplos: Sentry, LogRocket, etc.
    }
  }

  handleReload = (): void => {
    // Recarregar a aplicação
    window.location.reload();
  };

  handleReset = (): void => {
    // Limpar o estado de erro e tentar novamente
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar UI de fallback personalizada ou a fornecida via props
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // UI de fallback padrão
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Algo deu errado</h2>
            <p>Ocorreu um erro inesperado na aplicação.</p>
            
            {this.state.error && (
              <div className="error-details">
                <p className="error-message">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details>
                    <summary>Detalhes técnicos</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-retry">
                Tentar novamente
              </button>
              <button onClick={this.handleReload} className="btn-reload">
                Recarregar aplicação
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Se não houver erro, renderizar os filhos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary; 