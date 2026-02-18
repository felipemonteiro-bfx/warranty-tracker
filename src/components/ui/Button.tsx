'use client';

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = memo(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-emerald-300',
    secondary: 'bg-cyan-900 text-white hover:bg-cyan-800',
    outline: 'border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-600 hover:text-emerald-600 bg-transparent text-slate-700 dark:text-slate-300',
    ghost: 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95',
    variants[variant],
    sizes[size],
    className
  );

  if (!isMounted) {
    return <button className={classes} {...props} />;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={classes}
      {...(props as any)}
    />
  );
});

Button.displayName = 'Button';