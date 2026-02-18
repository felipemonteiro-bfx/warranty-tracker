# Checklist: GitHub e Vercel

Use este checklist para garantir que todas as APIs e variáveis estão configuradas.

---

## Variáveis de ambiente na Vercel

Acesse: **Vercel Dashboard → seu projeto → Settings → Environment Variables**

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Cron | Necessária para `/api/cron/alerts` |
| `STRIPE_SECRET_KEY` | Stripe | Para checkout e billing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Chave pública Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook | Para eventos do Stripe |
| `GEMINI_API_KEY` | IA | Chat e análise de notas |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push | Push notifications |
| `VAPID_PRIVATE_KEY` | Push | Chave privada VAPID |
| `CRON_SECRET` | ✅ Cron | Protege `/api/cron/alerts` - gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Monitoramento de erros |

---

## Configuração do Cron na Vercel

O `vercel.json` já define:

```json
{"crons":[{"path":"/api/cron/alerts","schedule":"0 8 * * *"}]}
```

- **Schedule**: 8h diariamente (UTC)
- **Autenticação**: A Vercel envia `Authorization: Bearer <CRON_SECRET>` automaticamente
- **Requisito**: Defina `CRON_SECRET` nas variáveis de ambiente da Vercel (use o mesmo valor do `.env.local`)

### Adicionar CRON_SECRET na Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Nome: `CRON_SECRET`
3. Valor: o mesmo usado em `.env.local` (ex: o gerado com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. Ambiente: Production, Preview, Development
5. Salvar e fazer redeploy

---

## GitHub Actions / Secrets

Se usar CI no GitHub, configure:

| Secret | Uso |
|--------|-----|
| `VERCEL_TOKEN` | Deploy automático |
| `VERCEL_ORG_ID` | Deploy automático |
| `VERCEL_PROJECT_ID` | Deploy automático |

---

## Testar APIs localmente

Com o servidor rodando (`npm run dev`):

```bash
npm run test:apis
# ou com URL específica:
node scripts/test-apis.js http://localhost:3001
```

### Testar Cron manualmente (com CRON_SECRET)

```bash
# Gere um secret: openssl rand -hex 32
# Adicione em .env.local: CRON_SECRET=seu-secret

curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3001/api/cron/alerts
# Deve retornar: {"ok":true,"created":N}
```

---

## Resposta esperada por API

| API | Método | Esperado sem auth/config |
|-----|--------|--------------------------|
| `/api/cron/alerts` | GET | 200 (com CRON_SECRET) ou 401 |
| `/api/checkout` | POST | 401 ou 503 (Stripe não configurado) |
| `/api/billing-portal` | POST | 401 ou 503 |
| `/api/ai-chat` | POST | 401 ou 503 (Gemini não configurado) |
| `/api/sentry-test` | GET | 500 (erro intencional) |
| `/api/push/send` | POST | 400/401 (sem body válido) |

---

## Verificar deploy

1. **Vercel**: Dashboard → Deployments → último deploy em "Ready"
2. **Domínio**: Acesse a URL de produção
3. **Logs**: Vercel → Logs para erros em tempo real
