'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QrCode, Loader2, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export default function QRTransferPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedId && typeof window !== 'undefined') {
      const url = `${window.location.origin}/share/${selectedId}`;
      QRCode.toDataURL(url, { width: 256, margin: 2 }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
  }, [selectedId]);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('warranties').select('*').eq('user_id', user.id);
      if (data) setItems(data);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!qrDataUrl || !selectedId) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `garantia-${selectedId}.png`;
    a.click();
    toast.success('QR Code baixado!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          QR <span className="text-emerald-600">Transfer</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Gere um QR Code para compartilhar ou transferir a propriedade da garantia. Útil para revenda.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Selecione o produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhum produto cadastrado.</p>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-colors ${
                    selectedId === item.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.category || '---'}</p>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-8">
          <CardTitle className="mb-6">QR Code da garantia</CardTitle>
          {selected ? (
            <div className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-slate-300" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-slate-500 text-center">{selected.name}</p>
              <Button className="mt-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Baixar QR Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <QrCode className="h-24 w-24 mb-4 opacity-30" />
              <p>Selecione um produto à esquerda</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-900/50 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Transferência de propriedade:</strong> Em breve, o comprador poderá escanear o QR Code e assumir a garantia no próprio app.
        </p>
      </Card>
    </div>
  );
}
