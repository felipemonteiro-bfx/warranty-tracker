# ✅ Verificação Supabase - Checklist Completo

## 🔐 Configuração do Supabase

### 1. Variáveis de Ambiente ✅

Verifique se estão configuradas no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Status**: ✅ Configurado (verificado)

### 2. Database Schema

#### Execute no SQL Editor do Supabase:

1. **Tabela `warranties`**:
   - Arquivo: `docs/schema.sql`
   - Cria tabela principal de garantias
   - Configura RLS (Row Level Security)

2. **Tabelas de Messaging**:
   - Arquivo: `docs/messaging_schema.sql`
   - Cria tabelas: `profiles`, `chats`, `messages`, `chat_participants`
   - Configura RLS e Realtime

#### Como Executar:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo de `docs/schema.sql`
6. Execute (Ctrl+Enter ou botão Run)
7. Repita para `docs/messaging_schema.sql`

### 3. Storage Buckets

#### Criar Buckets:

1. Vá em **Storage** no dashboard do Supabase
2. Clique em **New bucket**

**Bucket 1: `invoices`**
- Nome: `invoices`
- Público: ✅ Sim
- File size limit: 10MB
- Allowed MIME types: `image/*, application/pdf`

**Bucket 2: `chat-media`**
- Nome: `chat-media`
- Público: ❌ Não (privado)
- File size limit: 5MB
- Allowed MIME types: `image/*, video/*`

### 4. Row Level Security (RLS)

#### Verificar Policies:

1. Vá em **Authentication > Policies**
2. Verifique se há policies para:
   - `warranties` - Usuários só veem suas próprias garantias
   - `profiles` - Usuários podem ler todos, atualizar apenas o próprio
   - `messages` - Usuários só veem mensagens de chats que participam
   - `chats` - Usuários só veem chats que participam

### 5. Realtime

#### Ativar Realtime:

1. Vá em **Database > Replication**
2. Ative para as tabelas:
   - ✅ `messages`
   - ✅ `chats`
   - ✅ `chat_participants`

### 6. Authentication

#### Configurar Providers:

1. Vá em **Authentication > Providers**
2. Configure:
   - ✅ Email (habilitado por padrão)
   - ✅ Google OAuth (se necessário)
   - ✅ Outros providers conforme necessário

#### Redirect URLs:

Adicione URLs permitidas:
- `http://localhost:3001/auth/callback`
- `https://seu-dominio.vercel.app/auth/callback`

## 🧪 Testar Conexão

### Teste Local:

```bash
# Verificar variáveis
yarn type-check

# Iniciar servidor
yarn dev

# Acessar
# http://localhost:3001
```

### Verificar no Console do Navegador:

1. Abra http://localhost:3001
2. Abra DevTools (F12)
3. Vá em Console
4. Não deve haver erros de conexão com Supabase

## 📊 Status da Verificação

Execute:
```powershell
.\scripts\verificar-config.ps1
```

Isso verificará:
- ✅ Variáveis de ambiente
- ✅ TypeScript
- ✅ Servidor local
- ✅ Configurações básicas

## 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: https://supabase.com/dashboard/project/_/sql
- **Storage**: https://supabase.com/dashboard/project/_/storage/buckets
- **Authentication**: https://supabase.com/dashboard/project/_/auth/providers

## ✅ Checklist Rápido

- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado
- [ ] Storage buckets criados
- [ ] RLS policies configuradas
- [ ] Realtime ativado
- [ ] Authentication configurado
- [ ] Teste local funcionando
