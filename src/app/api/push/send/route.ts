import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webPush from 'web-push';
import { z } from 'zod';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

export async function POST(req: Request) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ message: 'Push não configurado (VAPID)' }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const schema = z.object({ recipientId: z.string().uuid(), content: z.string().optional() });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'recipientId (uuid) obrigatório' }, { status: 400 });
    }
    const { recipientId, content = '' } = parsed.data;

    const { data: rows, error } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', recipientId);

    if (error || !rows?.length) {
      return NextResponse.json({ ok: true }); // destinatário sem push é sucesso
    }

    webPush.setVapidDetails(
      'mailto:support@example.com',
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );

    const title = 'Guardião de Notas';
    const bodyText = content.length > 80 ? content.substring(0, 80) + '...' : content;
    const payload = JSON.stringify({
      title,
      body: bodyText,
      url: '/',
    });

    const sendPromises = rows.map((row) => {
      const sub = row.subscription_json as { endpoint: string; keys: { p256dh: string; auth: string } };
      return webPush.sendNotification(sub, payload).catch((err: { statusCode?: number }) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expirada; poderia remover do banco
        }
      });
    });

    await Promise.all(sendPromises);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: 'Erro ao enviar push' }, { status: 500 });
  }
}
