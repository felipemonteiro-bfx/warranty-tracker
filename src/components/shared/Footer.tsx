import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-6">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Dados Criptografados
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Link href="/institucional" className="hover:text-emerald-600 transition-colors">Sobre</Link>
            <Link href="/terms" className="hover:text-emerald-600 transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacidade</Link>
            <Link href="/compliance" className="hover:text-emerald-600 transition-colors">Compliance</Link>
          </div>

          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            &copy; {new Date().getFullYear()} Guardião de Notas S.A.
          </p>
        </div>
      </div>
    </footer>
  );
};
