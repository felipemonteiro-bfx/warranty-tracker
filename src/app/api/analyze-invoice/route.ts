import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Serviço de análise não configurado' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo e tamanho
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPG, PNG, WebP ou PDF.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um especialista em documentos fiscais brasileiros.
Analise esta imagem de nota fiscal ou cupom fiscal e extraia exatamente os seguintes campos em formato JSON puro (sem markdown):
{
  "product_name": "Nome principal do produto comprado",
  "purchase_date": "Data da compra em formato YYYY-MM-DD",
  "price": valor numérico total (ex: 1500.50),
  "store": "Nome da loja ou Razão Social",
  "card_brand": "Identifique se foi Visa, Mastercard, Elo e o nível (Gold, Platinum, Black) se estiver escrito",
  "nfe_key": "Chave de acesso de 44 dígitos (remova espaços)",
  "serial_number": "Número de série se estiver visível"
}
Se não encontrar algum campo, deixe vazio. Retorne apenas o JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const extractedData = JSON.parse(responseText);

    return NextResponse.json({ data: extractedData });
  } catch (error) {
    console.error('Erro na análise de nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar nota fiscal. Verifique se a imagem está nítida.' },
      { status: 500 }
    );
  }
}
