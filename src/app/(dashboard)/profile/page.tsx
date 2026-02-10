'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2, Bell, Smartphone, Globe, Crown, ShieldAlert, Users, Plus, Trash2, FolderOpen, Heart, Anchor } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [newShare, setNewShare] = useState({ email: '', folder: 'Casa' });
  const [settings, setSettings] = useState({
    email_alerts: true,
    whatsapp_alerts: false,
    public_profile: false,
  });
  const supabase = createClient();

  const folders = ['Pessoal', 'Trabalho', 'Casa', 'Veículo', 'Eletrônicos', 'Outros'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: '', cpf: '', birth_date: '', is_premium: false, legacy_enabled: false, legacy_contact_name: '', legacy_contact_email: '' });
      const { data: shareData } = await supabase.from('folder_shares').select('*').eq('owner_id', user.id);
      setShares(shareData || []);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (err: any) { toast.error('Erro ao salvar.'); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Configurações do <span className="text-emerald-600">Guardião</span></h1>
        <p className="text-slate-500 font-medium">Gestão de conta, segurança e sucessão patrimonial.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className={`border-none overflow-hidden relative ${profile?.is_premium ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-200 shadow-2xl' : 'bg-slate-900 text-white'}`}>
            <CardContent className="p-8 text-center space-y-6 relative z-10">
              <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center shadow-2xl ${profile?.is_premium ? 'bg-white text-emerald-600' : 'bg-emerald-50 text-white'}`}>{profile?.is_premium ? <Crown className="h-10 w-10" /> : <ShieldCheck className="h-10 w-10" />}</div>
              <div><h3 className="text-2xl font-black">{profile?.is_premium ? 'Membro Pro' : 'Plano Gratuito'}</h3><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{profile?.is_premium ? 'Proteção Ilimitada Ativa' : 'Proteção Básica'}</p></div>
            </CardContent>
          </Card>

          {/* NOVO: Card de Legado Digital */}
          <div className="p-8 rounded-[40px] bg-white border border-teal-50 shadow-xl space-y-4 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:scale-110 transition-transform duration-700"><Anchor className="h-32 w-32 text-emerald-600" /></div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Heart className="h-5 w-5" /></div>
              <h4 className="text-lg font-black text-slate-900">Legado Digital</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Garanta que sua família tenha acesso a todos os seus documentos e garantias em caso de imprevistos. Segurança que atravessa gerações.</p>
            {!profile?.is_premium && <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md w-fit">Recurso do Plano Família</p>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="border-b border-slate-50"><CardTitle className="flex items-center gap-2 text-slate-900"><User className="h-5 w-5 text-emerald-600" /> Dados Pessoais</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Nome Completo" value={profile?.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                  <Input label="CPF" value={profile?.cpf} onChange={(e) => setProfile({...profile, cpf: e.target.value})} />
                  <Input label="Data de Nascimento" type="date" value={profile?.birth_date} onChange={(e) => setProfile({...profile, birth_date: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            {/* SEÇÃO: Sucessão Patrimonial */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6"><CardTitle className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-emerald-400" /> Sucessão Patrimonial (Legado)</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">Ativar Plano de Sucessão</p>
                    <p className="text-xs text-slate-500 font-medium">Permitir que um herdeiro acesse seu cofre em caso de necessidade.</p>
                  </div>
                  <input type="checkbox" disabled={!profile?.is_premium} checked={profile?.legacy_enabled} onChange={(e) => setProfile({...profile, legacy_enabled: e.target.checked})} className="h-6 w-6 accent-emerald-600" />
                </div>

                <AnimatePresence>
                  {profile?.legacy_enabled && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-6 overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Nome do Herdeiro Guardião" placeholder="Ex: Esposa ou Filho" value={profile?.legacy_contact_name} onChange={(e) => setProfile({...profile, legacy_contact_name: e.target.value})} />
                        <Input label="E-mail do Herdeiro" placeholder="herdeiro@email.com" value={profile?.legacy_contact_email} onChange={(e) => setProfile({...profile, legacy_contact_email: e.target.value})} />
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">Este herdeiro poderá solicitar acesso aos seus documentos. O Guardião enviará uma notificação para você e, caso não haja resposta em 15 dias, o acesso será liberado automaticamente.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-4"><Button type="submit" disabled={saving} className="px-10 h-14 font-black uppercase text-xs tracking-widest">{saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}Salvar Configurações</Button></div>
              </CardContent>
            </Card>
          </Card>
        </form>
      </div>
    </div>
  );
}

import { Info } from 'lucide-react';
