import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    // No middleware, usar variáveis diretamente (edge runtime)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Variáveis do Supabase não configuradas no middleware - continuando sem autenticação');
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Bypass de autenticação para testes (Playwright) - APENAS em development
    const isTestBypass = process.env.NODE_ENV === 'development' && request.cookies.get('test-bypass')?.value === 'true';

    const publicPaths = [
      '/login', '/signup', '/auth', '/share', '/travel-check',
      '/institucional', '/terms', '/privacy', '/compliance',
      '/dev-bypass', '/api/',
    ];
    const isPublicPath = request.nextUrl.pathname === '/' ||
      publicPaths.some(p => request.nextUrl.pathname.startsWith(p));

    if (!user && !isTestBypass && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // Se houver qualquer erro, permitir acesso mesmo assim (não bloquear navegação)
    console.warn('Erro ao atualizar sessão no middleware:', error);
    return supabaseResponse;
  }
}