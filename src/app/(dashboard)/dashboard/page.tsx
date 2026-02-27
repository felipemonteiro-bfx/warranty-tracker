'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { WarrantyCard } from '@/components/warranties/WarrantyCard';
import { LoadingSpinner, LoadingPage } from '@/components/ui/LoadingSpinner';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Filter, Grid, List, Calendar, ShieldAlert, ShieldCheck, ShieldX, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { SectionErrorBoundary } from '@/components/shared/SectionErrorBoundary';
import { useDebounce } from '@/hooks/useDebounce';
import { Warranty } from '@/types/supabase';
import { toast } from 'sonner';
import { normalizeError, getUserFriendlyMessage, logError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { IS_DEMO_MODE } from '@/lib/config';
import { motion } from 'framer-motion';
import { AdBanner } from '@/components/ads/AdBanner';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'expiring' | 'expired';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!authLoading && !user) {
      try {
        router.push('/login');
      } catch (error) {
        logger.warn('Erro ao redirecionar para login', { error: String(error) });
        window.location.href = '/login';
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchWarranties();
    }
  }, [user, debouncedSearch, filterStatus]);

  const fetchWarranties = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const query = supabase
        .from('warranties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        const isTableMissing = msg.includes('relation') && msg.includes('does not exist');
        const isSchemaCache = msg.includes('schema cache') || msg.includes('could not find the table');
        const isPermission = error.code === '42501' || msg.includes('permission denied');

        if (isTableMissing || isSchemaCache) {
          logger.warn('Tabela warranties indisponível', { code: error.code, msg });
          setWarranties([]);
          return;
        }
        if (isPermission) {
          logger.warn('Sem permissão para acessar warranties (RLS)', { code: error.code });
          setWarranties([]);
          return;
        }
        throw error;
      }

      let filtered = data || [];

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filtered = filtered.filter(w =>
          w.name.toLowerCase().includes(searchLower) ||
          w.category?.toLowerCase().includes(searchLower) ||
          w.store?.toLowerCase().includes(searchLower)
        );
      }

      if (filterStatus !== 'all') {
        filtered = filtered.filter(w => {
          const expirationDate = new Date(w.purchase_date);
          expirationDate.setMonth(expirationDate.getMonth() + w.warranty_months);
          const daysRemaining = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (filterStatus === 'expired') return daysRemaining < 0;
          if (filterStatus === 'expiring') return daysRemaining >= 0 && daysRemaining <= 30;
          if (filterStatus === 'active') return daysRemaining > 30;
          return true;
        });
      }

      setWarranties(filtered);
      logger.info('Warranties fetched', { count: filtered.length });
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError);
      const message = getUserFriendlyMessage(appError);
      if (message) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Memoizar estatísticas (cálculo custoso) - DEVE estar antes de qualquer return
  const stats = useMemo(() => {
    if (!user || !warranties.length) {
      return {
        total: 0,
        active: 0,
        expiring: 0,
        expired: 0,
      };
    }
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    return warranties.reduce((acc, w) => {
      const expirationDate = new Date(w.purchase_date);
      expirationDate.setMonth(expirationDate.getMonth() + w.warranty_months);
      const daysRemaining = Math.ceil((expirationDate.getTime() - now) / oneDay);

      acc.total++;
      if (daysRemaining > 30) acc.active++;
      else if (daysRemaining >= 0 && daysRemaining <= 30) acc.expiring++;
      else acc.expired++;

      return acc;
    }, { total: 0, active: 0, expiring: 0, expired: 0 });
  }, [warranties, user]);

  if (authLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <SectionErrorBoundary sectionName="dashboard">
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Meu Cofre
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie suas garantias e proteja seu patrimônio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {IS_DEMO_MODE && (
            <Button
              variant="outline"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                try {
                  const res = await fetch('/api/seed-mock', { method: 'POST' });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success(data.message || 'Dados de teste criados.');
                    fetchWarranties();
                  } else {
                    toast.error(data.error || 'Erro ao gerar dados.');
                  }
                } catch {
                  toast.error('Erro ao gerar dados de teste.');
                } finally {
                  setSeeding(false);
                }
              }}
              className="h-12 px-4 rounded-xl font-bold uppercase tracking-wider"
            >
              <FlaskConical className="h-5 w-5 mr-2" />
              {seeding ? 'Gerando...' : 'Dados de teste'}
            </Button>
            )}
            <Button
              onClick={() => router.push('/products/new')}
              className="h-12 px-6 rounded-xl font-black uppercase tracking-wider shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Garantia
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Total"
              value={stats.total}
              icon={<ShieldCheck className="h-5 w-5" />}
              color="emerald"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Ativas"
              value={stats.active}
              icon={<ShieldCheck className="h-5 w-5" />}
              color="emerald"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Vencendo"
              value={stats.expiring}
              icon={<ShieldAlert className="h-5 w-5" />}
              color="amber"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard
              label="Expiradas"
              value={stats.expired}
              icon={<ShieldX className="h-5 w-5" />}
              color="red"
            />
          </motion.div>
        </motion.div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar garantias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className="h-12 px-4 rounded-xl"
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('active')}
              className="h-12 px-4 rounded-xl"
            >
              Ativas
            </Button>
            <Button
              variant={filterStatus === 'expiring' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('expiring')}
              className="h-12 px-4 rounded-xl"
            >
              Vencendo
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('expired')}
              className="h-12 px-4 rounded-xl"
            >
              Expiradas
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="h-12 w-12 rounded-xl"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
              className="h-12 w-12 rounded-xl"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Lista de Garantias */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : warranties.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
              Nenhuma garantia encontrada
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Tente ajustar seus filtros de busca'
                : 'Comece adicionando sua primeira garantia'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button
                onClick={() => router.push('/products/new')}
                className="h-12 px-6 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Primeira Garantia
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Anúncios Segmentados */}
            {warranties.length > 0 && (
              <div className="col-span-full mb-6">
                <AdBanner userCategories={[...new Set(warranties.map(w => w.category).filter((c): c is string => Boolean(c)))]} />
              </div>
            )}

            <motion.div
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              {warranties.map((warranty, index) => (
                <motion.div
                  key={warranty.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }
                  }}
                >
                  <WarrantyCard warranty={warranty} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
    </div>
    </SectionErrorBoundary>
  );
}

const StatCard = memo(({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: 'emerald' | 'amber' | 'red' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`p-6 rounded-2xl border ${colorClasses[color]} cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-bold uppercase tracking-wider"
        >
          {label}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="text-3xl font-black"
      >
        {value}
      </motion.div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';
