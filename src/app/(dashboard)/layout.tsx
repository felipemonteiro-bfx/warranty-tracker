import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClientWrapper from '@/components/shared/DashboardClientWrapper';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Se houver erro ao obter sessão, logar mas continuar
    if (sessionError) {
      console.warn('Erro ao obter sessão no DashboardLayout:', sessionError);
    }
    
    const cookieStore = await cookies();
    
    // BYPASS DE AUDITORIA: Permite que o Playwright teste a UI em ambiente local
    const isTestBypass = process.env.NODE_ENV === 'development' && cookieStore.get('test-bypass')?.value === 'true';

    if (!session && !isTestBypass) {
      redirect('/login');
    }

    return (
      <DashboardClientWrapper>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 pb-28 lg:pb-8">
            {children}
          </main>
          <Footer />
        </div>
      </DashboardClientWrapper>
    );
  } catch (error) {
    // Se houver erro no Server Component, logar mas não lançar
    console.error('Erro no DashboardLayout (Server Component):', error);
    
    // Em desenvolvimento, tentar renderizar mesmo com erro
    if (process.env.NODE_ENV === 'development') {
      return (
        <DashboardClientWrapper>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 pb-28 lg:pb-8">
              {children}
            </main>
            <Footer />
          </div>
        </DashboardClientWrapper>
      );
    }
    
    // Em produção, redirecionar para login
    redirect('/login');
  }
}
