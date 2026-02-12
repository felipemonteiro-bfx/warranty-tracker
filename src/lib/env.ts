import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Stripe (Opcional - app funciona sem Stripe)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  
  // Gemini AI
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().min(1).optional(),
  
  // Stripe Webhook
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  
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

    // Adicionar variáveis opcionais apenas se existirem e não forem undefined
    // No browser, apenas variáveis NEXT_PUBLIC_* estão disponíveis
    const stripeSecret = typeof window === 'undefined' ? process.env.STRIPE_SECRET_KEY : undefined;
    const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const webhookSecret = typeof window === 'undefined' ? process.env.STRIPE_WEBHOOK_SECRET : undefined;

    if (stripeSecret) {
      envData.STRIPE_SECRET_KEY = stripeSecret;
    }
    if (stripePublishable) {
      envData.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripePublishable;
    }
    if (geminiKey) {
      envData.NEXT_PUBLIC_GEMINI_API_KEY = geminiKey;
    }
    if (webhookSecret) {
      envData.STRIPE_WEBHOOK_SECRET = webhookSecret;
    }

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
