'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.log('Erro ao registrar Service Worker:', error);
        });
    }

    // Detectar evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o app');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Não mostrar em desktop ou se já estiver instalado
  if (typeof window === 'undefined' || window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-4 right-4 z-[99] lg:hidden"
        >
          <div className="glass rounded-2xl p-4 shadow-2xl border border-teal-50 dark:border-white/5 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Instalar App
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Instale o Guardião para acesso rápido
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-emerald-600 text-white font-black text-[10px] uppercase px-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallPrompt(false)}
                className="h-10 w-10 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
