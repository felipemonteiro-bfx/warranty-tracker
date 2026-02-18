'use client';

import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = memo(({ label, className, error, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5 w-full"
    >
      {label && (
        <motion.label 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 block"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        <motion.input
          initial={{ scale: 0.98 }}
          animate={{ scale: isFocused ? 1 : 0.98 }}
          transition={{ duration: 0.2 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'flex h-12 w-full rounded-xl border-2 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : isFocused
              ? 'border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
              : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600',
            className
          )}
          {...(props as any)}
        />
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-bold text-red-600 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

Input.displayName = 'Input';