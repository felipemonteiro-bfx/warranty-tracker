'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2, Bell, Smartphone, Globe, Crown, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    email_alerts: true,
    whatsapp_alerts: false,
    public_profile: false,
  });
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
        birth_date: user.user_metadata?.birth_date || '',
        is_premium: false
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
      toast.success('Perfil e configurações atualizados!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Configurações do <span className="text-emerald-600">Guardião</span></h1>
        <p className="text-slate-500 font-medium">Gerencie sua conta, notificações e nível de proteção.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Status Premium */}
          <Card className={`border-none overflow-hidden relative ${profile?.is_premium ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white' : 'bg-slate-900 text-white'}`}>
            <CardContent className="p-8 text-center space-y-6 relative z-10">
              <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center shadow-2xl ${profile?.is_premium ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                {profile?.is_premium ? <Crown className="h-10 w-10" /> : <ShieldCheck className="h-10 w-10" />}
              </div>
              <div>
                <h3 className="text-2xl font-black">{profile?.is_premium ? 'Membro Pro' : 'Plano Gratuito'}</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{profile?.is_premium ? 'Proteção Ilimitada Ativa' : 'Proteção Básica'}</p>
              </div>
              {!profile?.is_premium && (
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 font-black text-xs uppercase tracking-widest py-4">Fazer Upgrade Agora</Button>
              )}
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[32px] bg-amber-50 border border-amber-100 space-y-3">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Dica de Segurança</h4>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">Ative os alertas de WhatsApp para receber avisos de vencimento diretamente no seu celular em tempo real.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b border-slate-50"><CardTitle className="flex items-center gap-2 text-slate-900"><User className="h-5 w-5 text-emerald-600" /> Dados do Proprietário</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">E-mail Principal</label>
                    <Input value={user?.email} disabled className="bg-slate-50 opacity-60" />
                  </div>
                  <Input label="Nome Completo" value={profile?.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                  <Input label="CPF" value={profile?.cpf} onChange={(e) => setProfile({...profile, cpf: e.target.value})} />
                  <Input label="Data de Nascimento" type="date" value={profile?.birth_date} onChange={(e) => setProfile({...profile, birth_date: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader className="border-b border-slate-50"><CardTitle className="flex items-center gap-2 text-slate-900"><Bell className="h-5 w-5 text-emerald-600" /> Preferências de Alerta</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm"><Mail className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Alertas por E-mail</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Relatórios semanais e avisos críticos</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={settings.email_alerts} onChange={(e) => setSettings({...settings, email_alerts: e.target.checked})} className="h-6 w-6 accent-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm"><Smartphone className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Notificações WhatsApp</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Avisos instantâneos de vencimento</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!profile?.is_premium && <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-md uppercase">Pro</span>}
                      <input type="checkbox" disabled={!profile?.is_premium} checked={settings.whatsapp_alerts} onChange={(e) => setSettings({...settings, whatsapp_alerts: e.target.checked})} className="h-6 w-6 accent-emerald-600 disabled:opacity-30" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm"><Globe className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Perfil Público de Bens</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Permitir links de compartilhamento</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={settings.public_profile} onChange={(e) => setSettings({...settings, public_profile: e.target.checked})} className="h-6 w-6 accent-emerald-600" />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={saving} className="px-10 h-14 font-black uppercase text-xs tracking-widest">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}