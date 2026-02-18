# 📦 Configurar Storage Buckets no Supabase

Este guia mostra como configurar os buckets de Storage necessários para o Warranty Tracker.

## 🎯 Buckets Necessários

O sistema precisa de **2 buckets**:

1. **`invoices`** - Para armazenar notas fiscais (PÚBLICO)
2. **`chat-media`** - Para armazenar mídia de mensagens (PRIVADO)

---

## 🚀 Método 1: Via Interface do Supabase (Recomendado)

### Passo 1: Acessar Storage

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**

### Passo 2: Criar Bucket `invoices` (Público)

1. Clique em **"Create bucket"** ou **"New bucket"**
2. Preencha os campos:
   - **Name**: `invoices`
   - **Public bucket**: ✅ **Marque como PÚBLICO** (toggle ativado)
   - **File size limit**: Deixe padrão ou configure (ex: 10MB)
   - **Allowed MIME types**: Opcional (ex: `image/*,application/pdf`)
3. Clique em **"Create bucket"**

### Passo 3: Criar Bucket `chat-media` (Privado)

1. Clique em **"Create bucket"** novamente
2. Preencha os campos:
   - **Name**: `chat-media`
   - **Public bucket**: ❌ **Deixe PRIVADO** (toggle desativado)
   - **File size limit**: Configure conforme necessário (ex: 50MB)
   - **Allowed MIME types**: Opcional (ex: `image/*,video/*,audio/*`)
3. Clique em **"Create bucket"**

### Passo 4: Configurar Políticas RLS (Row Level Security)

As políticas já devem estar criadas pelos scripts SQL, mas vamos verificar:

#### 4.1 Verificar Políticas do Bucket `invoices`

1. Vá em **Storage** > **Policies** (ou clique no bucket `invoices` > **Policies**)
2. Você deve ver estas políticas:

**Política 1: Upload**
- **Name**: `Allow authenticated uploads`
- **Operation**: INSERT
- **Policy**: `bucket_id = 'invoices' AND auth.role() = 'authenticated'`

**Política 2: Leitura**
- **Name**: `Allow owners to see their own files`
- **Operation**: SELECT
- **Policy**: `bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]`

#### 4.2 Verificar Políticas do Bucket `chat-media`

1. Clique no bucket `chat-media` > **Policies**
2. Você deve ver estas políticas:

**Política 1: Upload**
- **Name**: `Authenticated users can upload media`
- **Operation**: INSERT
- **Policy**: `bucket_id = 'chat-media' AND auth.role() = 'authenticated'`

**Política 2: Leitura**
- **Name**: `Participants can view media`
- **Operation**: SELECT
- **Policy**: `bucket_id = 'chat-media' AND auth.role() = 'authenticated'`

#### 4.3 Se as Políticas Não Existem

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Políticas para bucket 'invoices'
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

CREATE POLICY "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Políticas para bucket 'chat-media'
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

CREATE POLICY "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );
```

---

## 🔧 Método 2: Via SQL (Alternativo)

Se preferir criar tudo via SQL, execute este script no **SQL Editor**:

```sql
-- Criar bucket 'invoices' (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', true, 10485760, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Criar bucket 'chat-media' (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*'])
ON CONFLICT (id) DO UPDATE 
SET public = false;

-- Políticas para 'invoices'
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Allow owners to see their own files"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Políticas para 'chat-media'
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );

CREATE POLICY IF NOT EXISTS "Participants can view media"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-media' AND auth.role() = 'authenticated' );
```

---

## ✅ Verificação

### Teste 1: Verificar Buckets Criados

1. Vá em **Storage** no Supabase
2. Você deve ver:
   - ✅ `invoices` (com ícone de globo 🌐 indicando público)
   - ✅ `chat-media` (sem ícone de globo, indicando privado)

### Teste 2: Testar Upload (Opcional)

**Para `invoices`:**
1. No app, tente fazer upload de uma nota fiscal
2. Verifique em **Storage** > `invoices` se o arquivo apareceu

**Para `chat-media`:**
1. No app, envie uma imagem em uma conversa
2. Verifique em **Storage** > `chat-media` se o arquivo apareceu

---

## 🔒 Segurança

### Bucket `invoices` (Público)
- ✅ Usuários autenticados podem fazer upload
- ✅ Apenas o dono do arquivo pode visualizar (baseado no user_id no caminho)
- ⚠️ URLs são públicas, mas protegidas por RLS

### Bucket `chat-media` (Privado)
- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Apenas usuários autenticados podem visualizar
- ✅ URLs não são públicas (requer autenticação)

---

## 🐛 Troubleshooting

### Erro: "Bucket not found"
- **Solução**: Verifique se o bucket foi criado corretamente
- Execute o SQL do Método 2 para garantir

### Erro: "Permission denied"
- **Solução**: Verifique se as políticas RLS estão criadas
- Execute o SQL das políticas novamente

### Erro: "File too large"
- **Solução**: Aumente o `file_size_limit` do bucket
- Ou configure no código para validar antes do upload

### Upload funciona mas não aparece no Storage
- **Solução**: Verifique se o usuário está autenticado
- Verifique se as políticas permitem INSERT

---

## 📋 Checklist

- [ ] Bucket `invoices` criado (público)
- [ ] Bucket `chat-media` criado (privado)
- [ ] Políticas RLS para `invoices` configuradas
- [ ] Políticas RLS para `chat-media` configuradas
- [ ] Teste de upload funcionando
- [ ] URLs públicas funcionando (para `invoices`)

---

## 🔗 Links Úteis

- [Documentação Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas RLS para Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Dashboard Supabase](https://supabase.com/dashboard)

---

**Pronto!** Seus buckets estão configurados e prontos para uso. 🎉
