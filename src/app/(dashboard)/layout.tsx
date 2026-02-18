import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClientWrapper from '@/components/shared/DashboardClientWrapper';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.warn('Erro ao obter usuário no DashboardLayout:', userError);
    }

    const cookieStore = await cookies();

    // Bypass para testes Playwright - APENAS em development
    const isTestBypass = process.env.NODE_ENV === 'development' && cookieStore.get('test-bypass')?.value === 'true';

    if (!user && !isTestBypass) {
      redirect('/login');
    }

    const dashboardContent = (
      <DashboardClientWrapper>
        <div className="min-h-screen bg-background flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-28 lg:pb-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </DashboardClientWrapper>
    );

    return dashboardContent;
  } catch (error) {
    // Se houver erro no Server Component, logar mas não lançar
    console.error('Erro no DashboardLayout (Server Component):', error);

    // Em desenvolvimento, tentar renderizar mesmo com erro
    if (process.env.NODE_ENV === 'development') {
      return (
        <DashboardClientWrapper>
          <div className="min-h-screen bg-background flex">
            <Sidebar />
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-28 lg:pb-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </DashboardClientWrapper>
      );
    }
    
    // Em produção, redirecionar para login
    redirect('/login');
  }
}
