'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Send, Loader2, Bot, User, ShieldCheck, Scale, History, RotateCcw } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([
    { role: 'model', parts: [{ text: 'Olá! Eu sou o Guardião IA. Sou especialista no Código de Defesa do Consumidor. Como posso te orientar hoje?' }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMessages: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
      ...messages,
      { role: 'user', parts: [{ text: userText }] }
    ];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Chave da API não configurada');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Iniciar chat com histórico para ter memória
      const chat = model.startChat({
        history: messages.slice(0, -1), // Envia o histórico acumulado
        generationConfig: { maxOutputTokens: 1000 }
      });

      const result = await chat.sendMessage(userText);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: botText }] }]);
    } catch (err) {
      toast.error('Erro na consultoria IA.');
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Tive um pequeno lapso de memória. Pode repetir?' }] }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', parts: [{ text: 'Conversa reiniciada. Em que posso ajudar?' }] }]);
    toast.success('Histórico limpo!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Consultor <span className="text-emerald-600">IA</span></h1>
          <p className="text-slate-500 font-medium">Especialista jurídico em Direito do Consumidor (CDC).</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="gap-2 border-teal-100 text-slate-500 font-bold">
          <RotateCcw className="h-4 w-4" /> Limpar Conversa
        </Button>
      </header>

      <Card className="h-[650px] flex flex-col shadow-2xl border-none overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardHeader className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white leading-none">Guardião Inteligente</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1">Conhecimento CDC 2026</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> IA Ativa
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-[28px] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-teal-50 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    {msg.role === 'model' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                      {msg.role === 'model' ? 'Consultor Guardião' : 'Você'}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl border border-teal-50 shadow-sm flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisando legislação...</span>
              </div>
            </motion.div>
          )}
        </CardContent>

        <div className="p-6 bg-white border-t border-teal-50">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Pergunte sobre trocas, arrependimento ou garantias..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-14 px-6 bg-slate-50 border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
            />
            <Button type="submit" disabled={loading} className="h-14 w-14 rounded-2xl p-0 shadow-emerald-200">
              <Send className="h-6 w-6" />
            </Button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-slate-400 font-bold uppercase">
            <ShieldCheck className="h-3 w-3" /> Suas conversas são privadas e protegidas
          </div>
        </div>
      </Card>
    </div>
  );
}