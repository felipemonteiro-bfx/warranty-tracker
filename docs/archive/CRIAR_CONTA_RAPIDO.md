# 🚀 Criar Conta no Guardião - Guia Rápido

## 📝 Formulário de Cadastro

Acesse: **http://localhost:3001/signup** (já aberto no navegador)

### Campos Necessários:

1. **Nome Completo**
   - Exemplo: `João Silva`
   - Aparece no seu perfil

2. **Nickname Secreto**
   - Exemplo: `joao_silva`
   - Sem espaços, apenas letras, números e underscore (_)
   - Usado para identificação única

3. **E-mail**
   - Exemplo: `joao@email.com`
   - Usado para login e recuperação de senha

4. **Senha**
   - Mínimo 6 caracteres
   - Recomendado: 8+ caracteres com letras, números e símbolos

## ✅ Após Criar a Conta

1. **Você verá**: "Conta criada! Verifique seu e-mail."
2. **Verifique seu email** para confirmar a conta
3. **OU** desative confirmação de email no Supabase (veja abaixo)

## ⚡ Modo Rápido (Sem Confirmação de Email)

Para desenvolvimento, você pode desativar a confirmação de email:

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication > Settings**
3. Desative **"Enable email confirmations"**
4. Agora você pode fazer login imediatamente após criar a conta

## 🔑 Fazer Login

Após criar a conta:

1. Acesse: http://localhost:3001/login
2. Digite seu **email** e **senha**
3. Clique em **"Entrar no Sistema"**
4. Você será redirecionado para o dashboard

## 🎯 Modo Desenvolvimento (Sem Login)

Se quiser testar sem criar conta:

1. Acesse: http://localhost:3001/dev-bypass
2. Clique em **"Ativar Bypass de Autenticação"**
3. Acesse: http://localhost:3001/dashboard

---

**Formulário já está aberto! Preencha os dados e crie sua conta.**
