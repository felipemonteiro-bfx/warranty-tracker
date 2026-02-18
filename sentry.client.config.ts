import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Plano gratuito: 50 sessões replay/mês – só gravar quando houver erro
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,
  integrations: [Sentry.replayIntegration()],
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,
});
