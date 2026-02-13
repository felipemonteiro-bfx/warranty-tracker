'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export function InsurancePartnersCard({ warrantyId }: { warrantyId: string }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_partners')
        .select('*')
        .eq('is_active', true)
        .order('commission_percent', { ascending: false })
        .limit(4);

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Erro ao buscar parceiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = async (partner: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar cotação
      await supabase.from('insurance_quotes').insert({
        user_id: user.id,
        warranty_id: warrantyId,
        partner_id: partner.id,
        status: 'quoted',
      });

      // Abrir URL do parceiro (com template se existir)
      const url = partner.quote_url_template 
        ? partner.quote_url_template.replace('{warranty_id}', warrantyId)
        : partner.quote_url_template || '#';
      
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Redirecionando para ${partner.name}...`);
    } catch (err) {
      toast.error('Erro ao registrar cotação.');
    }
  };

  if (loading) {
    return (
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="p-6">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (partners.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="p-6 text-center space-y-2">
          <ShieldCheck className="h-8 w-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase">Parceiros em breve</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white">
      <CardContent className="p-6 space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Cotar com Parceiros</h4>
        <div className="space-y-3">
          {partners.map((partner) => (
            <button
              key={partner.id}
              onClick={() => handleQuote(partner)}
              className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {partner.logo_url ? (
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">
                      {partner.name}
                    </p>
                    {partner.commission_percent > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">
                        Comissão: {partner.commission_percent}%
                      </p>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center uppercase font-bold mt-2">
          Ao contratar, você ajuda a plataforma a crescer
        </p>
      </CardContent>
    </Card>
  );
}
