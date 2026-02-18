/**
 * Vercel Cron: Gera notificações de vencimento de garantia
 * Agende em vercel.json: "0 8 * * *" (8h diário)
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { addMonths, parseISO, differenceInDays, startOfDay } from 'date-fns';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const now = startOfDay(new Date());
  let created = 0;

  try {
    const { data: warranties } = await supabase.from('warranties').select('id, user_id, name, purchase_date, warranty_months');

    for (const w of warranties || []) {
      const exp = addMonths(parseISO(w.purchase_date), w.warranty_months);
      const days = differenceInDays(exp, now);

      if (days >= 0 && days <= 30) {
        const msg = days === 0
          ? `A garantia de ${w.name} vence hoje!`
          : `A garantia de ${w.name} vence em ${days} dias.`;

        const { error } = await supabase.from('notifications').insert({
          user_id: w.user_id,
          title: 'Garantia vence em breve',
          message: msg,
          read: false,
        });
        if (!error) created++;
      }
    }

    return NextResponse.json({ ok: true, created });
  } catch (err) {
    console.error('Cron alerts error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
