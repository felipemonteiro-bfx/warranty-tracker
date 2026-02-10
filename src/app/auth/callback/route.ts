import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Usar o host do request para garantir a porta correta (3001)
  const host = request.headers.get('host');
  const protocol = requestUrl.protocol;
  const origin = `${protocol}//${host}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Erro ao trocar código por sessão:', error);
  } else {
    console.error('Nenhum código de autenticação fornecido');
  }

  // Se der erro, redireciona para uma página amigável (ou dashboard se já logado)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}