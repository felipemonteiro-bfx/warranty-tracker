# ⚡ Configurar Google Auth - Guia Rápido

## 🎯 Resumo Rápido

O código já está pronto! Você só precisa configurar no Google Cloud e Supabase.

## 📋 Passos Essenciais

### 1. Google Cloud Console (5 minutos)

1. **Acesse**: https://console.cloud.google.com/
2. **Crie projeto** ou selecione existente
3. **Tela de Consentimento**: APIs e Serviços > Tela de consentimento OAuth
   - Tipo: Externo
   - Nome: Guardião
   - Escopos: `email`, `profile`, `openid`
   - Adicione seu email como usuário de teste
4. **Credenciais**: APIs e Serviços > Credenciais > Criar credenciais > ID do cliente OAuth
   - Tipo: Aplicativo da Web
   - **URIs de redirecionamento**: 
     ```
     http://localhost:3001/auth/callback
     ```
5. **Copie**: Client ID e Client Secret

### 2. Supabase (2 minutos)

1. **Acesse**: https://supabase.com/dashboard
2. **Vá em**: Authentication > Providers > Google
3. **Ative** o toggle
4. **Cole**:
   - Client ID (do Google Cloud)
   - Client Secret (do Google Cloud)
5. **Salve**

### 3. Verificar Redirect URLs

1. Em **Authentication > URL Configuration**
2. Verifique:
   - Site URL: `http://localhost:3001`
   - Redirect URLs: `http://localhost:3001/auth/callback`

## ✅ Pronto!

Agora você pode:
- Acessar: http://localhost:3001/login
- Clicar em **"Continuar com Google"**
- Fazer login com sua conta Google

## 🐛 Problemas Comuns

### "redirect_uri_mismatch"
- Verifique se a URL está **exatamente** igual: `http://localhost:3001/auth/callback`
- Deve ser `http` (não `https`) para localhost
- Sem trailing slash `/` no final

### Botão não funciona
- Verifique se o provider está **ativado** no Supabase
- Verifique se Client ID e Secret estão corretos
- Limpe cache do navegador: `Ctrl+Shift+R`

## 📚 Guia Completo

Para mais detalhes, veja: `CONFIGURAR_GOOGLE_AUTH.md`

---

**Tempo estimado**: 7 minutos
**Dificuldade**: Fácil
