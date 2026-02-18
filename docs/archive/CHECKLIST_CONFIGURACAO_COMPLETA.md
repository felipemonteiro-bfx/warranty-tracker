# ✅ Checklist Completo de Configuração - Warranty Tracker

Use este checklist para garantir que tudo está configurado corretamente no Supabase.

## 📋 Status da Configuração

### 1. ✅ Storage Buckets (Você já fez isso!)

- [x] Script `docs/storage_buckets_setup.sql` criado
- [ ] Bucket `invoices` criado (público)
- [ ] Bucket `chat-media` criado (privado)
- [ ] Políticas RLS dos buckets configuradas

**Como verificar:**
1. Vá em **Storage** no Supabase
2. Você deve ver os 2 buckets listados
3. Execute `docs/verificar_configuracao.sql` para verificar políticas

---

### 2. 📊 Banco de Dados (Tabelas)

- [ ] Tabela `warranties` criada
- [ ] Tabela `profiles` criada
- [ ] Tabela `chats` criada
- [ ] Tabela `chat_participants` criada
- [ ] Tabela `messages` criada
- [ ] Políticas RLS das tabelas configuradas

**Como fazer:**
1. Execute `docs/schema.sql` no SQL Editor
2. Execute `docs/messaging_schema.sql` no SQL Editor
3. Verifique em **Table Editor** se todas aparecem

**Como verificar:**
- Execute `docs/verificar_configuracao.sql`
- Ou vá em **Table Editor** e confira manualmente

---

### 3. 🔄 Realtime (Para Mensagens em Tempo Real)

- [ ] Realtime ativado para `messages`
- [ ] Realtime ativado para `chats`
- [ ] Realtime ativado para `chat_participants`

**Como fazer:**
1. Execute `docs/realtime_setup.sql` no SQL Editor
2. Ou vá em **Database** > **Replication** e ative manualmente

**Como verificar:**
- Execute `docs/verificar_configuracao.sql`
- Ou vá em **Database** > **Replication** e confira os toggles

---

### 4. 🌐 CORS (Para Deploy em Produção)

- [ ] CORS configurado para `http://localhost:3001`
- [ ] CORS configurado para domínio de produção (Vercel)

**Como fazer:**
1. Vá em **Settings** > **API**
2. Role até **"Allowed CORS Origins"**
3. Adicione:
   ```
   http://localhost:3001
   https://seu-projeto.vercel.app
   ```

---

### 5. 🔑 Variáveis de Ambiente

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada no `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada no `.env.local`
- [ ] Variáveis configuradas no Vercel (para produção)

**Como verificar:**
- Abra `.env.local` e confira se as variáveis estão preenchidas
- Para produção: vá em Vercel > Settings > Environment Variables

---

### 6. 🔐 Google OAuth (Opcional)

- [ ] Google OAuth configurado no Google Cloud Console
- [ ] Redirect URLs configuradas no Supabase
- [ ] Credenciais OAuth adicionadas no Supabase

**Como fazer:**
- Siga o guia: `CONFIGURAR_GOOGLE_AUTH.md`

---

## 🚀 Scripts SQL para Executar

Execute estes scripts **na ordem** no SQL Editor do Supabase:

1. ✅ `docs/schema.sql` - Criar tabelas principais
2. ✅ `docs/messaging_schema.sql` - Criar tabelas de mensagens
3. ✅ `docs/storage_buckets_setup.sql` - Configurar buckets (você já tem!)
4. ✅ `docs/realtime_setup.sql` - Ativar Realtime
5. ✅ `docs/verificar_configuracao.sql` - Verificar tudo

---

## ✅ Verificação Rápida

Execute este comando para verificar tudo de uma vez:

```sql
-- Execute docs/verificar_configuracao.sql no SQL Editor
```

Ou use o script PowerShell:

```powershell
.\scripts\configurar-storage-buckets.ps1
# Escolha opção 3: Verificar configuração atual
```

---

## 🐛 Troubleshooting

### Erro: "Bucket not found"
- Execute `docs/storage_buckets_setup.sql` novamente

### Erro: "Table does not exist"
- Execute `docs/schema.sql` e `docs/messaging_schema.sql`

### Mensagens não aparecem em tempo real
- Execute `docs/realtime_setup.sql`

### Erro CORS no navegador
- Configure CORS em **Settings** > **API**

---

## 📚 Documentação Relacionada

- `CONFIGURAR_SUPABASE.md` - Guia completo passo a passo
- `CONFIGURAR_STORAGE_BUCKETS.md` - Detalhes sobre buckets
- `CONFIGURAR_GOOGLE_AUTH.md` - Configurar Google OAuth
- `DEPLOY_PRODUCAO.md` - Deploy para produção

---

**Última atualização:** Após executar todos os scripts SQL, execute `docs/verificar_configuracao.sql` para confirmar que tudo está OK! ✅
