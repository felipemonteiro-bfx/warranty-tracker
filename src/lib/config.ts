/**
 * Configurações de runtime (client-safe).
 * Use variáveis NEXT_PUBLIC_ para expor no client.
 */

/** Exibe botão "Dados de teste" no dashboard (dev ou com NEXT_PUBLIC_DEMO_MODE=true) */
export const IS_DEMO_MODE =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
