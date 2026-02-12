import { z } from 'zod';

// Aceita string não vazia, undefined ou chave ausente (build Vercel pode não ter as vars)
const optionalString = () => z.union([z.string().min(1), z.undefined()]).optional();

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Stripe (Opcional - app funciona sem Stripe)
  STRIPE_SECRET_KEY: optionalString(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString(),
  
  // Gemini AI
  NEXT_PUBLIC_GEMINI_API_KEY: optionalString(),
  
  // Stripe Webhook
  STRIPE_WEBHOOK_SECRET: optionalString(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  try {
    // Preparar objeto com valores, convertendo undefined para não incluir no parse
    const envData: Record<string, any> = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development',
    };

    // Variáveis opcionais: incluir sempre (como undefined se não existirem) para o parse aceitar no build
    if (typeof window === 'undefined') {
      envData.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || undefined;
      envData.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || undefined;
    }
    envData.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined;
    envData.NEXT_PUBLIC_GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || undefined;

    return envSchema.parse(envData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(
        `❌ Variáveis de ambiente inválidas ou faltando:\n${missingVars}\n\n` +
        `Por favor, verifique seu arquivo .env.local`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = getEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
