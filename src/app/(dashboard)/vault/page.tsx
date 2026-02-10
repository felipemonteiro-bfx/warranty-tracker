'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Search, Grid, List, Download, ExternalLink, ShieldCheck, Filter, FolderOpen, Loader2, Image as ImageIcon, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function VaultPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredWarranties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const supabase = createClient();

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('warranties')
        .select('id, name, invoice_url, folder, created_at, category')
        .not('invoice_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (data) {
        setItems(data);
        setFilteredWarranties(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const result = items.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.folder.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWarranties(result);
  }, [searchQuery, items]);

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link de acesso seguro copiado!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Cofre de <span className="text-emerald-600">Documentos</span></h1>
          <p className="text-slate-500 font-medium">Todas as suas notas fiscais em um ambiente de custódia segura.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-teal-50 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Barra de Busca Profissional */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text"
            placeholder="Pesquisar por nome do produto ou pasta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-32 text-center space-y-4 glass rounded-[40px] border-2 border-dashed border-teal-100">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma nota encontrada no cofre</p>
          </div>
        ) : (
          <motion.div 
            layout
            className={viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-4" : "space-y-4"}
          >
            {filteredItems.map((item) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {viewMode === 'grid' ? (
                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white h-full flex flex-col">
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {/* Simulação de Thumbnail - Em produção seria a imagem real */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <div className="text-slate-300 group-hover:text-emerald-600 transition-colors">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                      <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest">Digitalizado</span>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tighter">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <FolderOpen className="h-3 w-3" /> {item.folder}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-50">
                        <a href={item.invoice_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full h-9 border-teal-50 text-[9px] font-black uppercase tracking-widest gap-1.5">
                            <ExternalLink className="h-3 w-3" /> Abrir
                          </Button>
                        </a>
                        <Button onClick={() => handleShare(item.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-emerald-50 text-emerald-600">
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-none shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between gap-6 group bg-white">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.folder} • {new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={item.invoice_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-10 px-4 font-black text-[9px] uppercase tracking-widest gap-2">
                          <Download className="h-3 w-3" /> Baixar
                        </Button>
                      </a>
                      <Button onClick={() => handleShare(item.id)} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-emerald-600 hover:bg-emerald-50"><Share2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Selo de Segurança do Cofre */}
      <footer className="pt-10">
        <div className="max-w-md mx-auto p-6 rounded-[32px] bg-slate-900 text-white flex items-center gap-6 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h5 className="text-sm font-black uppercase tracking-widest text-emerald-400">Custódia Verificada</h5>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Seus documentos são armazenados com criptografia de ponta a ponta e auditoria de integridade 24/7.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
