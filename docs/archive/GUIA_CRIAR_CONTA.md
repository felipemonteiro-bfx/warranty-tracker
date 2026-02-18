# 📝 Guia: Criar Conta no Guardião

## 🚀 Como Criar sua Conta

### Passo a Passo:

1. **Acesse**: http://localhost:3001/signup
   - Ou clique em "Criar agora" na página inicial

2. **Preencha o formulário**:
   - **Nome Completo**: Seu nome completo (ex: João Silva)
   - **Nickname Secreto**: Um apelido único (ex: joao_silva)
   - **E-mail**: Seu email válido (ex: joao@email.com)
   - **Senha**: Uma senha segura (mínimo 6 caracteres)

3. **Clique em**: "Finalizar Cadastro"

4. **Verifique seu email**:
   - Você receberá um email de confirmação
   - Clique no link para confirmar sua conta

5. **Faça login**:
   - Acesse: http://localhost:3001/login
   - Use o email e senha que você criou

## ⚠️ Importante

### Se não receber o email de confirmação:

**Opção 1: Desativar confirmação de email (Desenvolvimento)**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication > Settings**
3. Desative **"Enable email confirmations"**
4. Agora você pode fazer login imediatamente após criar a conta

**Opção 2: Verificar no Supabase**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication > Users**
3. Verifique se sua conta foi criada
4. Se necessário, confirme manualmente ou resete a senha

## 🎯 Modo Desenvolvimento (Sem Confirmação)

Se quiser testar sem precisar confirmar email:

1. **Desative confirmação** no Supabase (veja acima)
2. **OU** use o modo dev-bypass: http://localhost:3001/dev-bypass

## 📋 Campos do Formulário

- **Nome Completo**: Aparece no seu perfil
- **Nickname Secreto**: Usado para identificação única (sem espaços, apenas letras, números e _)
- **E-mail**: Usado para login e recuperação de senha
- **Senha**: Mínimo 6 caracteres (recomendado: 8+ com letras, números e símbolos)

## ✨ Após Criar a Conta

Você terá acesso a:
- ✅ Dashboard com suas garantias
- ✅ Cofre de documentos
- ✅ Marketplace
- ✅ Análises e relatórios
- ✅ Todas as funcionalidades do Guardião

---

**Pronto para criar sua conta!** Acesse: http://localhost:3001/signup
