# 🛡️ Setup Completo - Guardião de Notas

## 📋 Índice
1. [Schemas do Banco de Dados](#schemas-do-banco-de-dados)
2. [Dados Mock](#dados-mock)
3. [Configuração de Ambiente](#configuração-de-ambiente)
4. [Estrutura de Receita](#estrutura-de-receita)

---

## 🗄️ Schemas do Banco de Dados

Execute os schemas **na ordem abaixo** no SQL Editor do Supabase:

### 1. Schema Base (se ainda não rodou)
```sql
-- Execute: docs/setup_completo_safe_v2.sql
-- Cria: warranties, profiles, chats, messages (base)
```

### 2. Tabelas Extras
```sql
-- Execute: docs/schema_extra_tables.sql
-- Adiciona colunas extras em warranties e profiles
-- Cria: notifications, maintenance_logs, lending_logs, folder_shares, marketplace_listings, claims
```

### 3. Referral Tracking
```sql
-- Execute: docs/schema_referral_tracking.sql
-- Adiciona referral_code em profiles
-- Cria: referral_tracking
-- Trigger automático para tracking de signups
```

### 4. Pilares de Receita
```sql
-- Execute: docs/schema_receita.sql
-- Cria: insurance_partners, insurance_quotes, insurance_conversions
-- Cria: marketplace_transactions
-- Cria: advertisers, ad_campaigns, ad_impressions
```

---

## 🎲 Dados Mock

### Opção 1: Via API (Recomendado)
1. Faça login na aplicação
2. Vá para `/dashboard`
3. Clique no botão **"Dados de teste"**
4. Aguarde a confirmação

**O que é criado:**
- ✅ 5 garantias completas
- ✅ 3 notificações
- ✅ 4 logs de manutenção
- ✅ 2 empréstimos
- ✅ 2 compartilhamentos de pasta
- ✅ 2 anúncios no marketplace
- ✅ 1 sinistro (claim)
- ✅ 3 parceiros de seguro
- ✅ 2 cotações de seguro
- ✅ 2 anunciantes e campanhas
- ✅ 2 impressões de anúncios
- ✅ 1 transação de marketplace
- ✅ 2 referrals de exemplo
- ✅ Referral code gerado

### Opção 2: Via SQL
1. No Supabase: **Authentication > Users** → copie o UUID do seu usuário
2. Abra `docs/seed_mock_data.sql`
3. Substitua todas as ocorrências de `SEU_USER_ID_AQUI` pelo UUID
4. Execute no SQL Editor

---

## ⚙️ Configuração de Ambiente

### Variáveis Obrigatórias
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### Variáveis Opcionais (para funcionalidades específicas)
```env
# Stripe (pagamentos)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini AI (consultor IA, OCR)
NEXT_PUBLIC_GEMINI_API_KEY=...

# Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## 💰 Estrutura de Receita

### **Pilar 1: Seguro e Proteção**
- **Como funciona:** Usuário cota seguro → redireciona para parceiro → você ganha comissão
- **Tabelas:** `insurance_partners`, `insurance_quotes`, `insurance_conversions`
- **Comissão:** Configurável por parceiro (ex.: 10-20% do prêmio)

### **Pilar 2: Marketplace**
- **Como funciona:** Usuários vendem bens → plataforma cobra taxa de 5%
- **Tabelas:** `marketplace_listings`, `marketplace_transactions`
- **Taxa:** 5% padrão (configurável por anúncio)

### **Pilar 3: Anúncios Segmentados**
- **Como funciona:** Empresas anunciam produtos relacionados → você cobra por impressão/clique
- **Tabelas:** `advertisers`, `ad_campaigns`, `ad_impressions`
- **Modelo:** CPM (R$ 5-15 por mil) ou CPC (R$ 0,50-2,00 por clique)

### **Referral**
- **Como funciona:** Usuário indica amigos → ganha meses grátis quando convertem
- **Tabelas:** `referral_tracking`
- **Recompensa:** 1 mês grátis por indicação convertida

---

## 📚 Documentação Adicional

- **Estratégia de Monetização:** `docs/ESTRATEGIA_MONETIZACAO.md`
- **Roadmap de Receita:** `docs/ROADMAP_RECEITA.md`
- **Implementação dos Pilares:** `docs/IMPLEMENTACAO_PILARES.md`

---

## ✅ Checklist de Setup

- [ ] Schemas executados no Supabase (4 arquivos SQL)
- [ ] Variáveis de ambiente configuradas
- [ ] Dados mock criados (via API ou SQL)
- [ ] Testar: Dashboard mostra garantias
- [ ] Testar: Marketplace mostra anúncios
- [ ] Testar: Simulador de seguro mostra parceiros
- [ ] Testar: Dashboard mostra anúncios segmentados
- [ ] Testar: Referral mostra código e tracking

---

**Última atualização:** 2026-02-12
