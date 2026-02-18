# Configuração do Sentry - Passo a Passo

## O Sentry é gratuito?

**Sim.** O Sentry oferece um plano gratuito (Developer) com:

| Recurso | Limite mensal |
|---------|---------------|
| **Erros** | 5.000 |
| **Session Replay** | 50 sessões |
| **Tracing (spans)** | 10 milhões |
| **Projetos** | Ilimitados |
| **Usuários** | 1 |
| **Alertas** | Email |

Para a maioria dos projetos pequenos e médios, o plano gratuito é suficiente.  
Consulte: [sentry.io/pricing](https://sentry.io/pricing)

---

## Passo 1: Criar conta no Sentry

1. Acesse **https://sentry.io/signup/**
2. Crie sua conta (pode usar Google, GitHub, etc.)
3. Escolha o **plano gratuito** quando perguntado

---

## Passo 2: Criar um projeto

1. Após o login, clique em **Create Project**
2. Escolha a plataforma: **Next.js**
3. Nome sugerido: `guardiao-notas` (ou o nome do seu app)
4. Clique em **Create Project**
5. Na próxima tela, o Sentry mostrará o **DSN** (Data Source Name)
   - Formato: `https://xxxx@xxxx.ingest.sentry.io/xxxx`
   - **Copie** esse valor

---

## Passo 3: Configurar no projeto

1. Crie o arquivo `.env.local` na raiz do projeto (se ainda não existir)
2. Adicione a variável com o DSN copiado:

```env
NEXT_PUBLIC_SENTRY_DSN=https://seu-dsn-aqui@xxxx.ingest.sentry.io/xxxx
```

3. Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

## Passo 4: Testar a integração

1. Com o app rodando, acesse: **http://localhost:3001/sentry-test**
2. Clique em **"Lançar erro de teste"** – um erro será enviado ao Sentry
3. Clique em **"Enviar mensagem"** – uma mensagem informativa será enviada
4. Clique em **"Testar erro na API"** – um erro do servidor será enviado
5. Abra o painel do Sentry: **https://sentry.io** → seu projeto
6. Em **Issues**, você deve ver os eventos de teste em poucos segundos

---

## Passo 5: Configurar alertas (opcional)

1. No Sentry, vá em **Alerts** → **Create Alert**
2. Escolha **Issues** → **When an issue is first seen**
3. Adicione seu email para receber notificações
4. Salve

---

## Passo 6: Deploy na Vercel

1. No painel da Vercel, abra **Settings** → **Environment Variables**
2. Adicione:
   - **Nome:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Valor:** o mesmo DSN usado localmente
   - **Environment:** Production (e Preview, se quiser)
3. Faça um novo deploy

---

## Source maps (stack traces legíveis) – opcional

Para ver o código-fonte nos erros em vez de código minificado:

1. No Sentry: **Settings** → **Auth Tokens** → **Create Token**
   - Scopes: `project:releases`, `org:read`
2. No projeto, crie **Settings** → **Projects** → seu projeto
   - Anote o **Organization slug** e o **Project slug**
3. Adicione no `.env.local` (e na Vercel):

```env
SENTRY_ORG=seu-org-slug
SENTRY_PROJECT=seu-projeto-slug
SENTRY_AUTH_TOKEN=sntrys_xxx
```

4. No próximo build, os source maps serão enviados automaticamente

---

## Rotas e arquivos do Sentry no projeto

| Arquivo | Função |
|---------|--------|
| `sentry.client.config.ts` | Configuração do navegador |
| `sentry.server.config.ts` | Configuração do Node.js (API routes) |
| `sentry.edge.config.ts` | Configuração do Edge (middleware) |
| `instrumentation.ts` | Carrega as configs server/edge |
| `src/app/global-error.tsx` | Captura erros de renderização React |
| `src/app/(dashboard)/sentry-test/page.tsx` | Página de teste (remover em prod se quiser) |

---

## Remover a página de teste em produção

Para evitar que usuários acessem `/sentry-test` em produção:

1. Adicione uma verificação na página, ou
2. Mova para uma rota protegida (ex: `/admin/sentry-test`), ou
3. Delete o diretório `src/app/(dashboard)/sentry-test/` antes do deploy

---

## Verificar uso (plano gratuito)

No Sentry: **Settings** → **Usage** para acompanhar erros, replays e spans usados no mês.
