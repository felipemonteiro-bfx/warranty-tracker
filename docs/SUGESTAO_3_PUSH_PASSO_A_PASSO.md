# Sugestão 3 – Notificações push disfarçadas: passo a passo

## O que é a sugestão 3?

Mostrar **notificações push** quando chega mensagem nova, mas **disfarçadas de notícia** (título de manchete, ícone de jornal). Quem vê o celular vê “Nova notícia” em vez de “Nova mensagem”.

---

## ✅ Status: implementado

Todos os passos abaixo foram implementados no projeto. Para ativar em produção, faça a **configuração única** no final desta página.

### O que foi implementado

| Item | Arquivo / Onde |
|------|----------------|
| Service Worker (push + click) | `public/sw.js` |
| Registro SW + permissão + inscrição | `src/hooks/usePushSubscription.ts` |
| Botão “Receber alertas de notícias” | `src/components/shared/StealthNews.tsx` |
| Título/corpo disfarçados (lib compartilhada) | `src/lib/push-disguise.ts` |
| Tabela de inscrições | `docs/push_subscriptions.sql` |
| API salvar inscrição | `src/app/api/push/subscribe/route.ts` |
| API enviar push | `src/app/api/push/send/route.ts` |
| Envio ao mandar mensagem/mídia | `src/components/messaging/ChatLayout.tsx` |

### Fluxo

1. Usuário na tela de notícias clica em **“Receber alertas de notícias”** → pede permissão, registra SW, inscreve no push e envia a subscription para `POST /api/push/subscribe`.
2. A subscription é salva na tabela `push_subscriptions` (por usuário).
3. Quando alguém envia uma mensagem (ou mídia), o app chama `POST /api/push/send` com `recipientId` e `content`; a API gera título/corpo disfarçados e envia push para todas as subscriptions daquele destinatário.
4. O Service Worker recebe o push e mostra a notificação como “notícia”; ao clicar, abre o app.

---

## Configuração única (para ativar push)

### 1. Criar a tabela no Supabase

No **SQL Editor** do Supabase, execute o conteúdo de:

- `docs/push_subscriptions.sql`

### 2. Gerar chaves VAPID

No terminal (na raiz do projeto):

```bash
npx web-push generate-vapid-keys
```

Copie a chave **pública** e a **privada**.

### 3. Variáveis de ambiente

No `.env.local` (e na Vercel, se usar):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<chave pública>
VAPID_PRIVATE_KEY=<chave privada>
```

**Importante:** a chave privada não pode ser exposta no front; use só em variáveis de servidor (sem `NEXT_PUBLIC_`).

### 4. Instalar dependência

```bash
yarn install
```

(O pacote `web-push` já está no `package.json`.)

### 5. HTTPS

Push só funciona em **HTTPS** (ou localhost). Em produção use sempre HTTPS.

---

## O que já funcionava (in-app)

- Na tela de notícias, a cada **30 segundos** o app verifica mensagens não lidas e mostra **toast** e **card** “Nova Notícia Recebida” (só com o app aberto).
- Com a implementação acima, o destinatário também recebe **notificação push do sistema** (com app fechado), disfarçada de notícia.

---

## Resumo dos passos (referência)

| Passo | O que é | Onde está |
|-------|--------|-----------|
| 1 | Service Worker que recebe push e mostra notificação | `public/sw.js` |
| 2 | Registro do SW no app | `usePushSubscription` (após clique no botão) |
| 3 | Chaves VAPID | Você gera com `npx web-push generate-vapid-keys` e coloca no .env |
| 4 | Permissão + inscrição + salvar no backend | Botão em StealthNews → `POST /api/push/subscribe` |
| 5 | Backend que envia push | `POST /api/push/send` com web-push |
| 6 | Disparar ao enviar mensagem | ChatLayout após `insert` em mensagem/mídia |
| 7 | Título disfarce | `src/lib/push-disguise.ts` (title + body) |
| 8 | HTTPS | Obrigatório em produção |

Depois da configuração única, a sugestão 3 fica ativa: push real, disfarçado de notícia, de ponta a ponta.
