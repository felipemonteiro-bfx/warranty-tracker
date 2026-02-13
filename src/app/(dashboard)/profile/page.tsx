'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2, Bell, Smartphone, Globe, Crown, ShieldAlert, Users, Plus, Trash2, FolderOpen, Heart, Anchor, Download, SmartphoneNfc, CreditCard, ExternalLink, Building2, Briefcase, HeartHandshake, FileBadge, Lock, Timer, History, MapPin, Phone, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { 
        full_name: '', 
        cpf: '', 
        phone: '',
        profile_type: 'personal', 
        legacy_enabled: false,
        address_street: '',
        address_number: '',
        address_complement: '',
        address_neighborhood: '',
        address_city: '',
        address_state: '',
        address_zipcode: '',
        birth_date: '',
        gender: ''
      });
      setNewEmail(user.email || '');
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      fetchProfile();
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao salvar.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user.email) {
      setEditingEmail(false);
      return;
    }
    
    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      toast.success('Email atualizado! Verifique sua caixa de entrada para confirmar.');
      setEditingEmail(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar email.');
    } finally {
      setUpdatingEmail(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Gestão <span className="text-emerald-600">Patrimonial</span></h1>
          <p className="text-slate-500 font-medium">Segurança, Legado e Configurações de Elite.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Timer className="h-32 w-32 text-emerald-500" /></div>
            <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Sucessão Digital</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Death Switch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Em caso de ausência prolongada, seu herdeiro receberá o acesso ao cofre.</p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Informações Pessoais */}
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm"><User className="h-5 w-5 text-emerald-600" /> Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Nome Completo" 
                    value={profile?.full_name || ''} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                    placeholder="Seu nome completo"
                  />
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      <Mail className="h-4 w-4 text-emerald-600" /> Email
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        value={editingEmail ? newEmail : (user?.email || '')} 
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={!editingEmail}
                        type="email"
                        className="flex-1"
                      />
                      {editingEmail ? (
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            onClick={handleUpdateEmail}
                            disabled={updatingEmail}
                            size="sm"
                            className="bg-emerald-600 text-white"
                          >
                            {updatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => { setEditingEmail(false); setNewEmail(user?.email || ''); }}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button"
                          onClick={() => setEditingEmail(true)}
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <Input 
                    label="CPF" 
                    value={profile?.cpf || ''} 
                    onChange={(e) => setProfile({...profile, cpf: e.target.value})} 
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <Input 
                    label="Telefone" 
                    value={profile?.phone || ''} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                    placeholder="(00) 00000-0000"
                    type="tel"
                  />
                  <Input 
                    label="Data de Nascimento" 
                    value={profile?.birth_date || ''} 
                    onChange={(e) => setProfile({...profile, birth_date: e.target.value})} 
                    type="date"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      <User className="h-4 w-4 text-emerald-600" /> Gênero
                    </label>
                    <select 
                      value={profile?.gender || ''} 
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-teal-50 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Selecione</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                      <option value="prefer_not_to_say">Prefiro não informar</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm"><MapPin className="h-5 w-5 text-emerald-600" /> Endereço</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Input 
                    label="CEP" 
                    value={profile?.address_zipcode || ''} 
                    onChange={(e) => setProfile({...profile, address_zipcode: e.target.value})} 
                    placeholder="00000-000"
                    maxLength={9}
                    className="md:col-span-1"
                  />
                </div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <Input 
                    label="Rua/Avenida" 
                    value={profile?.address_street || ''} 
                    onChange={(e) => setProfile({...profile, address_street: e.target.value})} 
                    placeholder="Nome da rua"
                    className="md:col-span-3"
                  />
                  <Input 
                    label="Número" 
                    value={profile?.address_number || ''} 
                    onChange={(e) => setProfile({...profile, address_number: e.target.value})} 
                    placeholder="123"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Complemento" 
                    value={profile?.address_complement || ''} 
                    onChange={(e) => setProfile({...profile, address_complement: e.target.value})} 
                    placeholder="Apto, Bloco, etc."
                  />
                  <Input 
                    label="Bairro" 
                    value={profile?.address_neighborhood || ''} 
                    onChange={(e) => setProfile({...profile, address_neighborhood: e.target.value})} 
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Input 
                    label="Cidade" 
                    value={profile?.address_city || ''} 
                    onChange={(e) => setProfile({...profile, address_city: e.target.value})} 
                    placeholder="Nome da cidade"
                    className="md:col-span-2"
                  />
                  <Input 
                    label="Estado" 
                    value={profile?.address_state || ''} 
                    onChange={(e) => setProfile({...profile, address_state: e.target.value})} 
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saving} 
                className="px-12 h-16 font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-500/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" /> Salvar Todas as Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
