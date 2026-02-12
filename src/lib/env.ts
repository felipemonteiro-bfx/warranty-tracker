import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  
  // Gemini AI
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required').optional(),
  
  // Stripe Webhook
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required').optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NODE_ENV: process.env.NODE_ENV || 'development',
    });
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
