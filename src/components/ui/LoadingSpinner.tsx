'use client';

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center gap-4', className)}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={cn('text-emerald-600', sizeClasses[size])} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-500 dark:text-slate-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl"
      >
        <LoadingSpinner size="lg" text={text || 'Carregando...'} />
      </motion.div>
    </motion.div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0e1621]">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );
}
