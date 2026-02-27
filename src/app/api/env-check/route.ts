/**
 * Verifica variáveis de ambiente (sem expor valores).
 * Protegido: requer ?secret=CRON_SECRET ou Authorization: Bearer CRON_SECRET
 * Uso: GET /api/env-check?secret=SEU_CRON_SECRET
 */

import { NextResponse } from 'next/server';

const VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase URL', required: true },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anon key', required: true },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role (cron)', required: false },
  { key: 'STRIPE_SECRET_KEY', desc: 'Stripe secret', required: false },
  { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', desc: 'Stripe public key', required: false },
  { key: 'STRIPE_WEBHOOK_SECRET', desc: 'Stripe webhook', required: false },
  { key: 'GEMINI_API_KEY', desc: 'Google Gemini (IA)', required: false },
  { key: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', desc: 'VAPID público (push)', required: false },
  { key: 'VAPID_PRIVATE_KEY', desc: 'VAPID privado (push)', required: false },
  { key: 'CRON_SECRET', desc: 'Cron auth', required: false },
  { key: 'NEXT_PUBLIC_SENTRY_DSN', desc: 'Sentry DSN', required: false },
  { key: 'NEXT_PUBLIC_NEWS_API_KEY', desc: 'News API', required: false },
];

function checkAuth(req: Request): boolean {
  const crontoken = process.env.CRON_SECRET?.trim();
  if (!crontoken) return true;

  const url = new URL(req.url);
  const qs = url.searchParams.get('secret');
  if (qs === crontoken) return true;

  const auth = req.headers.get('authorization')?.trim();
  const token = auth?.replace(/^Bearer\s+/i, '').trim();
  return token === crontoken;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result: Record<string, { set: boolean; required: boolean; desc: string }> = {};
  let ok = 0;
  let requiredOk = 0;
  let requiredTotal = 0;

  for (const v of VARS) {
    const set = Boolean(process.env[v.key]?.trim());
    result[v.key] = { set, required: v.required, desc: v.desc };
    if (set) ok++;
    if (v.required) {
      requiredTotal++;
      if (set) requiredOk++;
    }
  }

  return NextResponse.json({
    ok,
    total: VARS.length,
    requiredOk,
    requiredTotal,
    vars: result,
    googleLogin: 'Configurado no Supabase Dashboard (Auth → Providers → Google)',
  });
}
