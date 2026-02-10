'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2, Bell, Smartphone, Globe, Crown, ShieldAlert, Users, Plus, Trash2, FolderOpen } from 'lucide-react';
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
      setProfile(profileData || { full_name: '', cpf: '', birth_date: '', is_premium: false });

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
      toast.success('Perfil e configurações atualizados!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.is_premium) {
      toast.error('O compartilhamento familiar é exclusivo para membros Pro ou Família.');
      return;
    }
    try {
      const { error } = await supabase.from('folder_shares').insert({
        owner_id: user.id,
        folder_name: newShare.folder,
        invited_email: newShare.email
      });
      if (error) throw error;
      toast.success(`Acesso à pasta ${newShare.folder} enviado para ${newShare.email}!`);
      setNewShare({ email: '', folder: 'Casa' });
      fetchProfile();
    } catch (err) {
      toast.error('Erro ao compartilhar pasta.');
    }
  };

  const removeShare = async (id: string) => {
    const { error } = await supabase.from('folder_shares').delete().eq('id', id);
    if (!error) {
      toast.success('Acesso removido.');
      fetchProfile();
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
                <Button onClick={() => window.location.href='/plans'} className="w-full bg-emerald-500 hover:bg-emerald-400 font-black text-xs uppercase tracking-widest py-4 shadow-emerald-500/20">Fazer Upgrade Agora</Button>
              )}
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[32px] bg-emerald-50 border border-emerald-100 space-y-3">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2"><Users className="h-4 w-4" /> Conta Família</h4>
            <p className="text-xs text-emerald-700 font-medium leading-relaxed">Compartilhe pastas com seu cônjuge ou filhos para que todos tenham acesso às notas fiscais da casa.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b border-slate-50"><CardTitle className="flex items-center gap-2 text-slate-900"><User className="h-5 w-5 text-emerald-600" /> Dados do Proprietário</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 ml-1">E-mail</label><Input value={user?.email} disabled className="bg-slate-50 opacity-60" /></div>
                  <Input label="Nome Completo" value={profile?.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                  <Input label="CPF" value={profile?.cpf} onChange={(e) => setProfile({...profile, cpf: e.target.value})} />
                  <Input label="Data de Nascimento" type="date" value={profile?.birth_date} onChange={(e) => setProfile({...profile, birth_date: e.target.value})} />
                </div>
                <div className="flex justify-end pt-4"><Button type="submit" disabled={saving} className="px-10 h-12 font-black uppercase text-[10px] tracking-widest">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}Salvar Perfil</Button></div>
              </CardContent>
            </Card>
          </form>

          {/* NOVO: Gestão de Compartilhamento */}
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
              <CardTitle className="flex items-center gap-2 text-slate-900"><Users className="h-5 w-5 text-emerald-600" /> Guardiões Convidados (Família)</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleAddShare} className="grid md:grid-cols-3 gap-4 items-end bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="md:col-span-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">E-mail do Membro</label><Input placeholder="ex@email.com" value={newShare.email} onChange={(e) => setNewShare({...newShare, email: e.target.value})} required className="h-12" /></div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pasta para Compartilhar</label>
                  <select value={newShare.folder} onChange={(e) => setNewShare({...newShare, folder: e.target.value})} className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all">
                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <Button type="submit" className="h-12 w-full font-black uppercase text-[10px] tracking-widest gap-2"><Plus className="h-4 w-4" /> Convidar</Button>
              </form>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acessos Ativos</h4>
                {shares.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 italic text-sm">Você ainda não compartilha pastas com ninguém.</div>
                ) : (
                  shares.map(share => (
                    <div key={share.id} className="flex items-center justify-between p-4 bg-white border border-teal-50 rounded-2xl shadow-sm group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><FolderOpen className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{share.invited_email}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Tem acesso à pasta: <span className="text-emerald-600">{share.folder_name}</span></p>
                        </div>
                      </div>
                      <button onClick={() => removeShare(share.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
