# 💳 Configuração do Stripe - Guia Completo

## 🔑 Chave Fornecida

Você forneceu esta chave pública do Stripe:
```
pk_test_51SzIQJ2QSTNweAqsZM8os7i01Dk0iNaKdwntrlNj5iHpua40u84k6khEhGpd57jt5ZTIJClfsQzfMsjz3zg1IA5j00nRnDOogY
```

## 📚 O Que É Essa Chave?

### Chave Pública (Publishable Key)
- **Prefixo**: `pk_test_` = Chave de TESTE (modo sandbox)
- **Tipo**: Pública (pode ser exposta no frontend)
- **Uso**: Inicializar o Stripe.js no navegador
- **Segurança**: ✅ Segura para expor no código frontend

### ⚠️ IMPORTANTE: Chave Secreta Necessária

Para processar pagamentos, você também precisa de:
- **Chave Secreta** (`sk_test_...`) - NUNCA exponha no frontend!
- **Webhook Secret** (`whsec_...`) - Para receber eventos do Stripe

## ✅ O Que Foi Configurado

1. ✅ Chave pública adicionada ao `.env.local`
2. ✅ Variável: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. ✅ Pronta para uso no frontend

## 🔧 Configuração Completa

### 1. Variáveis de Ambiente Locais (.env.local)

```env
# Stripe Publishable Key (Pública - Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SzIQJ2QSTNweAqsZM8os7i01Dk0iNaKdwntrlNj5iHpua40u84k6khEhGpd57jt5ZTIJClfsQzfMsjz3zg1IA5j00nRnDOogY

# Stripe Secret Key (Privada - Backend apenas)
STRIPE_SECRET_KEY=sk_test_sua-chave-secreta-aqui

# Stripe Webhook Secret (Para eventos)
STRIPE_WEBHOOK_SECRET=whsec_sua-chave-webhook-aqui
```

### 2. Obter Chaves Completas no Stripe

1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie:
   - **Publishable key** (já tem ✅)
   - **Secret key** (`sk_test_...`) - ⚠️ Necessária!
   - **Webhook secret** (`whsec_...`) - Para produção

### 3. Configurar no Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SzIQJ2QSTNweAqsZM8os7i01Dk0iNaKdwntrlNj5iHpua40u84k6khEhGpd57jt5ZTIJClfsQzfMsjz3zg1IA5j00nRnDOogY
   STRIPE_SECRET_KEY=sk_test_sua-chave-secreta
   STRIPE_WEBHOOK_SECRET=whsec_sua-chave-webhook
   ```

## 🚀 Como Funciona no Código

### Frontend (Cliente)
```typescript
// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

### Backend (Servidor)
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});
```

## ⚙️ Funcionalidades Disponíveis

Com o Stripe configurado, você pode:

1. ✅ **Checkout de Pagamento**
   - `/api/checkout` - Criar sessão de checkout
   - Redireciona para página de pagamento do Stripe

2. ✅ **Portal de Cobrança**
   - `/api/billing-portal` - Gerenciar assinaturas
   - Cancelar/atualizar planos

3. ✅ **Webhooks**
   - `/api/webhook` - Receber eventos do Stripe
   - Processar pagamentos confirmados

## 🔒 Segurança

### ✅ Pode Expor (Frontend)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Chave pública

### ❌ NUNCA Exponha (Backend apenas)
- `STRIPE_SECRET_KEY` - Chave secreta
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook

## 🧪 Modo Teste vs Produção

### Teste (Atual)
- **Publishable**: `pk_test_...`
- **Secret**: `sk_test_...`
- **Uso**: Desenvolvimento e testes

### Produção
- **Publishable**: `pk_live_...`
- **Secret**: `sk_live_...`
- **Uso**: Pagamentos reais

⚠️ **IMPORTANTE**: Troque para chaves `live_` apenas quando estiver pronto para produção!

## 📋 Checklist

- [x] Chave pública configurada no `.env.local`
- [ ] Obter chave secreta do Stripe
- [ ] Adicionar chave secreta ao `.env.local`
- [ ] Configurar webhook no Stripe Dashboard
- [ ] Adicionar webhook secret ao `.env.local`
- [ ] Configurar variáveis no Vercel (produção)
- [ ] Testar checkout de pagamento

## 🔗 Links Úteis

- **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing

---

**Status**: ✅ Chave pública configurada!  
**Próximo passo**: Obter chave secreta (`sk_test_...`) do Stripe Dashboard.
