'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Zap, Crown, Users, Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export default function PlansPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkStatus();

    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      toast.success('Assinatura realizada com sucesso! Bem-vindo ao Guardião Pro.');
    }
    if (canceled === 'true') {
      toast.info('Checkout cancelado. Você pode assinar quando quiser.');
    }
  }, [searchParams]);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('is_premium, plan_name').eq('id', user.id).single();
      setIsPremium(!!data?.is_premium);
      setCurrentPlan(data?.plan_name || (data?.is_premium ? 'pro' : 'free'));
    }
  };

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!priceId || priceId.startsWith('price_1Q...')) {
      toast.info('Em breve! Os planos pagos serão ativados em breve. Cadastre-se para ser notificado.');
      return;
    }

    setLoading(planName);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      window.location.href = url;
    } catch (err: any) {
      toast.error('Erro ao iniciar checkout: ' + err.message);
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('billing');
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      toast.error('Erro ao abrir portal: ' + err.message);
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      description: 'Essencial para quem está começando.',
      features: ['Até 10 notas fiscais', 'IA Básica (OCR)', 'Busca Simples', 'Alertas de vencimento'],
      current: !isPremium,
      icon: <Zap className="h-6 w-6 text-slate-400" />,
    },
    {
      id: 'pro',
      name: 'Guardião Pro',
      price: 'R$ 14,90',
      period: '/mês',
      priceId: 'price_1Q...',
      description: 'Potência total para seu patrimônio.',
      features: ['Notas Ilimitadas', 'IA Avançada + Busca Semântica', 'Dossiê Jurídico PDF', 'Alertas WhatsApp', 'Simulador de Seguros', 'Suporte Prioritário'],
      current: isPremium && currentPlan !== 'familia',
      popular: true,
      icon: <Crown className="h-6 w-6 text-amber-500" />,
    },
    {
      id: 'familia',
      name: 'Família',
      price: 'R$ 29,90',
      period: '/mês',
      priceId: 'price_1Q...',
      description: 'Segurança compartilhada para toda a casa.',
      features: ['Tudo do Pro', 'Até 5 Membros', 'Pastas Compartilhadas', 'Balanço Consolidado', 'Dossiê de Sucessão', 'Suporte VIP 24h'],
      current: currentPlan === 'familia',
      icon: <Users className="h-6 w-6 text-emerald-600" />,
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Assine o <span className="text-emerald-600">Guardião</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
          Libere ferramentas exclusivas de IA, proteção jurídica e gestão familiar.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan, idx) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className={`h-full flex flex-col border-2 transition-all ${plan.popular ? 'border-emerald-500 shadow-2xl md:scale-105' : 'border-slate-100 dark:border-white/10'}`}>
              {plan.popular && (
                <div className="bg-emerald-600 text-white text-center py-2 text-[10px] font-black uppercase tracking-widest">
                  Mais Popular
                </div>
              )}
              <CardHeader className="p-8">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl w-fit mb-4">{plan.icon}</div>
                <CardTitle className="text-2xl font-black dark:text-white">{plan.name}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-slate-400 font-bold">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
                {plan.current ? (
                  <div className="mt-10 space-y-3">
                    <Button disabled className="w-full h-14 opacity-60">
                      <CheckCircle2 className="h-5 w-5 mr-2" /> Seu Plano Atual
                    </Button>
                    {isPremium && plan.id !== 'free' && (
                      <Button
                        variant="outline"
                        onClick={handleManageBilling}
                        disabled={loading === 'billing'}
                        className="w-full h-12"
                      >
                        {loading === 'billing' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                        Gerenciar Assinatura
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.name)}
                    disabled={!!loading}
                    className={`w-full h-14 mt-10 ${plan.popular ? 'shadow-xl shadow-emerald-500/20' : ''}`}
                  >
                    {loading === plan.name ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Assinar Agora'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-2 pt-8">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
          Pagamento seguro via Stripe. Cancele a qualquer momento.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
