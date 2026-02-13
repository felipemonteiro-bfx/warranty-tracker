'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const pathname = usePathname();

  // Esconder a barra em páginas de login/signup ou compartilhamento público
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/share');
  if (isAuthPage) return null;

  const navItems = [
    { name: 'Início', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Cofre', path: '/vault', icon: <ShieldCheck className="h-5 w-5" /> },
    { name: 'Nova Nota', path: '/products/new', icon: <Plus className="h-6 w-6" />, primary: true },
    { name: 'Perfil', path: '/profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-[100] safe-area-inset-bottom">
      <nav className="glass rounded-[32px] p-2 flex items-center justify-around shadow-2xl border border-white/20 dark:border-white/5 relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          if (item.primary) {
            return (
              <Link key={item.path} href={item.path} aria-label={item.name}>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/40 -translate-y-2 border-4 border-white dark:border-slate-900"
                  role="button"
                  aria-label={item.name}
                >
                  {item.icon}
                </motion.div>
              </Link>
            );
          }

          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className="relative flex flex-col items-center gap-1 p-2"
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} aria-hidden="true">
                {item.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 h-1 w-1 bg-emerald-500 rounded-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
