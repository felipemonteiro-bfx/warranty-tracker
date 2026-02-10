'use client';

import { createClient } from '@/lib/supabase/client';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, AlertCircle, ShieldCheck, Plus, Search, Filter, Wallet, FileDown, TrendingUp, X, Trophy, Share2, MessageCircle, Clock, BellRing, PieChart as ChartIcon, CheckCircle2, HeartHandshake, FolderOpen, BarChart3, Plane, QrCode, Lock, ArrowDownRight, ArrowUpRight, Calculator, Landmark, CreditCard, Sparkles, RefreshCcw, Zap, BrainCircuit, Loader2, SendHorizonal, DownloadCloud, Fingerprint, Users } from 'lucide-react';
import { calculateExpirationDate, getDaysRemaining, formatDate } from '@/lib/utils/date-utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: user.user_metadata?.full_name, is_premium: false });
      
      // BUSCA COMPLEXA: Meus itens + Itens de pastas compartilhadas comigo
      const { data: myItems } = await supabase.from('warranties').select('*').eq('user_id', user.id);
      
      const { data: shares } = await supabase.from('folder_shares').select('folder_name, owner_id').eq('shared_with_email', user.email);
      
      let allItems = [...(myItems || [])];

      if (shares && shares.length > 0) {
        for (const share of shares) {
          const { data: sharedItems } = await supabase
            .from('warranties')
            .select('*')
            .eq('user_id', share.owner_id)
            .eq('folder', share.folder_name);
          
          if (sharedItems) {
            // Marcar como compartilhado para UI
            const processedShared = sharedItems.map(item => ({ ...item, is_shared: true }));
            allItems = [...allItems, ...processedShared];
          }
        }
      }

      setWarranties(allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setFilteredWarranties(allItems);
    }
    setLoading(false);
  };

  const totalValue = warranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const sharedCount = warranties.filter(w => w.is_shared).length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{greeting}, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Guardião'}</span>!</h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            {sharedCount > 0 ? <><Users className="h-4 w-4 text-emerald-600" /> Você possui {sharedCount} itens compartilhados pela família.</> : 'Seu patrimônio está auditado e seguro.'}
          </p>
        </div>
        <Link href="/products/new"><Button size="lg" className="shadow-2xl shadow-emerald-200 font-bold h-12 rounded-2xl"><Plus className="h-5 w-5 mr-2" /> Nova Nota</Button></Link>
      </header>

      {/* Stats Cards com Contexto de Família */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-white dark:bg-slate-900 shadow-xl p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">Patrimônio Consolidado</p>
          <div className="text-4xl font-black text-slate-900 dark:text-white">R$ {totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Soma de todos os itens do grupo</p>
        </Card>

        <Card className="border-none bg-emerald-600 text-white shadow-xl p-8 flex flex-col justify-center shadow-emerald-500/20">
          <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Score de Proteção</p>
          <div className="text-4xl font-black">98%</div>
          <p className="text-[10px] text-emerald-100 font-bold uppercase mt-2">Segurança máxima ativa</p>
        </Card>

        <Card className="border-none bg-slate-900 text-white shadow-xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10"><Users className="h-32 w-32" /></div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Itens na Rede</p>
          <div className="text-4xl font-black">{warranties.length}</div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase mt-2">{sharedCount} compartilhados</p>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredWarranties.map((w) => (
            <motion.div key={w.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
              {w.is_shared && (
                <div className="absolute -top-3 -right-3 z-20 bg-amber-500 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-slate-900" title="Compartilhado com você">
                  <Users className="h-3 w-3" />
                </div>
              )}
              <WarrantyCard warranty={w} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}