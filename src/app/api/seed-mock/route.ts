import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Garantias mockadas
    const mockWarranties = [
      { user_id: userId, name: 'Notebook Dell Inspiron 15 3000', category: 'Informática', purchase_date: baseDate(120), warranty_months: 24, store: 'Magazine Luiza', price: 3499.9, notes: 'Compra Black Friday. Inclui mouse e mochila.', serial_number: 'DL123456789BR', total_saved: 0, invoice_url: null, folder: 'Pessoal', maintenance_frequency_months: 6, last_maintenance_date: baseDate(30) },
      { user_id: userId, name: 'iPhone 14 Pro 128GB', category: 'Celulares', purchase_date: baseDate(200), warranty_months: 12, store: 'Apple Store', price: 7499, notes: 'Apple Care+ até dez/2025.', serial_number: 'DNQP12ABC34', total_saved: 150, invoice_url: null, folder: 'Pessoal', maintenance_frequency_months: 12, last_maintenance_date: baseDate(90) },
      { user_id: userId, name: 'Geladeira Brastemp Frost Free', category: 'Eletrodomésticos', purchase_date: baseDate(400), warranty_months: 36, store: 'Casas Bahia', price: 2899, notes: 'Instalação incluída. Porta reversível.', serial_number: 'BRF2023123456', total_saved: 0, invoice_url: null, folder: 'Casa', maintenance_frequency_months: 12, last_maintenance_date: baseDate(180) },
      { user_id: userId, name: 'Smart TV Samsung 55" QLED', category: 'TV e Vídeo', purchase_date: baseDate(60), warranty_months: 12, store: 'Americanas', price: 4299, notes: 'Garantia estendida 2 anos na loja.', serial_number: 'SN55Q70T2024', total_saved: 0, invoice_url: null, folder: 'Pessoal', maintenance_frequency_months: 6, last_maintenance_date: baseDate(20) },
      { user_id: userId, name: 'Furadeira Bosch GSB 21-2 RCT', category: 'Ferramentas', purchase_date: baseDate(30), warranty_months: 24, store: 'Leroy Merlin', price: 599.9, notes: 'Kit com maleta e acessórios.', serial_number: 'BOS2024XYZ789', total_saved: 0, invoice_url: null, folder: 'Oficina', maintenance_frequency_months: 24, last_maintenance_date: null },
    ];

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

    return NextResponse.json({
      ok: true,
      message: 'Dados de teste criados com sucesso.',
      ...results,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
