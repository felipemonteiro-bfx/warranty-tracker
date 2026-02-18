'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScanLine, Loader2, Camera, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function NFeScannerPage() {
  const [scanning, setScanning] = useState(false);

  const handleScanQR = () => {
    toast.info('Abertura da câmera para escanear QR Code — em breve!');
  };

  const handleUpload = () => {
    toast.info('Upload de imagem para OCR — em breve!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Scanner <span className="text-emerald-600">NF-e</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Escaneie o QR Code da NF-e ou faça upload da imagem. Preenchimento automático via SEFAZ ou OCR.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="border-none shadow-xl cursor-pointer hover:shadow-2xl transition-shadow h-full"
            onClick={handleScanQR}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl mb-4">
                <Camera className="h-16 w-16 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">QR Code</h2>
              <p className="text-slate-500 text-sm">Aponte a câmera para o QR Code da NF-e. Consulta automática à SEFAZ.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="border-none shadow-xl cursor-pointer hover:shadow-2xl transition-shadow h-full"
            onClick={handleUpload}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl mb-4">
                <FileSearch className="h-16 w-16 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload de imagem</h2>
              <p className="text-slate-500 text-sm">Envie foto ou PDF da NF-e. OCR extrai CNPJ, itens e valores.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="border-none shadow-lg bg-slate-900 text-white p-8">
        <div className="flex items-center gap-4">
          <ScanLine className="h-12 w-12 text-emerald-400" />
          <div>
            <h3 className="font-bold">Sem digitação</h3>
            <p className="text-slate-400 text-sm">Menos erros, mais velocidade. Dados vêm direto da NF-e.</p>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-slate-500">
        Integração com SEFAZ e OCR em desenvolvimento. Interface mock ativa.
      </p>
    </div>
  );
}
