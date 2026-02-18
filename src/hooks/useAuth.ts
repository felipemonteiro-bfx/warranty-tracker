import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/** Usuário mock para E2E (quando cookie test-bypass=true) */
const MOCK_USER: User = {
  id: 'test-e2e-user-id',
  email: 'test@e2e.local',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

function hasTestBypass(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('test-bypass=true');
}

/**
 * Hook para gerenciar autenticação do usuário
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // E2E: quando test-bypass está ativo, usar usuário mock
    if (hasTestBypass()) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) logger.info('User authenticated', { userId: session.user.id });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Error signing out', error as Error);
      throw error;
    }
    setUser(null);
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
