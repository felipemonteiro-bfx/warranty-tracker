# Guardiao de Notas - Gestao Inteligente de Garantias e Patrimonio

Plataforma web completa para gestao de garantias, notas fiscais e patrimonio com IA integrada.

## Como comecar

### 1. Pre-requisitos
- Node.js 20+
- Yarn (`npm install -g yarn`)
- Conta no [Supabase](https://supabase.com)

### 2. Configuracao do Supabase
1. Crie um projeto no [Supabase](https://supabase.com).
2. **SQL Editor** → execute nesta ordem:
   - `supabase/migrations/20260215220000_create_warranties.sql`
   - `supabase/migrations/20260217000000_integration_complete.sql`
3. **Auth** → Providers: ative Email e Google. Redirect URLs: `http://localhost:3001/auth/callback`
4. **Database** → Replication: ative Realtime para a tabela `warranties`

Guia completo: `docs/SUPABASE_SETUP.md`

### Monitoramento de erros (Sentry - gratuito)
Guia passo a passo: `docs/SENTRY_SETUP.md`

### 3. Variaveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
GEMINI_API_KEY=sua-chave-gemini (opcional, para analise IA de notas)
STRIPE_SECRET_KEY=sk_test_... (opcional, para pagamentos)
```

### 4. Instalar e rodar
```bash
yarn install
yarn dev
```
O app estara disponivel em `http://localhost:3001`.

## Funcionalidades principais

- **Gestao de garantias**: Cadastro, filtros, busca, alertas de vencimento
- **Upload de notas fiscais**: Com analise automatica por IA (Gemini)
- **Cartao de credito**: Registre o cartao usado e veja beneficios de garantia estendida
- **Dashboard**: Estatisticas de garantias ativas, vencendo e expiradas
- **Modo privacidade**: Oculta valores monetarios
- **PWA**: Instalavel no celular
- **Dark mode**: Tema claro e escuro

## Tecnologias
- Next.js 16 (App Router, React 19)
- Supabase (Auth, Database, Storage)
- Tailwind CSS v4
- Google Gemini AI (analise de notas fiscais)
- Stripe (pagamentos)
- Playwright (testes E2E)

## Testes E2E
Guia completo: `docs/TESTES.md`
```bash
npm run dev       # Terminal 1: servidor
npm test          # Terminal 2: testes Playwright
npm run test:journey  # Apenas jornada do usuario
```

## Scripts uteis
```bash
yarn dev          # Servidor de desenvolvimento
yarn build        # Build de producao
yarn test         # Rodar testes E2E
yarn lint         # Verificar linting
yarn type-check   # Verificar tipos TypeScript
```
