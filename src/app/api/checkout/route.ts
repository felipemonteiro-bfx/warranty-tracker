import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { checkoutRequestSchema } from '@/lib/validation';
import { createError, ErrorType, logError, getUserFriendlyMessage } from '@/lib/error-handler';

export async function POST(req: Request) {
  try {
    // Verificar se Stripe está configurado
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Stripe não está configurado. Configure STRIPE_SECRET_KEY e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.' },
        { status: 503 }
      );
    }

    // Verificar autenticação
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const error = createError(ErrorType.AUTHENTICATION, 'Usuário não autenticado', {
        statusCode: 401,
        originalError: authError,
      });
      logError(error);
      return NextResponse.json(
        { error: getUserFriendlyMessage(error) },
        { status: 401 }
      );
    }

    // Validar body da requisição
    const body = await req.json();
    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      const error = createError(ErrorType.VALIDATION, 'Dados inválidos', {
        statusCode: 400,
        originalError: validation.error,
      });
      logError(error);
      return NextResponse.json(
        { error: getUserFriendlyMessage(error) },
        { status: 400 }
      );
    }

    const { priceId, planName } = validation.data;

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'http://localhost:3001'}/plans?success=true`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3001'}/plans?canceled=true`,
      metadata: {
        userId: user.id,
        planName: planName,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planName: planName,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const appError = createError(ErrorType.SERVER, 'Erro ao criar sessão de checkout', {
      statusCode: 500,
      originalError: error,
    });
    logError(appError);
    return NextResponse.json(
      { error: getUserFriendlyMessage(appError) },
      { status: 500 }
    );
  }
}
