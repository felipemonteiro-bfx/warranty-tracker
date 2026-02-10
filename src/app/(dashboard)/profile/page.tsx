'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data || {
        full_name: user.user_metadata?.full_name || '',
        cpf: user.user_metadata?.cpf || '',
        birth_date: user.user_metadata?.birth_date || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Minha <span className="text-emerald-600">Conta</span>
        </h1>
        <p className="text-slate-500 font-medium">Gerencie seus dados e segurança.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Lado Esquerdo: Card de Status */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-20 w-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Status: Ativo</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Conta Verificada</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Dica do Guardião</h4>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
              Mantenha seu CPF atualizado para facilitar a geração de dossiês em caso de sinistros ou vendas.
            </p>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" /> Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                      <Mail className="h-4 w-4 text-emerald-600" /> E-mail (Principal)
                    </label>
                    <Input value={user?.email} disabled className="bg-slate-50 border-slate-200 opacity-60" />
                  </div>
                  
                  <Input 
                    label="Nome Completo" 
                    value={profile?.full_name} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                        <Fingerprint className="h-4 w-4 text-emerald-600" /> CPF
                      </label>
                      <Input 
                        placeholder="000.000.000-00"
                        value={profile?.cpf} 
                        onChange={(e) => setProfile({...profile, cpf: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                        <Calendar className="h-4 w-4 text-emerald-600" /> Data de Nascimento
                      </label>
                      <Input 
                        type="date"
                        value={profile?.birth_date} 
                        onChange={(e) => setProfile({...profile, birth_date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-end">
                  <Button type="submit" disabled={saving} className="px-8 h-14">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                    Atualizar Dados
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
