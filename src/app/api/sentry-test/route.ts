import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    throw new Error('Erro de teste do Sentry (servidor) - [API sentry-test]');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Erro intencional para teste do Sentry' },
      { status: 500 }
    );
  }
}
