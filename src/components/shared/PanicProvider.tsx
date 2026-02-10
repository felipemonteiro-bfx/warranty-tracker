'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldAlert } from 'lucide-react';

const PanicContext = createContext({
  isPanicked: false,
  togglePanic: () => {},
});

export const usePanic = () => useContext(PanicContext);

export default function PanicProvider({ children }: { children: React.ReactNode }) {
  const [isPanicked, setIsPanicked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('panic_mode') === 'true';
    setIsPanicked(saved);
  }, []);

  const togglePanic = () => {
    const newState = !isPanicked;
    setIsPanicked(newState);
    localStorage.setItem('panic_mode', newState.toString());
    document.title = newState ? "Minhas Anotações" : "Guardião de Notas - Gestão Patrimonial";
  };

  return (
    <PanicContext.Provider value={{ isPanicked, togglePanic }}>
      <AnimatePresence mode="wait">
        {isPanicked ? (
          <motion.div 
            key="panic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#fafafa] text-slate-800 p-8 font-serif"
          >
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex justify-between items-center border-b pb-4 border-slate-200">
                <h1 className="text-2xl font-medium text-slate-400 italic">Bloco de Notas</h1>
                <button onClick={togglePanic} className="opacity-0 w-10 h-10 cursor-default">Secret</button>
              </div>
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