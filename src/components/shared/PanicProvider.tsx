'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldAlert, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PanicContext = createContext({
  isPanicked: false,
  togglePanic: () => {},
  setPanicPassword: (pw: string) => {},
});

export const usePanic = () => useContext(PanicContext);

export default function PanicProvider({ children }: { children: React.ReactNode }) {
  const [isPanicked, setIsPanicked] = useState(false);
  const [password, setPassword] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [inputPw, setInputPw] = useState('');

  useEffect(() => {
    const savedMode = localStorage.getItem('panic_mode') === 'true';
    const savedPw = localStorage.getItem('panic_password') || '1234'; // Senha padrão inicial
    setIsPanicked(savedMode);
    setPassword(savedPw);
  }, []);

  const togglePanic = () => {
    if (!isPanicked) {
      // Ativar é instantâneo e sem senha (emergência)
      setIsPanicked(true);
      localStorage.setItem('panic_mode', 'true');
      document.title = "Minhas Anotações";
    } else {
      // Tentar sair: abre o prompt de senha
      setShowUnlock(true);
    }
  };

  const handleUnlock = () => {
    if (inputPw === password) {
      setIsPanicked(false);
      setShowUnlock(false);
      setInputPw('');
      localStorage.setItem('panic_mode', 'false');
      document.title = "Guardião de Notas - Gestão Patrimonial";
      toast.success('Acesso restaurado.');
    } else {
      toast.error('Senha de pânico incorreta.');
      setInputPw('');
    }
  };

  const setPanicPassword = (pw: string) => {
    setPassword(pw);
    localStorage.setItem('panic_password', pw);
  };

  return (
    <PanicContext.Provider value={{ isPanicked, togglePanic, setPanicPassword }}>
      <AnimatePresence mode="wait">
        {isPanicked ? (
          <motion.div 
            key="panic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#fafafa] text-slate-800 p-8 font-serif cursor-default"
          >
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex justify-between items-center border-b pb-4 border-slate-200">
                <h1 className="text-2xl font-medium text-slate-400 italic">Bloco de Notas</h1>
                <button onClick={togglePanic} className="opacity-0 w-10 h-10 cursor-default">Secret</button>
              </div>

              {showUnlock ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-4 max-w-xs mx-auto text-center font-sans">
                  <Lock className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Digite sua senha de pânico</p>
                  <input 
                    autoFocus
                    type="password" 
                    value={inputPw}
                    onChange={(e) => setInputPw(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUnlock} className="flex-1 h-10 bg-slate-900 text-white rounded-lg text-xs font-bold">Desbloquear</button>
                    <button onClick={() => setShowUnlock(false)} className="flex-1 h-10 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">Cancelar</button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-5 w-5 rounded border border-slate-300 flex items-center justify-center"><Check className="h-3 w-3 text-slate-300" /></div>
                    <p className="text-lg">Comprar pão e leite na volta do trabalho.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-5 w-5 rounded border border-slate-300 flex items-center justify-center"><Check className="h-3 w-3 text-slate-300" /></div>
                    <p className="text-lg">Ligar para o dentista e desmarcar consulta.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-5 w-5 rounded border border-slate-300"></div>
                    <p className="text-lg">Pesquisar roteiro para viagem de final de ano.</p>
                  </div>
                  <textarea className="w-full h-64 bg-transparent border-none focus:ring-0 text-lg resize-none" placeholder="Continuar escrevendo..."></textarea>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </PanicContext.Provider>
  );
}
