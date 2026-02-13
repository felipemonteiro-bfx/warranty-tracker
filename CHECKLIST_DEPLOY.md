# ✅ Checklist Completo de Deploy

## 🔐 Supabase - Checklist

### Database
- [ ] Tabela `warranties` criada (execute `docs/schema.sql`)
- [ ] Tabela `profiles` criada
- [ ] Tabelas de messaging criadas (`docs/messaging_schema.sql`)
- [ ] RLS (Row Level Security) ativado
- [ ] Policies configuradas para cada tabela

### Storage
- [ ] Bucket `invoices` criado (público)
- [ ] Bucket `chat-media` criado (privado)
- [ ] Policies de storage configuradas

### Realtime
- [ ] Realtime ativado para `messages`
- [ ] Realtime ativado para `chats`
- [ ] Realtime ativado para `chat_participants`

### Authentication
- [ ] Email/Password habilitado
- [ ] OAuth providers configurados (Google, etc.)
- [ ] Redirect URLs configuradas

## 🚀 Vercel - Checklist

### Variáveis de Ambiente
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` (opcional)
- [ ] `NEXT_PUBLIC_GEMINI_API_KEY` (opcional)
- [ ] `NODE_ENV=production`

### Build Settings
- [ ] Framework: Next.js
- [ ] Build Command: `yarn build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `yarn install`

### Domínio
- [ ] Domínio customizado configurado
- [ ] SSL ativado

## 🖥️ Local - Checklist

### Ambiente
- [ ] `.env.local` criado
- [ ] Todas as variáveis obrigatórias preenchidas
- [ ] `yarn install` executado
- [ ] `yarn type-check` passa sem erros

### Servidor
- [ ] `yarn dev` iniciado
- [ ] Acessível em http://localhost:3001
- [ ] Sem erros no console

## 📊 Testes

### Local
- [ ] `yarn test:basic` passa
- [ ] `yarn test:dashboard` passa
- [ ] `yarn test:all` executa sem erros críticos

### CI/CD
- [ ] GitHub Actions rodando
- [ ] Testes passando no CI
- [ ] Artifacts sendo gerados

## 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/felipemonteiro-bfx/warranty-tracker/actions
- **Local**: http://localhost:3001

## ✅ Status Atual

- ✅ GitHub: Configurado
- ⏳ Supabase: Verificar manualmente
- ⏳ Vercel: Configurar variáveis
- ✅ Local: Servidor rodando
