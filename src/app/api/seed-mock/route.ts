import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildMockWarranties } from '@/lib/mock-data';

/**
 * Gera dados mock completos para testar toda a aplicação.
 * POST /api/seed-mock — requer usuário autenticado.
 * Inclui: profiles, warranties, notifications, maintenance_logs, lending_logs,
 * folder_shares, marketplace_listings, claims.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = user.id;
    const now = new Date();
    const baseDate = (d: number) => {
      const d2 = new Date(now);
      d2.setDate(d2.getDate() - d);
      return d2.toISOString().split('T')[0];
    };

    // Profile completo (colunas extras se existirem no schema)
    await supabase.from('profiles').upsert({
      id: userId,
      nickname: user.user_metadata?.nickname || `user_${userId.slice(0, 8)}`,
      avatar_url: user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${userId}`,
      status: 'online',
      full_name: user.user_metadata?.full_name ?? 'Usuário Teste',
      cpf: user.user_metadata?.cpf ?? '123.456.789-00',
      profile_type: 'personal',
      is_premium: false,
    }, { onConflict: 'id' });

    // Garantias mockadas (mix ativas, vencendo, expiradas para apresentação)
    const mockWarranties = buildMockWarranties(userId, baseDate);

    const { data: insertedWarranties, error: warrantiesError } = await supabase
      .from('warranties')
      .insert(mockWarranties)
      .select('id');

    if (warrantiesError) {
      return NextResponse.json({ error: warrantiesError.message }, { status: 500 });
    }

    const warrantyIds = (insertedWarranties ?? []).map((w) => w.id);
    const w1 = warrantyIds[0];
    const w2 = warrantyIds[1];
    const w3 = warrantyIds[2];

    const results: Record<string, number | string> = { warranties: warrantyIds.length };

    // Notifications (não quebra se a tabela não existir)
    try {
      const { error: notifErr } = await supabase.from('notifications').insert([
        { user_id: userId, title: 'Garantia próxima do vencimento', message: 'Notebook Dell Inspiron 15 3000 vence em 30 dias.', read: false },
        { user_id: userId, title: 'Lembrete de manutenção', message: 'Smart TV Samsung está na data de revisão.', read: false },
        { user_id: userId, title: 'Bem-vindo ao Guardião', message: 'Seus dados de teste foram criados com sucesso.', read: true },
      ]);
      if (!notifErr) results.notifications = 3;
    } catch {
      // tabela pode não existir
    }

    // Maintenance logs (1–2 por garantia)
    if (w1) {
      try {
        await supabase.from('maintenance_logs').insert([
          { warranty_id: w1, date: baseDate(30), description: 'Limpeza de ventilação e troca de pasta térmica.' },
          { warranty_id: w1, date: baseDate(90), description: 'Primeira revisão pós-compra.' },
        ]);
        if (w2) await supabase.from('maintenance_logs').insert([{ warranty_id: w2, date: baseDate(90), description: 'Verificação de bateria e software.' }]);
        if (w3) await supabase.from('maintenance_logs').insert([{ warranty_id: w3, date: baseDate(180), description: 'Limpeza do condensador e verificação de vedação.' }]);
        results.maintenance_logs = 5;
      } catch {
        // tabela pode não existir
      }
    }

    // Lending logs
    if (w1 && w2) {
      try {
        await supabase.from('lending_logs').insert([
          { warranty_id: w1, borrower_name: 'Maria Silva', borrower_contact: 'maria@email.com', expected_return_date: baseDate(-7), status: 'returned', returned_at: baseDate(-8) },
          { warranty_id: w2, borrower_name: 'João Santos', borrower_contact: '(11) 99999-0000', expected_return_date: baseDate(14), status: 'active' },
        ]);
        results.lending_logs = 2;
      } catch {
        // tabela pode não existir
      }
    }

    // Folder shares
    try {
      await supabase.from('folder_shares').insert([
        { owner_id: userId, folder_name: 'Casa', shared_with_email: 'familia@email.com', permission: 'editor' },
        { owner_id: userId, folder_name: 'Pessoal', shared_with_email: 'backup@email.com', permission: 'viewer' },
      ]);
      results.folder_shares = 2;
    } catch {
      // tabela pode não existir
    }

    // Marketplace listings
    if (w1 && w2) {
      try {
        await supabase.from('marketplace_listings').insert([
          { user_id: userId, warranty_id: w1, listing_price: 2899, status: 'active' },
          { user_id: userId, warranty_id: w2, listing_price: 6499, status: 'active' },
        ]);
        results.marketplace_listings = 2;
      } catch {
        // tabela pode não existir
      }
    }

    // Claims (suporte)
    if (w1) {
      try {
        await supabase.from('claims').insert([
          { user_id: userId, warranty_id: w1, title: 'Tecla com defeito', status: 'in_progress', description: 'Tecla Enter não responde após 2 meses de uso.' },
        ]);
        results.claims = 1;
      } catch {
        // tabela pode não existir
      }
    }

    // Insurance Partners (seguradoras parceiras)
    try {
      const { data: existingPartners } = await supabase.from('insurance_partners').select('id').limit(1);
      if (!existingPartners || existingPartners.length === 0) {
        await supabase.from('insurance_partners').insert([
          { name: 'Porto Seguro', slug: 'porto-seguro', logo_url: 'https://logos-world.net/wp-content/uploads/2021/02/Porto-Seguro-Logo.png', quote_url_template: 'https://www.portoseguro.com.br/cotacao?ref=guardiao', commission_percent: 15, is_active: true },
          { name: 'SulAmérica', slug: 'sulamerica', logo_url: 'https://www.sulamerica.com.br/assets/img/logo-sulamerica.svg', quote_url_template: 'https://www.sulamerica.com.br/cotacao?ref=guardiao', commission_percent: 12, is_active: true },
          { name: 'Bradesco Seguros', slug: 'bradesco-seguros', logo_url: 'https://www.bradescoseguros.com.br/assets/img/logo-bradesco.svg', quote_url_template: 'https://www.bradescoseguros.com.br/cotacao?ref=guardiao', commission_percent: 18, is_active: true },
        ]);
        results.insurance_partners = 3;
      }
    } catch {
      // tabela pode não existir
    }

    // Advertisers e Campanhas
    try {
      const { data: existingAds } = await supabase.from('advertisers').select('id').limit(1);
      if (!existingAds || existingAds.length === 0) {
        const { data: advertiser1 } = await supabase.from('advertisers').insert({ name: 'Magazine Luiza', contact_email: 'marketing@magazineluiza.com.br', status: 'active' }).select('id').single();
        const { data: advertiser2 } = await supabase.from('advertisers').insert({ name: 'Americanas', contact_email: 'ads@americanas.com.br', status: 'active' }).select('id').single();
        
        if (advertiser1) {
          await supabase.from('ad_campaigns').insert({
            advertiser_id: advertiser1.id,
            name: 'Ofertas em Eletrônicos',
            target_categories: ['Informática', 'Celulares', 'TV e Vídeo'],
            image_url: 'https://via.placeholder.com/300x150?text=Magazine+Luiza',
            link_url: 'https://www.magazineluiza.com.br/eletronicos',
            cpm_cents: 500,
            cpc_cents: 50,
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          });
        }
        
        if (advertiser2) {
          await supabase.from('ad_campaigns').insert({
            advertiser_id: advertiser2.id,
            name: 'Eletrodomésticos em Promoção',
            target_categories: ['Eletrodomésticos', 'TV e Vídeo'],
            image_url: 'https://via.placeholder.com/300x150?text=Americanas',
            link_url: 'https://www.americanas.com.br/eletrodomesticos',
            cpm_cents: 600,
            cpc_cents: 60,
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          });
        }
        
        results.ad_campaigns = 2;
      }
    } catch {
      // tabela pode não existir
    }

    // Referral code (gerar se não existir)
    try {
      const { data: profile } = await supabase.from('profiles').select('referral_code').eq('id', userId).single();
      if (profile && !profile.referral_code) {
        const code = `REF${userId.slice(0, 8).toUpperCase()}`;
        await supabase.from('profiles').update({ referral_code: code }).eq('id', userId);
        results.referral_code = 'gerado';
      }
    } catch {
      // ignora
    }

    // Insurance Quotes (cotações de exemplo)
    try {
      const { data: partners } = await supabase.from('insurance_partners').select('id').eq('is_active', true).limit(2);
      if (partners && partners.length > 0 && w1) {
        await supabase.from('insurance_quotes').insert([
          { user_id: userId, warranty_id: w1, partner_id: partners[0].id, premium_estimate: 89.90, status: 'quoted' },
          { user_id: userId, warranty_id: w1, partner_id: partners.length > 1 ? partners[1].id : partners[0].id, premium_estimate: 95.50, status: 'quoted' },
        ]);
        results.insurance_quotes = 2;
      }
    } catch {
      // tabela pode não existir
    }

    // Marketplace Transactions (transações fechadas com taxa)
    try {
      const { data: listings } = await supabase.from('marketplace_listings').select('id, user_id, listing_price, platform_fee_percent').eq('user_id', userId).limit(1);
      if (listings && listings.length > 0 && w1) {
        const listing = listings[0];
        const feePercent = listing.platform_fee_percent || 5;
        const feeAmount = (Number(listing.listing_price) * feePercent) / 100;
        await supabase.from('marketplace_transactions').insert([
          {
            listing_id: listing.id,
            buyer_id: userId, // Em produção seria outro usuário
            seller_id: listing.user_id,
            amount: listing.listing_price,
            platform_fee_percent: feePercent,
            platform_fee_amount: feeAmount,
            status: 'completed',
          },
        ]);
        results.marketplace_transactions = 1;
      }
    } catch {
      // tabela pode não existir
    }

    // Ad Impressions (impressões de exemplo)
    try {
      const { data: campaigns } = await supabase.from('ad_campaigns').select('id').eq('is_active', true).limit(1);
      if (campaigns && campaigns.length > 0) {
        await supabase.from('ad_impressions').insert([
          { campaign_id: campaigns[0].id, user_id: userId, category_shown: 'Informática', clicked: false },
          { campaign_id: campaigns[0].id, user_id: userId, category_shown: 'Celulares', clicked: true },
        ]);
        results.ad_impressions = 2;
      }
    } catch {
      // tabela pode não existir
    }

    // Referral Tracking (exemplos de indicações)
    try {
      await supabase.from('referral_tracking').insert([
        { referrer_id: userId, referred_email: 'amigo1@email.com', status: 'signed_up', signed_up_at: baseDate(-10) },
        { referrer_id: userId, referred_email: 'amigo2@email.com', status: 'converted', signed_up_at: baseDate(-20), converted_at: baseDate(-15) },
      ]);
      results.referral_tracking = 2;
    } catch {
      // tabela pode não existir ou já tem dados
    }

    return NextResponse.json({
      ok: true,
      message: 'Dados de teste criados com sucesso.',
      ...results,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
