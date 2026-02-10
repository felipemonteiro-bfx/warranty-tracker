'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Fingerprint, Calendar, Loader2, Bell, Smartphone, Globe, Crown, ShieldAlert, Users, Plus, Trash2, FolderOpen, Heart, Anchor, Download, SmartphoneNfc, CreditCard, ExternalLink, Building2, Briefcase, HeartHandshake, FileBadge, Lock, Timer, Zap, History } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [warranties, setWarranties] = useState<any[]>([]);
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
        profile_type: 'personal', 
        legacy_enabled: false,
        legacy_contact_name: '',
        legacy_contact_email: '',
        legacy_inactivity_months: 6
      });
      
      const { data: items } = await supabase.from('warranties').select('*');
      if (items) setWarranties(items);
    }
    setLoading(false);
  };

  const generateSuccessionDossier = () => {
    if (!profile?.is_premium) {
      toast.error('O Dossiê de Sucessão é exclusivo para membros Pro!');
      return;
    }
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('INVENTÁRIO DE SUCESSÃO DIGITAL', 105, 25, { align: 'center' });
    doc.setFontSize(10); doc.text('DOCUMENTO PARA TRANSMISSÃO PATRIMONIAL EM CASO DE AUSÊNCIA', 105, 35, { align: 'center' });

    doc.setTextColor(15, 23, 42); doc.setFontSize(14); doc.text('1. Identificação do Titular', 14, 65);
    doc.setFontSize(10); doc.text(`Titular: ${profile.full_name}`, 14, 72);
    doc.text(`CPF: ${profile.cpf || 'Não informado'}`, 14, 77);
    doc.text(`Beneficiário Designado: ${profile.legacy_contact_name || 'Não informado'}`, 14, 82);

    doc.setFontSize(14); doc.text('2. Patrimônio Registrado e Localização', 14, 95);
    const tableData = warranties.map(w => [w.name, w.folder, `R$ ${Number(w.price).toLocaleString('pt-BR')}`, w.serial_number || '---']);
    autoTable(doc, { startY: 100, head: [['Ativo', 'Pasta/Setor', 'Valor de Aquisição', 'ID Serial']], body: tableData, headStyles: { fillColor: [15, 23, 42] } });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text('Este documento certifica a posse e o histórico de ativos monitorados.', 14, finalY);
    doc.text('O Guardião de Notas recomenda a guarda deste PDF em local seguro.', 14, finalY + 6);

    doc.save(`legado-guardiao-${profile.full_name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    toast.success('Dossiê de Sucessão gerado!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success('Configurações de Legado atualizadas!');
    } catch (err: any) { toast.error('Erro ao salvar.'); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Gestão <span className="text-emerald-600">Patrimonial</span></h1>
          <p className="text-slate-500 font-medium">Conta, Segurança e Transmissão de Legado.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Widget de Status de Legado (Death Switch UI) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className={`border-none shadow-xl overflow-hidden relative ${profile?.legacy_enabled ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-900'}`}>
            <div className={`h-1.5 w-full ${profile?.legacy_enabled ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${profile?.legacy_enabled ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <Timer className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tighter ${profile?.legacy_enabled ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Gatilho de Ausência</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile?.legacy_enabled ? 'Monitoramento Ativo' : 'Desativado'}</p>
                </div>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${profile?.legacy_enabled ? 'text-slate-400' : 'text-slate-500'}`}>
                Se você ficar mais de **{profile?.legacy_inactivity_months} meses** sem acessar o sistema, seu herdeiro receberá o dossiê completo.
              </p>
              <Button onClick={generateSuccessionDossier} variant="ghost" className={`w-full h-12 text-[10px] font-black uppercase tracking-widest border ${profile?.legacy_enabled ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-100 dark:border-white/5'}`}>Emitir Dossiê Agora</Button>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-500/20 space-y-4">
            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><HeartHandshake className="h-6 w-6" /></div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Por que o Legado?</h4>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Garantir que sua família tenha acesso às notas fiscais e localizações dos seus bens em caso de emergência é a última prova de cuidado patrimonial.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm"><History className="h-5 w-5 text-emerald-600" /> Configuração de Sucessão</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <Input label="Herdeiro Designado" placeholder="Nome completo" value={profile?.legacy_contact_name} onChange={(e) => setProfile({...profile, legacy_contact_name: e.target.value})} />
                  <Input label="E-mail do Herdeiro" placeholder="herdeiro@email.com" value={profile?.legacy_contact_email} onChange={(e) => setProfile({...profile, legacy_contact_email: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prazo de Inatividade (Meses)</label>
                    <select 
                      value={profile?.legacy_inactivity_months}
                      onChange={(e) => setProfile({...profile, legacy_inactivity_months: Number(e.target.value)})}
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-teal-50 dark:border-white/5 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-sm"
                    >
                      <option value={3}>3 Meses</option>
                      <option value={6}>6 Meses</option>
                      <option value={12}>12 Meses</option>
                      <option value={24}>24 Meses</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                    <input 
                      type="checkbox" 
                      id="legacy_toggle" 
                      checked={profile?.legacy_enabled} 
                      onChange={(e) => setProfile({...profile, legacy_enabled: e.target.checked})}
                      className="h-6 w-6 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                    />
                    <label htmlFor="legacy_toggle" className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter cursor-pointer">Ativar Death Switch (Sucessão Automática)</label>
                  </div>
                </div>

                <div className="flex justify-end pt-4"><Button type="submit" disabled={saving} className="px-12 h-16 font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-500/20">{saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}Salvar Legado Pro</Button></div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
