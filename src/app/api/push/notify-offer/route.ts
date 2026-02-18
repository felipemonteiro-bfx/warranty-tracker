/**
 * Envia push ao vendedor quando há nova oferta
 * Chamado pelo comprador após criar oferta
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webPush from 'web-push';
import { z } from 'zod';

const schema = z.object({
  sellerId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  offerAmount: z.number().positive(),
});

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

export async function POST(req: Request) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ ok: false, message: 'Push não configurado' }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados inválidos', errors: parsed.error.flatten() }, { status: 400 });
    }

    const { sellerId, productName, offerAmount } = parsed.data;

    const { data: rows } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', sellerId);

    if (!rows?.length) return NextResponse.json({ ok: true });

    webPush.setVapidDetails('mailto:support@guardiao.app', VAPID_PUBLIC, VAPID_PRIVATE);

    const payload = JSON.stringify({
      title: 'Nova oferta no Marketplace',
      body: `Oferta de R$ ${offerAmount.toLocaleString('pt-BR')} em ${productName}`,
      url: '/marketplace/ofertas',
    });

    await Promise.all(
      rows.map((row) => {
        const sub = row.subscription_json as { endpoint: string; keys: { p256dh: string; auth: string } };
        return webPush.sendNotification(sub, payload).catch(() => {});
      })
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'Erro ao enviar push' }, { status: 500 });
  }
}
