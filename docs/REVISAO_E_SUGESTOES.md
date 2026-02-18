# Revisão de Erros e 15 Sugestões de Melhorias

## ✅ Erros Corrigidos

| Erro | Arquivo | Correção |
|------|---------|----------|
| `MessageCircle` não definido | `products/[id]/page.tsx` | Adicionado import de `MessageCircle` do lucide-react |
| `eslint-disable` não utilizado | `dashboard/page.tsx`, `sync/page.tsx` | Removidas diretivas desnecessárias |

**Build e lint:** ✅ Passando

---

## 15 Sugestões de Melhorias, Automações e Otimizações

### 1. **React Query / SWR para cache de dados**
**Problema:** Múltiplas páginas fazem `fetch` manual em `useEffect` sem cache nem revalidação.  
**Sugestão:** Usar SWR ou TanStack Query para cache, revalidação em foco e deduplicação de requisições.  
**Benefício:** Menos chamadas ao Supabase, UX mais fluida.

### 2. **Centralizar logging com `logger`**
**Problema:** `console.error`, `console.warn` e `console.log` espalhados em 30+ arquivos.  
**Sugestão:** Usar `src/lib/logger.ts` em todos os pontos e configurar níveis (dev/prod).  
**Benefício:** Logs padronizados e mais fáceis de monitorar.

### 3. **Hooks reutilizáveis para Supabase**
**Problema:** Lógica repetida de `getUser`, `from('warranties').select()` em várias páginas.  
**Sugestão:** Criar `useWarranties()`, `useProfile()`, `useListings()` etc.  
**Benefício:** Menos duplicação e manutenção mais simples.

### 4. **Skeleton loaders em vez de spinner**
**Problema:** Apenas `<Loader2 className="animate-spin" />` durante carregamento.  
**Sugestão:** Usar skeletons no layout das páginas principais (dashboard, vault, marketplace).  
**Benefício:** Sensação de carregamento mais rápido e consistência visual.

### 5. **Error boundaries por seção**
**Problema:** Erro em um card pode derrubar toda a página.  
**Sugestão:** Error boundaries por módulo (ex.: cards de garantia, marketplace).  
**Benefício:** Falhas isoladas e experiência mais estável.

### 6. **Automação de alertas com Vercel Cron**
**Problema:** Smart Alerts são passivos (só mostram ao abrir a página).  
**Sugestão:** Vercel Cron que roda diariamente e cria registros em `notifications` para vencimentos em 30/15/7 dias.  
**Benefício:** Notificações proativas sem ação do usuário.

### 7. **Otimizar imagens do Next.js**
**Problema:** `next.config` tem `remotePatterns` fixos; algumas imagens podem estar sem otimização.  
**Sugestão:** Revisar uso de `next/image` e adicionar `sizes` adequados em layouts responsivos.  
**Benefício:** Menor uso de banda e melhor LCP.

### 8. **Lazy load de rotas pesadas**
**Problema:** Páginas como Analytics (Recharts) carregam tudo no bundle inicial.  
**Sugestão:** `dynamic(() => import('./Analytics'), { ssr: false })` ou lazy para Analytics/Patrimônio.  
**Benefício:** Bundle inicial menor e TTI melhor.

### 9. **Validação com Zod nas bordas**
**Problema:** Validação principalmente no cliente; APIs podem receber dados inválidos.  
**Sugestão:** Schemas Zod em `/api/*` e reutilizar no front.  
**Benefício:** Mais segurança e menos bugs de integração.

### 10. **Notificações push para ofertas do marketplace**
**Problema:** Vendedor só vê ofertas ao abrir `/marketplace/ofertas`.  
**Sugestão:** Web Push quando chegar nova oferta (já existe `push_subscriptions`).  
**Benefício:** Resposta mais rápida às ofertas.

### 11. **Realtime nas ofertas do marketplace**
**Problema:** Lista de ofertas não atualiza em tempo real.  
**Sugestão:** `postgres_changes` em `marketplace_offers` para sellers.  
**Benefício:** Atualização imediata sem refresh.

### 12. **Debounce em buscas**
**Problema:** Algumas buscas disparam a cada tecla.  
**Sugestão:** Confirmar uso consistente de `useDebounce` em busca/filtros.  
**Benefício:** Menos requisições e melhor performance.

### 13. **Retry automático em falhas de rede**
**Problema:** Falha de rede derruba o fluxo sem retry.  
**Sugestão:** Wrapper ou interceptor com retry (ex.: 2 tentativas) para chamadas ao Supabase.  
**Benefício:** Mais resiliência em conexões instáveis.

### 14. **Testes E2E para fluxos críticos**
**Problema:** Cobertura de testes pode ser insuficiente após novas features.  
**Sugestão:** Testes Playwright para: login → cadastro de garantia → anúncio → oferta.  
**Benefício:** Regressões detectadas antes de deploy.

### 15. **Monitoramento de erros (Sentry)**
**Problema:** Erros em produção não são rastreados.  
**Sugestão:** Integrar Sentry (ou similar) para capturar exceções e rejeições de Promise.  
**Benefício:** Visibilidade de erros reais e correção mais rápida.

---

## Priorização Sugerida

| Prioridade | Itens | Esforço |
|------------|-------|---------|
| Alta      | 1, 3, 9, 14   | Médio   |
| Média     | 2, 6, 10, 11  | Baixo–Médio |
| Baixa     | 4, 5, 7, 8, 12, 13, 15 | Variado |

---

## Resumo de Implementação Rápida

- **1–2h:** Itens 2, 12 (logging + debounce).  
- **3–5h:** Itens 3, 9 (hooks + Zod).  
- **1 dia:** Itens 6, 10, 11 (cron, push, realtime).  
- **2+ dias:** Itens 1, 4, 5, 7, 8, 13, 14, 15.
