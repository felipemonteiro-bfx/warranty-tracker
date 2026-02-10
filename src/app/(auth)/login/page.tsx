import { AuthForm } from '@/components/shared/AuthForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const logoUrl = "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-teal-50/20">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-2xl border-2 border-white mx-auto">
            <Image 
              src={logoUrl} 
              alt="Logo Guardião" 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Bem-vindo de volta<span className="text-emerald-600">.</span></h1>
            <p className="text-slate-500 font-medium text-sm">Acesse o seu Guardião para gerenciar suas notas.</p>
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl shadow-2xl shadow-emerald-500/5">
          <AuthForm mode="login" />
        </div>

        <p className="text-center text-sm font-bold text-slate-400">
          Ainda não tem conta?{' '}
          <Link href="/signup" className="text-emerald-600 hover:underline">
            Crie uma agora
          </Link>
        </p>
      </div>
    </div>
  );
}
