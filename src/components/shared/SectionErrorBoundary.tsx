'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`SectionErrorBoundary: ${this.props.sectionName || 'section'}`, error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
          <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">
            Algo deu errado nesta seção
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
            {this.state.error?.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
