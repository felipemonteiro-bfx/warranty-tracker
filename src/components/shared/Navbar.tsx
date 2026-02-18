'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/Button';
import { LogOut, LayoutDashboard, User, Crown, Bell, X, Check, BarChart3, Users, ShieldCheck, Wrench, History, ShieldBan, Shield, ShoppingBag, Gift, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      fetchNotifications();
    } catch (error) {
      console.warn('Erro ao inicializar Navbar:', error);
    }
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).limit(5);
        if (error) {
          console.warn('Erro ao buscar notificações:', error);
          return;
        }
        if (data) setNotifications(data);
      }
    } catch (error) {
      console.warn('Erro ao buscar notificações:', error);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Alerta arquivado.');
    }
  };

  return (
    <>
      {/* Mobile Header - hidden on desktop (sidebar takes over) */}
      <nav className="lg:hidden sticky top-0 z-50 px-4 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Guardião<span className="text-emerald-600 text-xl">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 p-0 rounded-xl"
                aria-label={`Notificações${notifications.length > 0 ? ` (${notifications.length} não lidas)` : ''}`}
              >
                <Bell className={`h-5 w-5 ${notifications.length > 0 ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </Button>
              <AnimatePresence>{showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-border/30 overflow-hidden z-50">
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Alertas</span>
                    <button onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-slate-400" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-2 no-scrollbar bg-white/50 dark:bg-slate-900/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px]">Tudo em dia!</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-border/30 flex items-start justify-between gap-3 group">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-emerald-600 uppercase">{n.title}</p>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight">{n.message}</p>
                        </div>
                        <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Link href="/notifications" onClick={() => setShowNotifications(false)} className="block p-3 bg-slate-50 dark:bg-slate-900 text-center text-[10px] font-black text-emerald-600 uppercase hover:underline">
                    Ver Central Completa
                  </Link>
                </motion.div>
              )}</AnimatePresence>
            </div>

            {/* Hamburger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-16 left-4 right-4 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/30 overflow-hidden"
            >
              <div className="p-4 space-y-1">
                <MobileMenuLink href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} title="Painel" onClick={() => setMobileMenuOpen(false)} active={pathname === '/dashboard'} />
                <MobileMenuLink href="/vault" icon={<ShieldCheck className="h-5 w-5" />} title="Cofre" onClick={() => setMobileMenuOpen(false)} active={pathname === '/vault'} />
                <MobileMenuLink href="/marketplace" icon={<ShoppingBag className="h-5 w-5" />} title="Marketplace" onClick={() => setMobileMenuOpen(false)} active={pathname === '/marketplace'} />
                <MobileMenuLink href="/analytics" icon={<BarChart3 className="h-5 w-5" />} title="Análises" onClick={() => setMobileMenuOpen(false)} active={pathname === '/analytics'} />
                <div className="border-t border-border/30 my-2" />
                <MobileMenuLink href="/maintenance" icon={<Wrench className="h-5 w-5" />} title="Revisões" onClick={() => setMobileMenuOpen(false)} active={pathname === '/maintenance'} />
                <MobileMenuLink href="/family" icon={<Users className="h-5 w-5" />} title="Família" onClick={() => setMobileMenuOpen(false)} active={pathname === '/family'} />
                <MobileMenuLink href="/referral" icon={<Gift className="h-5 w-5" />} title="Indique e Ganhe" onClick={() => setMobileMenuOpen(false)} active={pathname === '/referral'} />
                <div className="border-t border-border/30 my-2" />
                <MobileMenuLink href="/profile" icon={<User className="h-5 w-5" />} title="Perfil" onClick={() => setMobileMenuOpen(false)} active={pathname === '/profile'} />
                <MobileMenuLink href="/plans" icon={<Crown className="h-5 w-5" />} title="Upgrade" onClick={() => setMobileMenuOpen(false)} active={pathname === '/plans'} />
                <button
                  onClick={() => {
                    try {
                      supabase.auth.signOut().then(() => router.push('/login'));
                      setMobileMenuOpen(false);
                    } catch (error) {
                      console.warn('Erro ao fazer logout:', error);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-black uppercase tracking-tighter">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

function MobileMenuLink({ href, icon, title, onClick, active }: { href: string, icon: React.ReactNode, title: string, onClick: () => void, active?: boolean }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
      <div className={`${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{icon}</div>
      <span className="text-sm font-black uppercase tracking-tighter">{title}</span>
    </Link>
  );
}
