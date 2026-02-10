'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Package, ShieldCheck, User, Plus, FileText, Zap, X, LayoutDashboard, BarChart3, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const togglePalette = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchItems = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('warranties')
        .select('id, name, category, folder')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      setResults(data || []);
      setLoading(false);
    };

    const timer = setTimeout(searchItems, 300);
    return () => clearTimeout(timer);
  }, [query, supabase]);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  const actions = [
    { name: 'Ir para o Painel', icon: <LayoutDashboard className="h-4 w-4" />, path: '/dashboard' },
    { name: 'Ver meu Cofre', icon: <ShieldCheck className="h-4 w-4" />, path: '/vault' },
    { name: 'Cadastrar Nova Nota', icon: <Plus className="h-4 w-4" />, path: '/products/new' },
    { name: 'Análises Patrimoniais', icon: <BarChart3 className="h-4 w-4" />, path: '/analytics' },
    { name: 'Configurações de Perfil', icon: <User className="h-4 w-4" />, path: '/profile' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-teal-50 dark:border-white/5 overflow-hidden"
          >
            <div className="p-6 flex items-center gap-4 border-b border-teal-50 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50">
              <Search className="h-6 w-6 text-emerald-600" />
              <input 
                autoFocus
                placeholder="Busque por produtos, pastas ou comandos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-400 uppercase">
                ESC
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 no-scrollbar">
              {query.length < 2 ? (
                <div className="space-y-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações Rápidas</p>
                  {actions.map((action, i) => (
                    <button 
                      key={i} 
                      onClick={() => navigateTo(action.path)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all group"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                        {action.icon}
                      </div>
                      <span className="font-black text-sm uppercase tracking-tight">{action.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados da Busca</p>
                  {loading ? (
                    <div className="p-10 text-center"><Zap className="h-6 w-6 text-emerald-500 animate-pulse mx-auto" /></div>
                  ) : results.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhum ativo encontrado.</div>
                  ) : (
                    results.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => navigateTo(`/products/${item.id}`)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tighter">{item.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.category} • {item.folder}</p>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600"><Plus className="h-4 w-4" /></div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-teal-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><span className="text-[9px] font-bold text-slate-400">↑↓</span> <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Navegar</span></div>
                <div className="flex items-center gap-1.5"><span className="text-[9px] font-bold text-slate-400">ENTER</span> <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Abrir</span></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5" /> Guardião Search
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
