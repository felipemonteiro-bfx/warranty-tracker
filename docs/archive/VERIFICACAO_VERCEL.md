# ✅ Verificação Vercel - Checklist Completo

## 🚀 Configuração do Vercel

### 1. Conectar Repositório

1. Acesse: https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Conecte com GitHub
4. Selecione: `felipemonteiro-bfx/warranty-tracker`
5. Escolha branch: `staging` ou `main`

### 2. Variáveis de Ambiente

#### No Dashboard do Vercel:

1. Vá em **Settings > Environment Variables**
2. Adicione as seguintes variáveis:

**Obrigatórias:**
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
STRIPE_SECRET_KEY=sk_live_sua-chave-secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_sua-chave-publica
NODE_ENV=production
```

**Opcionais:**
```
NEXT_PUBLIC_GEMINI_API_KEY=sua-chave-gemini
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret
```

#### Importante:
- ✅ Marque todas como **Production**
- ✅ Marque também como **Preview** se quiser testar em PRs
- ✅ Use chaves de **produção** do Stripe (`sk_live_`, `pk_live_`)

### 3. Build Settings

#### Configuração Automática:

O Vercel detecta Next.js automaticamente, mas verifique:

- **Framework Preset**: Next.js
- **Build Command**: `yarn build` (ou deixe vazio para auto-detect)
- **Output Directory**: `.next` (ou deixe vazio para auto-detect)
- **Install Command**: `yarn install` (ou deixe vazio para auto-detect)
- **Root Directory**: `/` (raiz do projeto)

### 4. Domínio

#### Domínio Customizado (Opcional):

1. Vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. SSL será ativado automaticamente

### 5. Deploy

#### Primeiro Deploy:

1. Após configurar variáveis, clique em **Deploy**
2. Aguarde o build completar
3. Verifique logs para erros

#### Deploys Automáticos:

- ✅ Push para `main` → Deploy em produção
- ✅ Push para `staging` → Deploy em preview
- ✅ Pull Requests → Deploy em preview

### 6. Webhook do Stripe

#### Configurar Webhook:

1. No Stripe Dashboard: **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-projeto.vercel.app/api/webhook`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (`whsec_...`)
6. Adicione como `STRIPE_WEBHOOK_SECRET` no Vercel

## 🧪 Testar Deploy

### Verificar Build:

1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Verifique logs do build
4. Deve mostrar: `✓ Compiled successfully`

### Verificar Aplicação:

1. Clique no link do deploy
2. Teste funcionalidades básicas:
   - ✅ Página inicial carrega
   - ✅ Login funciona
   - ✅ Dashboard carrega
   - ✅ Criação de garantia funciona

## 📊 Monitoramento

### Vercel Analytics (Opcional):

1. Vá em **Analytics**
2. Ative se quiser métricas de performance

### Logs:

1. Vá em **Deployments > [seu-deploy] > Logs**
2. Veja logs em tempo real
3. Útil para debug

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação**: https://vercel.com/docs
- **Status**: https://vercel-status.com

## ✅ Checklist Rápido

- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build settings verificados
- [ ] Primeiro deploy realizado
- [ ] Webhook do Stripe configurado
- [ ] Domínio configurado (opcional)
- [ ] Testes funcionando no deploy

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique logs do build
- Verifique se todas as variáveis estão configuradas
- Verifique se `yarn build` funciona localmente

### Erro: "Environment variables missing"
- Verifique se todas as variáveis obrigatórias estão no Vercel
- Verifique se estão marcadas para o ambiente correto (Production/Preview)

### Erro: "Supabase connection failed"
- Verifique se a URL do Supabase está correta
- Verifique se o projeto Supabase está ativo
- Verifique CORS no Supabase (deve permitir seu domínio Vercel)
