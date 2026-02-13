'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface AdBannerProps {
  userCategories?: string[];
  className?: string;
}

export function AdBanner({ userCategories = [], className = '' }: AdBannerProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAd();
  }, [userCategories]);

  const fetchAd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar categorias do usuário se não foram passadas
      let categories = userCategories;
      if (categories.length === 0) {
        const { data: warranties } = await supabase
          .from('warranties')
          .select('category')
          .eq('user_id', user.id);
        categories = [...new Set((warranties || []).map((w: any) => w.category).filter(Boolean))];
      }

      // Buscar campanha ativa que corresponde às categorias
      const now = new Date().toISOString();
      const { data: campaigns } = await supabase
        .from('ad_campaigns')
        .select('*, advertisers(name)')
        .eq('is_active', true)
        .lte('start_at', now)
        .gte('end_at', now);

      if (!campaigns || campaigns.length === 0) {
        setLoading(false);
        return;
      }

      // Filtrar campanhas que têm overlap com categorias do usuário
      const matchingCampaigns = campaigns.filter((campaign: any) => {
        if (!campaign.target_categories || campaign.target_categories.length === 0) return true;
        return campaign.target_categories.some((cat: string) => categories.includes(cat));
      });

      if (matchingCampaigns.length === 0) {
        setLoading(false);
        return;
      }

      // Selecionar campanha aleatória
      const selectedCampaign = matchingCampaigns[Math.floor(Math.random() * matchingCampaigns.length)];
      setAd(selectedCampaign);

      // Registrar impressão
      await supabase.from('ad_impressions').insert({
        campaign_id: selectedCampaign.id,
        user_id: user.id,
        category_shown: categories[0] || null,
        clicked: false,
      });
    } catch (err) {
      console.error('Erro ao buscar anúncio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ad) return;
    
    // Registrar clique
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('ad_impressions')
        .update({ clicked: true })
        .eq('campaign_id', ad.id)
        .eq('user_id', user.id)
        .order('shown_at', { ascending: false })
        .limit(1);
    }

    window.open(ad.link_url, '_blank', 'noopener,noreferrer');
  };

  if (loading || dismissed || !ad) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl ${className}`}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div
          onClick={handleClick}
          className="cursor-pointer p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {ad.image_url && (
            <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0">
              <Image
                src={ad.image_url}
                alt={ad.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Patrocinado</p>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
              {ad.name}
            </h4>
            {ad.advertisers?.name && (
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{ad.advertisers.name}</p>
            )}
          </div>
          <ExternalLink className="h-5 w-5 text-slate-400 shrink-0" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
