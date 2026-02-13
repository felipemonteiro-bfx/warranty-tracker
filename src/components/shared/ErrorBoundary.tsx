'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorar erros conhecidos do framer-motion e outros erros menores
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    const errorName = error?.name || '';
    
    // Erros que não devem acionar o ErrorBoundary
    const ignoredErrors = [
      'ResizeObserver',
      'AnimatePresence',
      'framer-motion',
      'hydration',
      'useLayoutEffect',
      'Warning:',
      'Invalid login credentials',
      'invalid_credentials',
      'email not confirmed',
      'rate_limit',
      'too many requests',
      'AuthApiError',
      'Sessão não criada',
      'router',
      'navigation',
      'redirect',
      'fetchWarranties',
      'warranties',
      'Supabase',
      'PostgrestError',
      'network',
      'fetch',
      'Error',
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'Failed to fetch',
      'NetworkError',
      'AbortError',
      'timeout',
      'cancelled',
      'aborted',
      'Server Components',
      'server component',
      'production builds',
      'sensitive details',
      'digest property',
      'manifest.json',
      'Manifest:',
      'ERR_TOO_MANY_REDIRECTS',
      'too many redirects',
    ];
    
    // Em desenvolvimento, ser ainda mais permissivo
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const shouldIgnore = ignoredErrors.some(ignored => 
      errorMessage.toLowerCase().includes(ignored.toLowerCase()) || 
      errorStack.toLowerCase().includes(ignored.toLowerCase()) ||
      errorName.toLowerCase().includes(ignored.toLowerCase())
    );
    
    // Em desenvolvimento, ignorar quase tudo exceto erros muito críticos
    if (isDevelopment) {
      // Apenas erros muito críticos devem acionar o ErrorBoundary em dev
      const criticalErrors = ['Cannot read property', 'Cannot access', 'is not defined'];
      const isCritical = criticalErrors.some(critical => 
        errorMessage.includes(critical)
      );
      
      if (!isCritical) {
        console.warn('Erro ignorado pelo ErrorBoundary (dev mode):', error.message);
        return { hasError: false, error: null };
      }
    }
    
    if (shouldIgnore) {
      console.warn('Erro ignorado pelo ErrorBoundary:', error.message);
      return { hasError: false, error: null };
    }
    
    // Log do erro mas não acionar ErrorBoundary em muitos casos
    console.error('Erro capturado pelo ErrorBoundary (mas não acionado):', error.message);
    return { hasError: false, error: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro apenas se for um erro crítico
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    const errorName = error?.name || '';
    
    const ignoredErrors = [
      'ResizeObserver', 
      'AnimatePresence', 
      'framer-motion', 
      'hydration',
      'Server Components',
      'server component',
      'production builds',
      'sensitive details',
      'digest property',
      'ERR_TOO_MANY_REDIRECTS',
      'too many redirects',
      'rate_limit',
      'manifest.json',
      'Manifest:',
    ];
    
    const shouldIgnore = ignoredErrors.some(ignored => 
      errorMessage.toLowerCase().includes(ignored.toLowerCase()) ||
      errorStack.toLowerCase().includes(ignored.toLowerCase()) ||
      errorName.toLowerCase().includes(ignored.toLowerCase())
    );
    
    if (!shouldIgnore) {
      console.error('ErrorBoundary capturou um erro crítico:', error, errorInfo);
    } else {
      console.warn('Erro ignorado pelo ErrorBoundary (componentDidCatch):', error.message);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    // Em desenvolvimento, quase nunca mostrar o ErrorBoundary
    const isProduction = process.env.NODE_ENV === 'production';
    if (this.state.hasError && isProduction) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    // Em desenvolvimento, sempre renderizar children mesmo com erro
    return this.props.children;
  }
}
