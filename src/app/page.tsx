'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap, Bell, FileText, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const logoUrl = "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) router.push('/dashboard');
    });
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 -z-10 h-full w-full bg-teal-50/30">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(16,185,129,0.1)] opacity-50 blur-[80px]"></div>
      </div>

      <main className="max-w-4xl space-y-12">
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative h-24 w-24 overflow-hidden rounded-3xl shadow-2xl border-4 border-white"
          >
            <Image 
              src={logoUrl} 
              alt="Logo Guardião" 
              fill 
              className="object-cover"
              unoptimized
            />
          </motion.div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black uppercase tracking-widest animate-bounce">
          <Zap className="h-4 w-4" /> Inteligência Artificial integrada
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
            O seu <span className="gradient-text">Guardião</span> de Notas.
          </h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-500 font-medium leading-relaxed">
            Proteja suas garantias com tecnologia. O Guardião organiza suas notas fiscais e utiliza IA para monitorar prazos automaticamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-16 px-10 text-xl gap-2 group">
              Começar Proteção <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="h-16 px-10 text-xl">
              Entrar
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-20 text-left">
          <div className="p-6 rounded-3xl bg-white shadow-xl shadow-emerald-500/5 border border-teal-50 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">IA Processadora</h3>
            <p className="text-sm text-slate-500 font-medium">Extração automática de dados e sugestão inteligente de garantias.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white shadow-xl shadow-emerald-500/5 border border-teal-50 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-white">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">Alertas Ativos</h3>
            <p className="text-sm text-slate-500 font-medium">O Guardião te avisa antes do vencimento para você nunca perder seus direitos.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white shadow-xl shadow-emerald-500/5 border border-teal-50 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">Segurança Total</h3>
            <p className="text-sm text-slate-500 font-medium">Notas fiscais armazenadas com criptografia e acesso restrito.</p>
          </div>
        </div>

        <div className="pt-20 border-t border-teal-100 flex flex-col items-center gap-4">
          <h4 className="text-sm font-black text-teal-800 uppercase tracking-widest">Fale Conosco</h4>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" /> suporte@guardiaonotas.com.br</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-600" /> (11) 9999-9999</div>
          </div>
        </div>
      </main>

      <footer className="mt-24 text-slate-400 text-sm font-medium pb-12">
        © 2026 Guardião de Notas. Inteligência em Garantias.
      </footer>
    </div>
  );
}
