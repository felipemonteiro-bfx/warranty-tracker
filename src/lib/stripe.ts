import Stripe from 'stripe';
import { env } from '@/lib/env';

// Stripe é opcional - só inicializa se a chave secreta estiver configurada
export const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      appInfo: {
        name: 'Guardião de Notas',
        version: '0.1.0',
      },
    })
  : null;

// Helper para verificar se Stripe está configurado
export const isStripeConfigured = (): boolean => {
  return !!env.STRIPE_SECRET_KEY && !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};
