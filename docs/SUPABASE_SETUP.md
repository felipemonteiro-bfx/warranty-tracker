# Configuração Supabase - Guardião de Notas

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (se não tiver)
2. Clique em **New Project**
3. Preencha nome, senha do banco e região (South America recomendado)
4. Aguarde o projeto ser criado

## 2. Variáveis de ambiente

No seu `.env.local`, configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

Encontre esses valores em: **Project Settings** → **API** → Project URL e anon public key.

## 3. Aplicar migrações

### Opção A: Supabase CLI (recomendado)

```bash
# Instalar CLI: npm install -g supabase

# Vincular ao projeto
supabase link --project-ref seu-project-ref

# Aplicar migrações
supabase db push
```

O **Project Ref** está na URL do dashboard: `https://supabase.com/dashboard/project/SEU_PROJECT_REF`

### Opção B: SQL Editor (manual)

1. No dashboard do Supabase, vá em **SQL Editor** → **New query**
2. Copie e execute `supabase/migrations/20260215220000_create_warranties.sql`
3. Em nova query, copie e execute `supabase/migrations/20260217000000_integration_complete.sql`

## 4. Configurar Auth

1. **Authentication** → **Providers** → ative **Email** e **Google** (se usar)
2. **URL Configuration** → Site URL: `http://localhost:3001` (dev) ou sua URL de produção
3. **Redirect URLs** → adicione:
   - `http://localhost:3001/auth/callback`
   - `https://seu-dominio.com/auth/callback`

## 5. Realtime (para sincronização multi-dispositivo)

A migração já adiciona a tabela `warranties` ao Realtime. Se necessário, confira em:

**Database** → **Replication** → ative `warranties`

## 6. Storage (upload de notas fiscais)

A migração cria o bucket `invoices`. Verifique em **Storage** → deve existir o bucket `invoices` (público, 10MB, PDF/imagens).

## 7. Verificar instalação

```bash
npm run dev
```

1. Crie uma conta em `/signup`
2. Acesse `/dashboard`
3. Cadastre uma garantia e teste o upload de NF
4. Gere um QR em **QR Transfer** e acesse `/share/[id]` em aba anônima

## Tabelas criadas

| Tabela | Descrição |
|--------|-----------|
| warranties | Garantias do usuário |
| profiles | Perfis (criados automaticamente no signup) |
| notifications | Notificações |
| maintenance_logs | Histórico de manutenção |
| lending_logs | Empréstimos |
| folder_shares | Compartilhamento de pastas |
| marketplace_listings | Listagens no marketplace |
| marketplace_transactions | Transações |
| claims | Sinistros/reclamações |
| push_subscriptions | Push para notificações |

## Função RPC

- `get_warranty_for_share(wid uuid)` — Retorna dados públicos da garantia para o link de compartilhamento (acessível sem login).
