'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/Button';
import {
  LayoutDashboard, ShieldCheck, ShoppingBag, BarChart3,
  Wrench, Users, History, Gift, ShieldBan,
  Eye, EyeOff, User, LogOut, Crown, Shield,
  Landmark, QrCode, Mail, Bell, ScanLine, FileWarning,
  RefreshCw, UsersRound, Wallet, Code2, ShieldPlus,
  TrendingUp, WifiOff, FileSpreadsheet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

const mainLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/vault', icon: ShieldCheck, label: 'Cofre' },
  { href: '/patrimony', icon: Landmark, label: 'Patrimônio' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { href: '/analytics', icon: BarChart3, label: 'Análises' },
];

const toolLinks = [
  { href: '/maintenance', icon: Wrench, label: 'Revisões' },
  { href: '/smart-alerts', icon: Bell, label: 'Alertas' },
  { href: '/family', icon: Users, label: 'Família' },
  { href: '/audit', icon: History, label: 'Auditoria' },
  { href: '/referral', icon: Gift, label: 'Indique e Ganhe' },
  { href: '/notifications/recalls', icon: ShieldBan, label: 'Recall Central' },
];

const monetizationLinks = [
  { href: '/insurance/extended', icon: ShieldPlus, label: 'Garantia Estendida' },
  { href: '/cashback', icon: Wallet, label: 'Cashback' },
  { href: '/price-history', icon: TrendingUp, label: 'Preços' },
];

const automationLinks = [
  { href: '/auto-register', icon: Mail, label: 'Auto-Cadastro' },
  { href: '/nfe-scanner', icon: ScanLine, label: 'Scanner NF-e' },
  { href: '/qr-transfer', icon: QrCode, label: 'QR Transfer' },
  { href: '/claims/workflow', icon: FileWarning, label: 'Sinistros' },
];

const advancedLinks = [
  { href: '/sync', icon: RefreshCw, label: 'Sincronização' },
  { href: '/family/sync', icon: UsersRound, label: 'Sync Familiar' },
  { href: '/insurance/inventory', icon: FileSpreadsheet, label: 'Inventário' },
  { href: '/api-b2b', icon: Code2, label: 'API B2B' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('privacy_mode') === 'true';
      setIsPrivate(saved);
      if (saved) document.documentElement.classList.add('privacy-active');
    } catch (error) {
      console.warn('Erro ao inicializar Sidebar:', error);
    }
  }, []);

  const togglePrivacy = () => {
    const newState = !isPrivate;
    setIsPrivate(newState);
    localStorage.setItem('privacy_mode', newState.toString());
    if (newState) {
      document.documentElement.classList.add('privacy-active');
      toast.info('Modo Privacidade Ativado: Valores ocultos.');
    } else {
      document.documentElement.classList.remove('privacy-active');
      toast.success('Modo Privacidade Desativado.');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.warn('Erro ao fazer logout:', error);
    }
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-40 flex-col border-r border-border/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/30">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Guardião<span className="text-emerald-600 text-2xl">.</span>
          </span>
        </Link>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Menu
        </p>
        {mainLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="ml-auto h-2 w-2 rounded-full bg-emerald-500"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-4 mx-3 border-t border-border/30" />

        <p className="px-3 mb-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Ferramentas
        </p>
        {toolLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-4 mx-3 border-t border-border/30" />

        <p className="px-3 mb-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Monetização
        </p>
        {monetizationLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-4 mx-3 border-t border-border/30" />

        <p className="px-3 mb-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Automação
        </p>
        {automationLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-4 mx-3 border-t border-border/30" />

        <p className="px-3 mb-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Avançado
        </p>
        {advancedLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-4 py-3">
        <Link href="/plans">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wider">Upgrade Pro</span>
            </div>
            <p className="text-[11px] opacity-80">Desbloqueie todos os recursos</p>
          </div>
        </Link>
      </div>

      {/* Rodape da Sidebar */}
      <div className="px-4 py-4 border-t border-border/30 space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePrivacy}
            className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-emerald-600"
            title={isPrivate ? 'Desativar privacidade' : 'Ativar privacidade'}
          >
            {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <ThemeToggle />
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" title="Perfil">
              <User className="h-4 w-4 text-emerald-600" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
