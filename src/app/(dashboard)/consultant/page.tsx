'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Send, Loader2, Bot, User, ShieldCheck, Scale } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Eu sou o Guardião IA. Como posso te ajudar com seus direitos de consumidor hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Chave da API não configurada');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Você é o "Guardião IA", um especialista jurídico amigável focado no Código de Defesa do Consumidor (CDC) do Brasil. 
      Sua missão é ajudar o usuário a entender seus direitos sobre garantias, trocas, devoluções e vícios de produtos.
      Responda de forma clara, objetiva e baseada na lei brasileira. 
      Se a pergunta não for sobre consumo ou direitos, peça gentilmente para focar no tema.
      
      Pergunta do Usuário: ${userMessage}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      toast.error('Erro ao consultar IA.');
      setMessages(prev => [...prev, { role: 'bot', text: 'Desculpe, tive um problema técnico. Pode tentar novamente?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Consultor <span className="text-emerald-600">IA</span>
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600" /> Tire dúvidas sobre seus direitos como consumidor.
          </p>
        </div>
      </header>

      <Card className="h-[600px] flex flex-col shadow-2xl border-none overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">Guardião Inteligente</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Especialista em CDC</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-teal-50 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'bot' ? <Bot className="h-3 w-3 opacity-50" /> : <User className="h-3 w-3 opacity-50" />}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      {msg.role === 'bot' ? 'Guardião IA' : 'Você'}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-teal-50 shadow-sm flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processando consultoria...</span>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-6 bg-white border-t border-teal-50">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Ex: Qual o prazo para trocar um eletrônico com defeito?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-14 px-6 bg-slate-50 border-2 border-teal-50 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
            />
            <Button type="submit" disabled={loading} className="h-14 w-14 rounded-2xl p-0">
              <Send className="h-6 w-6" />
            </Button>
          </form>
          <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-tighter">
            O Guardião fornece orientações baseadas no CDC. Para casos complexos, consulte um advogado.
          </p>
        </div>
      </Card>
    </div>
  );
}
