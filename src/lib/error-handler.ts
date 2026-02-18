/**
 * Sistema centralizado de tratamento de erros
 */

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  code?: string;
  statusCode?: number;
}

export class AppErrorClass extends Error implements AppError {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  originalError?: unknown;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'AppError';
    this.type = error.type;
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.originalError = error.originalError;
  }
}

/**
 * Cria um erro formatado
 */
export function createError(
  type: ErrorType,
  message: string,
  options?: {
    code?: string;
    statusCode?: number;
    originalError?: unknown;
  }
): AppErrorClass {
  return new AppErrorClass({
    type,
    message,
    ...options,
  });
}

/**
 * Converte erros desconhecidos em AppError
 */
export function normalizeError(error: unknown): AppErrorClass {
  if (error instanceof AppErrorClass) {
    return error;
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    const errorName = (error as any).name || '';
    
    // Erros específicos do Supabase Auth
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('email not confirmed')) {
      return createError(ErrorType.AUTHENTICATION, 'E-mail ou senha incorretos. Verifique suas credenciais.', {
        code: 'INVALID_CREDENTIALS',
        originalError: error,
      });
    }
    
    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('signup_disabled')) {
      return createError(ErrorType.AUTHENTICATION, 'Por favor, confirme seu e-mail antes de fazer login.', {
        code: 'EMAIL_NOT_CONFIRMED',
        originalError: error,
      });
    }
    
    if (errorMessage.includes('user not found') || 
        errorMessage.includes('user_not_found')) {
      return createError(ErrorType.AUTHENTICATION, 'Usuário não encontrado. Verifique seu e-mail.', {
        code: 'USER_NOT_FOUND',
        originalError: error,
      });
    }
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate_limit')) {
      return createError(ErrorType.AUTHENTICATION, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', {
        code: 'RATE_LIMIT',
        originalError: error,
      });
    }

    // Erros do Supabase - sessão
    if (errorMessage.includes('JWT') || 
        errorMessage.includes('session') ||
        errorMessage.includes('token')) {
      return createError(ErrorType.AUTHENTICATION, 'Sessão expirada. Por favor, faça login novamente.', {
        code: 'SESSION_EXPIRED',
        originalError: error,
      });
    }

    // Erros de rede
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('failed to fetch') ||
        errorName.includes('NetworkError')) {
      return createError(ErrorType.NETWORK, 'Erro de conexão. Verifique sua internet e tente novamente.', {
        code: 'NETWORK_ERROR',
        originalError: error,
      });
    }
    
    // Erros de validação
    if (errorMessage.includes('validation') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('required')) {
      return createError(ErrorType.VALIDATION, error.message || 'Dados inválidos. Verifique as informações fornecidas.', {
        code: 'VALIDATION_ERROR',
        originalError: error,
      });
    }

    return createError(ErrorType.UNKNOWN, error.message || 'Ocorreu um erro inesperado. Tente novamente.', { 
      originalError: error 
    });
  }
  
  // Se for um objeto com propriedades de erro do Supabase (PostgrestError, AuthError, etc.)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, any>;
    const msg = errorObj.message || errorObj.msg || errorObj.error_description || errorObj.details;
    if (msg) {
      const wrapped = new Error(String(msg));
      if (errorObj.code) (wrapped as any).code = errorObj.code;
      return normalizeError(wrapped);
    }
  }

  return createError(ErrorType.UNKNOWN, 'Erro desconhecido. Tente novamente.', { originalError: error });
}

/**
 * Log de erro (não loga dados sensíveis em produção)
 */
export function logError(error: AppErrorClass, context?: Record<string, unknown>): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const type = String(error?.type ?? 'UNKNOWN');
  const message = String(error?.message ?? 'Sem mensagem');
  const code = error?.code ? String(error.code) : undefined;
  const statusCode = error?.statusCode;

  const parts: string[] = [`[AppError] ${type}: ${message}`];
  if (code) parts.push(`code=${code}`);
  if (statusCode) parts.push(`status=${statusCode}`);

  const main = parts.join(' | ');
  const payload: Record<string, unknown> = { type, message };
  if (code) payload.code = code;
  if (statusCode) payload.statusCode = statusCode;

  if (isDevelopment && error?.originalError) {
    const orig = error.originalError;
    if (orig instanceof Error) {
      payload.original = `${orig.name}: ${orig.message}`;
    } else if (typeof orig === 'object' && orig !== null) {
      const o = orig as Record<string, unknown>;
      payload.original = String(o.message ?? o.msg ?? o.details ?? o);
    } else {
      payload.original = String(orig);
    }
  }
  if (context && Object.keys(context).length > 0) payload.context = context;

  console.error(main, payload);
}

/**
 * Obtém mensagem amigável para o usuário
 */
export function getUserFriendlyMessage(error: AppErrorClass): string {
  // Se a mensagem já é amigável e específica, usar ela diretamente
  if (error.message && 
      (error.message.includes('E-mail ou senha') ||
       error.message.includes('confirme seu e-mail') ||
       error.message.includes('Muitas tentativas') ||
       error.message.includes('Sessão expirada') ||
       error.message.includes('Erro de conexão'))) {
    return error.message;
  }
  
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return error.message || 'Erro de autenticação. Verifique suas credenciais e tente novamente.';
    case ErrorType.AUTHORIZATION:
      return 'Você não tem permissão para realizar esta ação.';
    case ErrorType.VALIDATION:
      return error.message || 'Dados inválidos. Verifique as informações fornecidas.';
    case ErrorType.NETWORK:
      return error.message || 'Erro de conexão. Verifique sua internet e tente novamente.';
    case ErrorType.SERVER:
      return 'Erro no servidor. Tente novamente em alguns instantes.';
    default:
      return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
