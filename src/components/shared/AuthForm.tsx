'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
              cpf: cpf,
              birth_date: birthDate
            }
          },
        });
        if (error) throw error;
        toast.success('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      const message = err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : err.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleAuth} 
        className="space-y-4 w-full"
      >
        {mode === 'signup' && (
          <>
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
              <Input
                label="Data de Nascimento"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          </>
        )}
        
        <Input
          label="E-mail"
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          placeholder="Sua senha secreta"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold"
          >
            {error}
          </motion.div>
        )}

        <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mode === 'login' ? (
            <span className="flex items-center gap-2">Entrar na Conta <LogIn className="h-5 w-5" /></span>
          ) : (
            <span className="flex items-center gap-2">Criar minha Conta <UserPlus className="h-5 w-5" /></span>
          )}
        </Button>
      </motion.form>

      {/* Seção Fale Conosco */}
      <div className="pt-8 border-t border-teal-100">
        <h4 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-4 text-center">Fale Conosco</h4>
        <div className="grid grid-cols-1 gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-teal-50">
            <Mail className="h-4 w-4 text-emerald-600" />
            <span>suporte@guardiaonotas.com.br</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-teal-50">
            <Phone className="h-4 w-4 text-emerald-600" />
            <span>(11) 9999-9999</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-teal-50">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Av. Paulista, 1000 - São Paulo, SP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
