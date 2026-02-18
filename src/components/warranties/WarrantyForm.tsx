'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Upload, Save, X, Sparkles, Loader2, CreditCard, Camera } from 'lucide-react';
import { normalizeError, getUserFriendlyMessage, logError } from '@/lib/error-handler';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Warranty } from '@/types/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

interface WarrantyFormProps {
  initialData?: Partial<Warranty> & { id?: string; invoice_url?: string };
}

export const WarrantyForm = ({ initialData }: WarrantyFormProps) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    purchase_date: initialData?.purchase_date || new Date().toISOString().split('T')[0],
    warranty_months: initialData?.warranty_months || 12,
    price: initialData?.price || '',
    estimated_sale_value: initialData?.estimated_sale_value || '',
    store: initialData?.store || '',
    notes: initialData?.notes || '',
    folder: initialData?.folder || 'Pessoal',
    maintenance_frequency_months: initialData?.maintenance_frequency_months || 6,
    last_maintenance_date: initialData?.last_maintenance_date || '',
    serial_number: initialData?.serial_number || '',
    card_brand: (initialData as Record<string, unknown>)?.card_brand as string || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Gerenciar preview URL sem memory leak
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const validateFile = (selectedFile: File): boolean => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou PDF.');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && !validateFile(selectedFile)) return;
    setFile(selectedFile);
  };

  const handleAIAnalysis = async () => {
    if (!file) {
      toast.error('Selecione uma imagem da nota fiscal!');
      return;
    }
    setAnalyzing(true);
    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/analyze-invoice', { method: 'POST', body });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Erro ao analisar nota fiscal.');
      }

      const extractedData = json.data;
      setFormData(prev => ({
        ...prev,
        name: extractedData.product_name || prev.name,
        purchase_date: extractedData.purchase_date || prev.purchase_date,
        price: extractedData.price || prev.price,
        store: extractedData.store || prev.store,
        serial_number: extractedData.serial_number || prev.serial_number,
      }));

      toast.success('Nota analisada com sucesso pela IA!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao ler a nota. Verifique se a imagem está nítida.';
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length === 0) {
      toast.error('Por favor, informe o nome do ativo.');
      return;
    }
    if (!formData.purchase_date) {
      toast.error('Por favor, informe a data de compra.');
      return;
    }
    if (!formData.warranty_months || formData.warranty_months < 1) {
      toast.error('Por favor, informe a duração da garantia em meses.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar autenticado para salvar.');
        router.push('/login');
        return;
      }
      let invoice_url = initialData?.invoice_url || null;
      if (file) {
        const filePath = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file);
        if (uploadError) {
          logError(normalizeError(uploadError));
          throw new Error('Erro ao fazer upload do arquivo. Tente novamente.');
        }
        invoice_url = supabase.storage.from('invoices').getPublicUrl(filePath).data.publicUrl;
      }
      const { error } = initialData?.id
        ? await supabase.from('warranties').update({ ...formData, invoice_url }).eq('id', initialData.id)
        : await supabase.from('warranties').insert({ ...formData, user_id: user.id, invoice_url });
      if (error) {
        logError(normalizeError(error));
        const friendlyMessage = getUserFriendlyMessage(normalizeError(error));
        throw new Error(friendlyMessage);
      }
      toast.success('Nota salva com sucesso!');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.';
      toast.error(errorMessage);
      logError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl border-none bg-white dark:bg-slate-900">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-lg font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-600" /> Upload de Documento</h2>

            {isMobile && !file && (
              <div className="grid grid-cols-2 gap-4">
                <label htmlFor="camera-upload" className="group relative border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 flex flex-col items-center gap-3 text-center cursor-pointer">
                  <input
                    type="file"
                    id="camera-upload"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  <div className="h-16 w-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <Camera className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Tirar Foto</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usar câmera</p>
                  </div>
                </label>

                <label htmlFor="gallery-upload" className="group relative border-2 border-dashed border-teal-100 dark:border-white/5 rounded-2xl p-6 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 flex flex-col items-center gap-3 text-center cursor-pointer">
                  <input
                    type="file"
                    id="gallery-upload"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  <div className="h-16 w-16 rounded-xl bg-teal-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Galeria</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escolher arquivo</p>
                  </div>
                </label>
              </div>
            )}

            <div className={`group relative border-2 border-dashed border-teal-100 dark:border-white/5 rounded-3xl p-10 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 flex flex-col items-center gap-4 text-center ${isMobile && !file ? 'hidden' : ''}`}>
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                accept="image/*,.pdf"
                capture={isMobile ? "environment" : undefined}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="h-20 w-20 rounded-2xl bg-teal-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                {isMobile ? <Camera className="h-10 w-10" /> : <Upload className="h-10 w-10" />}
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-700 dark:text-slate-200">
                  {file ? file.name : (isMobile ? 'Tire uma foto ou escolha da galeria' : 'Clique ou arraste a nota fiscal')}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suporta JPG, PNG e PDF (máx 10MB)</p>
              </div>
              <AnimatePresence>
                {file && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 relative z-30">
                    <Button type="button" size="sm" onClick={handleAIAnalysis} disabled={analyzing} className="bg-emerald-600 shadow-xl shadow-emerald-500/20">
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {analyzing ? 'IA Analisando...' : 'Processar com IA'}
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="h-10 w-10 p-0 rounded-xl"><X className="h-5 w-5" /></Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800"
              >
                <img
                  src={previewUrl}
                  alt="Preview da nota fiscal"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </motion.div>
            )}
          </div>

          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2"><div className="h-4 w-1 bg-emerald-600 rounded-full" /> Dados Automatizados</h3>
                <div className="grid md:grid-cols-2 gap-6">
                <Input label="Nome do Ativo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Loja" value={formData.store} onChange={(e) => setFormData({ ...formData, store: e.target.value })} />
                  <Input label="Valor de Compra (R$)" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Data da Compra" type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required />
                  <Input label="Garantia (Meses)" type="number" value={formData.warranty_months} onChange={(e) => setFormData({ ...formData, warranty_months: parseInt(e.target.value) })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1"><CreditCard className="h-4 w-4 text-emerald-600" /> Cartão Utilizado</label>
                    <Input placeholder="Ex: Visa Platinum, Mastercard Black" value={formData.card_brand} onChange={(e) => setFormData({ ...formData, card_brand: e.target.value })} />
                  </div>
                  <Input label="Valor de Revenda Estimado (R$)" type="number" step="0.01" value={formData.estimated_sale_value} onChange={(e) => setFormData({ ...formData, estimated_sale_value: e.target.value })} placeholder="Quanto conseguiria vender hoje?" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2"><div className="h-4 w-1 bg-emerald-600 rounded-full" /> Identificação Técnica</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Número de Série (S/N)" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-teal-50 dark:border-white/5">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-400 font-bold">Cancelar</Button>
            <Button type="submit" disabled={loading} className="px-10 h-14 text-base shadow-xl shadow-emerald-500/20">
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Finalizar Registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
