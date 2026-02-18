'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { supabaseFetcherWithRetry } from '@/lib/supabase-fetcher';

export function useProfile(userId: string | undefined) {
  const supabase = createClient();

  const { data, error, mutate, isLoading } = useSWR(
    userId ? ['profile', userId] : null,
    () =>
      supabaseFetcherWithRetry(async () => {
        const { data: d, error: e } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId!)
          .single();
        return { data: d, error: e };
      }),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return { profile: data, error, mutate, isLoading };
}
