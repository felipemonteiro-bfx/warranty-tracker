'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Upload, Save, X, Sparkles, Loader2, Store, DollarSign, NotebookPen, FolderOpen } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface WarrantyFormProps {
  initialData?: any;
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
    store: initialData?.store || '',
    notes: initialData?.notes || '',
    folder: initialData?.folder || 'Pessoal',
    care_tips: initialData?.care_tips || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const folders = ['Pessoal', 'Trabalho', 'Casa', 'Veículo', 'Eletrônicos', 'Outros'];

  const handleAIAnalysis = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro!');
      return;
    }
    
    setAnalyzing(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Chave da API do Gemini não configurada');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const base64Data = await readFileAsBase64(file);
      
      const prompt = `Analise esta nota fiscal e extraia em JSON:
      {
        "product_name": "nome",
        "purchase_date": "YYYY-MM-DD",
        "category": "categoria",
        "warranty_months": 12,
        "price": 0.00,
        "store": "loja",
        "care_tips": "Uma dica curta de como cuidar deste produto para durar mais ou um direito do consumidor sobre ele"
      }`;

      const result = await model.generateContent([{ inlineData: { data: base64Data, mimeType: file.type } }, prompt]);
      const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

      setFormData(prev => ({
        ...prev,
        ...data,
        name: data.product_name || prev.name,
      }));

      toast.success('IA: Dados e Dicas de Cuidado gerados!');
    } catch (err: any) {
      toast.error("Erro ao processar com IA.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let invoice_url = initialData?.invoice_url || null;

      if (file) {
        const filePath = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
        await supabase.storage.from('invoices').upload(filePath, file);
        invoice_url = supabase.storage.from('invoices').getPublicUrl(filePath).data.publicUrl;
      }

      const payload = { ...formData, invoice_url };
      const { error } = initialData?.id 
        ? await supabase.from('warranties').update(payload).eq('id', initialData.id)
        : await supabase.from('warranties').insert({ ...payload, user_id: user.id });

      if (error) throw error;
      toast.success('Garantia salva com dicas da IA!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl border-none">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-lg font-black text-emerald-800 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-600" /> Documentação do Produto
            </h2>
            <div className="group relative border-2 border-dashed border-teal-100 rounded-3xl p-8 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 flex flex-col items-center gap-4 text-center">
              <input type="file" id="file-upload" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-slate-700">{file ? file.name : 'Clique para subir a Nota Fiscal'}</p>
                <p className="text-xs text-slate-400 font-medium text-center">IA identificará o produto e sugerirá cuidados</p>
              </div>
              <AnimatePresence>
                {file && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 relative z-10">
                    <Button type="button" size="sm" onClick={handleAIAnalysis} disabled={analyzing} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Processar com IA
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => setFile(null)} className="h-10 w-10 p-0 rounded-xl"><X className="h-5 w-5" /></Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-lg font-black text-emerald-800 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-600" /> Organização e Dados
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <FolderOpen className="h-4 w-4 text-emerald-600" /> Pasta de Organização
                </label>
                <div className="flex flex-wrap gap-2">
                  {folders.map(folder => (
                    <button key={folder} type="button" onClick={() => setFormData({...formData, folder})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.folder === folder ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{folder}</button>
                  ))}
                </div>
              </div>

              <Input label="O que você comprou?" placeholder="Ex: Macbook Pro M3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Qual a categoria?" placeholder="Ex: Eletrônicos" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1"><Store className="h-4 w-4 text-emerald-600" /> Loja / Estabelecimento</label>
                <Input placeholder="Amazon, Apple Store..." value={formData.store} onChange={(e) => setFormData({ ...formData, store: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1"><DollarSign className="h-4 w-4 text-emerald-600" /> Valor Pago (R$)</label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              <Input label="Data da Compra" type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required />
              <Input label="Meses de Garantia (Sugerido)" type="number" min="1" value={formData.warranty_months} onChange={(e) => setFormData({ ...formData, warranty_months: parseInt(e.target.value) })} required />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1"><Sparkles className="h-4 w-4 text-emerald-600" /> Sugestões de Longevidade (IA)</label>
                <textarea className="w-full min-h-[100px] rounded-xl border-2 border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700" placeholder="A IA sugerirá cuidados aqui..." value={formData.care_tips} onChange={(e) => setFormData({...formData, care_tips: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1"><NotebookPen className="h-4 w-4 text-emerald-600" /> Observações Adicionais</label>
                <textarea className="w-full min-h-[100px] rounded-xl border-2 border-teal-50 bg-white px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700" placeholder="Número de série, acessórios, etc." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-teal-50">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-400 font-bold">Cancelar</Button>
            <Button type="submit" disabled={loading} className="px-10 h-14 text-base">{loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}{initialData ? 'Atualizar Dados' : 'Salvar no Guardião'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};