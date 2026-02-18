'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { supabaseFetcherWithRetry } from '@/lib/supabase-fetcher';
import type { Warranty } from '@/types/supabase';

export function useWarranties(userId: string | undefined, search = '', filterStatus: 'all' | 'active' | 'expiring' | 'expired' = 'all') {
  const supabase = createClient();

  const fetcher = async () => {
    return supabaseFetcherWithRetry<Warranty[]>(async () => {
      const { data: d, error: e } = await supabase
        .from('warranties')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      return { data: d || [], error: e };
    });
  };

  const { data, error, mutate, isLoading } = useSWR(
    userId ? ['warranties', userId, search, filterStatus] : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 5000 }
  );

  let filtered = data || [];
  const searchLower = search.toLowerCase();
  if (searchLower) {
    filtered = filtered.filter(
      (w) =>
        w.name.toLowerCase().includes(searchLower) ||
        w.category?.toLowerCase().includes(searchLower) ||
        w.store?.toLowerCase().includes(searchLower)
    );
  }
  if (filterStatus !== 'all') {
    const now = new Date();
    filtered = filtered.filter((w) => {
      const exp = new Date(w.purchase_date);
      exp.setMonth(exp.getMonth() + w.warranty_months);
      const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (filterStatus === 'active') return days > 30;
      if (filterStatus === 'expiring') return days >= 0 && days <= 30;
      if (filterStatus === 'expired') return days < 0;
      return true;
    });
  }

  return { warranties: filtered, error, mutate, isLoading };
}
