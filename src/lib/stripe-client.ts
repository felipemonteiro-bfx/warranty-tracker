import { loadStripe, Stripe } from '@stripe/stripe-js';
import { env } from '@/lib/env';

export const getStripe = (): Promise<Stripe | null> => {
  if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️ Stripe não configurado: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não encontrada');
    return Promise.resolve(null);
  }
  return loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};
