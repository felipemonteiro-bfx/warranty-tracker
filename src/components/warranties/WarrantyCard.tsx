'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import { Warranty } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate, calculateExpirationDate, getDaysRemaining } from '@/lib/utils/date-utils';
import { getCardBenefits, isPriceProtectionActive, getDaysRemainingPriceProtection } from '@/lib/card-benefits';
import { Calendar, Package, Clock, Trash2, ExternalLink, Pencil, ShieldAlert, ShieldCheck, ShieldX, Store, DollarSign, Info, Share2, HeartHandshake, FileBadge, Umbrella, MoreHorizontal, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export const WarrantyCard = memo(({ warranty }: { warranty: Warranty }) => {
  const router = useRouter();
  const supabase = createClient();
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavingInput, setShowSavingInput] = useState(false);
  const [savingAmount, setSavingAmount] = useState('');
  
  // Memoizar cálculos custosos
  const { expirationDate, daysRemaining, progress, isExpired, isExpiringSoon } = useMemo(() => {
    const expDate = calculateExpirationDate(warranty.purchase_date, warranty.warranty_months);
    const daysRem = getDaysRemaining(expDate);
    const totalDays = warranty.warranty_months * 30;
    const elapsedDays = totalDays - daysRem;
    const prog = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    
    return {
      expirationDate: expDate,
      daysRemaining: daysRem,
      progress: prog,
      isExpired: daysRem < 0,
      isExpiringSoon: daysRem >= 0 && daysRem <= 30,
    };
  }, [warranty.purchase_date, warranty.warranty_months]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/share/${warranty.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link de compartilhamento copiado!');
  }, [warranty.id]);

  const exportResalePDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('CERTIFICADO DE REVENDA SEGURA', 105, 25, { align: 'center' });
    
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(12);
    doc.text('Guardião de Notas - Documentação Verificada', 105, 35, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(warranty.name, 105, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Este produto possui garantia ativa até: ${formatDate(expirationDate)}`, 14, 80);
    doc.text(`Loja de Origem: ${warranty.store || 'Não informada'}`, 14, 90);
    doc.text(`Data da Compra: ${formatDate(warranty.purchase_date)}`, 14, 100);
    doc.text(`Valor de Mercado Sugerido: R$ ${Number(warranty.price || 0).toLocaleString('pt-BR')}`, 14, 110);

    if (warranty.notes) {
      doc.text('Observações do Vendedor:', 14, 130);
      doc.setFont('helvetica', 'italic');
      doc.text(warranty.notes, 14, 140, { maxWidth: 180 });
    }

    doc.save(`resale-dossier-${warranty.name}.pdf`);
    toast.success('Dossiê de revenda gerado!');
  }, [warranty, expirationDate]);

  const handleLogSaving = useCallback(async () => {
    const amount = Number(savingAmount);
    if (!savingAmount || isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }
    const { error } = await supabase.from('warranties').update({ total_saved: (Number(warranty.total_saved || 0) + amount) }).eq('id', warranty.id);
    if (!error) {
      toast.success(`Economia de R$ ${savingAmount} registrada!`);
      setSavingAmount('');
      setShowSavingInput(false);
      router.refresh();
    }
  }, [warranty.id, warranty.total_saved, savingAmount, supabase, router]);

  const handleDelete = useCallback(async () => {
    try {
      if (warranty.invoice_url) {
        const urlParts = warranty.invoice_url.split('/');
        const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
        await supabase.storage.from('invoices').remove([filePath]);
      }
      const { error } = await supabase.from('warranties').delete().eq('id', warranty.id);
      if (error) throw error;
      toast.success('Garantia removida!');
      setShowDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao excluir: ' + message);
    }
  }, [warranty.id, warranty.invoice_url, supabase, router]);

  // Memoizar statusConfig
  const statusConfig = useMemo(() => {
    if (isExpired) {
      return { 
        icon: <ShieldX className="h-4 w-4" />, 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        border: 'border-red-100 dark:border-red-900/50', 
        label: 'Expirada', 
        tip: 'Dica: Guarde a nota por mais 5 anos para fins fiscais.' 
      };
    }
    if (isExpiringSoon) {
      return { 
        icon: <ShieldAlert className="h-4 w-4" />, 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-50 dark:bg-amber-900/20', 
        border: 'border-amber-100 dark:border-amber-900/50', 
        label: 'Vencendo', 
        tip: 'Urgente: Verifique se o produto apresenta vícios antes do prazo.' 
      };
    }
    return { 
      icon: <ShieldCheck className="h-4 w-4" />, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
      border: 'border-emerald-100 dark:border-emerald-900/50', 
      label: 'Protegido', 
      tip: 'Segurança: Você tem cobertura total do fabricante.' 
    };
  }, [isExpired, isExpiringSoon]);

  // Benefícios do cartão de crédito
  const cardBenefits = useMemo(() => getCardBenefits((warranty as Record<string, unknown>).card_brand as string), [(warranty as Record<string, unknown>).card_brand]);

  const priceProtectionActive = useMemo(() => {
    if (!cardBenefits || cardBenefits.price_protection_days <= 0) return false;
    return isPriceProtectionActive(warranty.purchase_date, cardBenefits.price_protection_days);
  }, [cardBenefits, warranty.purchase_date]);

  const priceProtectionDaysLeft = useMemo(() => {
    if (!cardBenefits || cardBenefits.price_protection_days <= 0) return 0;
    return getDaysRemainingPriceProtection(warranty.purchase_date, cardBenefits.price_protection_days);
  }, [cardBenefits, warranty.purchase_date]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="group"
    >
      <Card className={`h-full border-t-4 ${isExpired ? 'border-t-red-500' : isExpiringSoon ? 'border-t-amber-500' : 'border-t-emerald-500'} shadow-sm hover:shadow-2xl transition-all duration-500`}>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <CardTitle className="text-xl font-black text-slate-800 dark:text-white pt-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
              <Link href={`/products/${warranty.id}`}>{warranty.name}</Link>
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter"><Store className="h-3.5 w-3.5" /> {warranty.store || 'Loja não informada'}</div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/products/edit/${warranty.id}`)} className="h-8 w-8 p-0" title="Editar">
              <Pencil className="h-4 w-4 text-slate-400 hover:text-emerald-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="h-8 w-8 p-0" title="Excluir">
              <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)} className="h-8 w-8 p-0" title="Mais ações">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border/30 overflow-hidden z-20 py-1"
                  >
                    {!isExpired && (
                      <>
                        <button onClick={() => { exportResalePDF(); setShowActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                          <FileBadge className="h-4 w-4 text-emerald-600" /> Dossiê de Revenda
                        </button>
                        <button onClick={() => { router.push(`/insurance/simulator/${warranty.id}`); setShowActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors">
                          <Umbrella className="h-4 w-4 text-cyan-600" /> Simular Seguro
                        </button>
                        <button onClick={() => { setShowSavingInput(true); setShowActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                          <HeartHandshake className="h-4 w-4 text-pink-500" /> Registrar Economia
                        </button>
                      </>
                    )}
                    <button onClick={() => { handleShare(); setShowActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <Share2 className="h-4 w-4 text-slate-400" /> Compartilhar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter"><span>Status do Prazo</span><span>{progress.toFixed(0)}% Consumido</span></div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-50 dark:border-slate-600"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Compra</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(warranty.purchase_date)}</p></div>
            <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Expiração</p><p className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>{formatDate(expirationDate)}</p></div>
          </div>

          {Number(warranty.total_saved || 0) > 0 && (
            <div className="px-4 py-2 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-pink-600 uppercase">Economia Gerada</span>
              <span className="text-sm font-black text-pink-700 font-mono">R$ {Number(warranty.total_saved).toLocaleString('pt-BR')}</span>
            </div>
          )}

          {/* Benefícios do Cartão de Crédito */}
          {cardBenefits && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {(warranty as Record<string, unknown>).card_brand as string}
                  {cardBenefits.extra_months > 0 && ` (+${cardBenefits.extra_months} meses)`}
                </span>
              </div>
              <ul className="space-y-1">
                {cardBenefits.perks.map((perk, i) => (
                  <li key={i} className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-indigo-500 shrink-0" /> {perk}
                  </li>
                ))}
              </ul>
              {priceProtectionActive && (
                <div className="pt-2 mt-2 border-t border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">
                    Proteção de preço ativa: {priceProtectionDaysLeft} dias
                  </span>
                </div>
              )}
            </div>
          )}

          <div className={`p-3 rounded-xl ${statusConfig.bg} border ${statusConfig.border} flex items-start gap-2`}>
            <Info className={`h-4 w-4 ${statusConfig.color} shrink-0 mt-0.5`} /><p className={`text-[11px] font-bold leading-tight ${statusConfig.color}`}>{statusConfig.tip}</p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Valor de Nota</span><span className="text-lg font-black text-slate-800 dark:text-white money-value">{warranty.price ? `R$ ${Number(warranty.price).toLocaleString('pt-BR')}` : '---'}</span></div>
            {warranty.invoice_url && (
              <a href={warranty.invoice_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm">Nota Fiscal <ExternalLink className="h-3.5 w-3.5" /></a>
            )}
          </div>
          {/* Modal de confirmação de exclusão */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-3">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Deseja realmente excluir esta garantia?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" onClick={handleDelete} className="text-xs">Confirmar Exclusão</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-xs">Cancelar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input de economia */}
          <AnimatePresence>
            {showSavingInput && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 space-y-3">
                <p className="text-sm font-bold text-pink-700 dark:text-pink-300">Quanto economizou com este conserto/troca?</p>
                <div className="flex gap-2">
                  <input type="number" step="0.01" min="0" placeholder="R$ 0,00" value={savingAmount} onChange={(e) => setSavingAmount(e.target.value)} className="flex-1 h-9 px-3 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 text-sm" />
                  <Button size="sm" onClick={handleLogSaving} className="text-xs bg-pink-600">Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowSavingInput(false); setSavingAmount(''); }} className="text-xs">X</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.warranty.id === nextProps.warranty.id &&
    prevProps.warranty.name === nextProps.warranty.name &&
    prevProps.warranty.purchase_date === nextProps.warranty.purchase_date &&
    prevProps.warranty.warranty_months === nextProps.warranty.warranty_months &&
    prevProps.warranty.total_saved === nextProps.warranty.total_saved &&
    prevProps.warranty.invoice_url === nextProps.warranty.invoice_url
  );
});

WarrantyCard.displayName = 'WarrantyCard';