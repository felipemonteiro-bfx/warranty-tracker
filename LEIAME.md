# Guardião de Notas - Gestão Inteligente de Garantias e Patrimônio

Plataforma web para gestão de garantias, notas fiscais e patrimônio com IA integrada.

---

## Apresentação / Demo

Para demonstrar a plataforma com dados prontos:

1. Faça login (ou crie conta)
2. No dashboard, clique em **"Dados de teste"** para popular garantias, notificações e mais
3. Em produção: defina `NEXT_PUBLIC_DEMO_MODE=true` na Vercel para exibir o botão

Roteiro completo: `docs/APRESENTACAO.md`

---

## Como começar

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

## Documentação

| Documento | Descrição |
|-----------|-----------|
| `docs/APRESENTACAO.md` | Roteiro de demo e apresentação |
| `docs/SUPABASE_SETUP.md` | Configuração do Supabase |
| `docs/CHECKLIST_GITHUB_VERCEL.md` | Variáveis de ambiente, Cron, login Google |
| `docs/SENTRY_SETUP.md` | Monitoramento de erros |
| `docs/TESTES.md` | Testes E2E com Playwright |

## Verificar se tudo funciona

```bash
npm run build        # Build de produção (deve passar)
npm run dev          # Terminal 1: servidor
npm run test:apis    # Terminal 2: testa APIs e variáveis
npm run test:journey # Testes E2E da jornada do usuário (10 cenários)
```

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Servidor de desenvolvimento (porta 3001) |
| `yarn build` | Build de produção |
| `yarn test` | Testes E2E (Playwright) |
| `yarn test:journey` | Apenas jornada do usuário |
| `yarn test:apis` | Testa APIs e variáveis de ambiente |
| `yarn verify` | type-check + build (verificação rápida) |
| `yarn type-check` | Verificar tipos TypeScript |
| `yarn lint` | Verificar linting |
