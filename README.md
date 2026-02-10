# 🛡️ Warranty Tracker SaaS

Aplicativo Web moderno para gerenciamento de garantias de produtos, com preenchimento automático via Inteligência Artificial.

## 🚀 Funcionalidades

- **Interface Premium (UI/UX):** Design moderno com Glassmorphism, degradês vibrantes e animações fluidas via Framer Motion.
- **Inteligência Artificial (Gemini):** Upload de nota fiscal com extração automática de dados via IA (Nome, Data e Categoria).
- **Dashboard Estratégico:** Visualização clara de produtos protegidos, vencendo em breve ou expirados.
- **Autenticação Segura:** Sistema de login e cadastro totalmente em Português-BR.
- **Gestão de Garantias:** CRUD completo (Criar, Listar, Editar e Excluir) com armazenamento de arquivos no Supabase.

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem:** TypeScript
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/)
- **IA:** [Google Gemini Pro Vision](https://aistudio.google.com/)
- **Estilização:** Tailwind CSS & Lucide Icons

## 📋 Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/felipemonteiro-bfx/warranty-tracker.git
   cd warranty-tracker
   ```

2. **Instale as dependências:**
   ```bash
   yarn install
   ```

3. **Variáveis de Ambiente (.env.local):**
   Crie um arquivo `.env.local` com as seguintes chaves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
   NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
   ```

4. **Banco de Dados:**
   Execute o script SQL fornecido na pasta `docs/schema.sql` (ou no histórico do chat) no SQL Editor do Supabase.

5. **Inicie o servidor:**
   ```bash
   yarn dev
   ```
   Acesse `http://localhost:3001`.

## 📈 Sugestões de Melhorias (Roadmap)

1. **Notificações:** Envio de e-mail automático 15 dias antes de uma garantia vencer.
2. **Categorias Customizadas:** Permitir que o usuário crie suas próprias categorias.
3. **Multi-moeda:** Suporte para registrar o valor pago em diferentes moedas.
4. **Relatórios:** Exportar lista de garantias em PDF ou Excel.
5. **Modo Escuro:** Implementar alternância de tema Dark/Light.

---
Desenvolvido com ⚡ por Gemini CLI.