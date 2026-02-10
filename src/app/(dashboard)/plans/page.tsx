'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Zap, Crown, Users, ShieldCheck, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
      setIsPremium(!!data?.is_premium);
    }
  };

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    toast.info(`Iniciando checkout para o plano ${planName}...`);
    
    // Simulação de delay de pagamento
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', user.id);

        if (!error) {
          toast.success(`Parabéns! Você agora é um membro ${planName}!`);
          setIsPremium(true);
          router.refresh();
        }
      }
      setLoading(false);
    }, 2000);
  };

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      description: 'Ideal para quem está começando a se organizar.',
      features: ['Até 10 notas fiscais', 'IA Processadora Básica', 'Busca e Filtros', 'Compartilhamento de Notas'],
      current: !isPremium,
      icon: <Zap className="h-6 w-6 text-slate-400" />
    },
    {
      name: 'Guardião Pro',
      price: 'R$ 14,90',
      period: '/mês',
      description: 'Para quem valoriza segurança e praticidade total.',
      features: ['Notas Ilimitadas', 'IA Avançada (Preço + Loja)', 'Alertas via WhatsApp e E-mail', 'Suporte VIP Prioritário', 'Dossiê Jurídico Formal'],
      current: isPremium,
      popular: true,
      buttonText: 'Fazer Upgrade',
      icon: <Crown className="h-6 w-6 text-amber-500" />
    },
    {
      name: 'Família',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Proteção completa para toda a sua casa.',
      features: ['Tudo do Plano Pro', 'Até 5 Usuários Integrados', 'Relatórios Consolidados', 'Backup em Nuvem Externo', 'Consultor IA Ilimitado'],
      current: false,
      buttonText: 'Assinar Família',
      icon: <Users className="h-6 w-6 text-emerald-600" />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight text-slate-900">Escolha seu nível de <span className="text-emerald-600">Proteção</span></h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">O Guardião de Notas oferece soluções para cada necessidade. Evolua sua segurança patrimonial hoje mesmo.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="relative">
            {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Mais Escolhido</div>}
            <Card className={`h-full flex flex-col border-2 transition-all duration-500 ${plan.popular ? 'border-emerald-500 shadow-emerald-500/10 scale-105' : 'border-teal-50'}`}>
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl">{plan.icon}</div>
                  {plan.current && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Plano Ativo</span>}
                </div>
                <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline"><span className="text-4xl font-black text-slate-900">{plan.price}</span>{plan.period && <span className="text-slate-400 font-bold ml-1">{plan.period}</span>}</div>
                <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
              </CardHeader>
              <CardContent className="p-8 pt-4 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3"><div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-emerald-600" strokeWidth={4} /></div><span className="text-sm font-bold text-slate-600">{f}</span></div>
                  ))}
                </div>
                <div className="mt-10">
                  <Button 
                    variant={plan.popular ? 'primary' : 'outline'} 
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={loading || plan.current}
                    className="w-full h-14 text-base font-black"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (plan.current ? 'Seu Plano Atual' : plan.buttonText || 'Selecionar')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-10 glass rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
          <div><h3 className="text-xl font-bold text-slate-900 text-left">Garantia Guardião</h3><p className="text-sm text-slate-500 font-medium text-left">Satisfação garantida ou seu dinheiro de volta em até 7 dias.</p></div>
        </div>
        <div className="flex items-center gap-2"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="ml-2 font-black text-slate-900">4.9/5 Avaliação dos Usuários</span></div>
      </div>
    </div>
  );
}