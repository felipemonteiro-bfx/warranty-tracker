import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Serviço de IA não configurado' }, { status: 503 });
    }

    const { prompt, context } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erro na API de IA:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação de IA' }, { status: 500 });
  }
}
