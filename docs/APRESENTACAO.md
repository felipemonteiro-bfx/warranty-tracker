# Roteiro de Apresentação - Guardião de Notas

Guia para demonstração da plataforma em pitch, demo ou reunião com stakeholders.

---

## Pré-requisitos

1. **Conta de teste** – Crie em `/signup` ou use login Google
2. **Dados mock** – No dashboard, clique em **"Dados de teste"** (visível em desenvolvimento ou com `NEXT_PUBLIC_DEMO_MODE=true`)
3. **Produção** – Para demo em produção, adicione `NEXT_PUBLIC_DEMO_MODE=true` nas variáveis da Vercel

---

## Fluxo sugerido (10–15 min)

### 1. Landing (2 min)

- Mostre a **home** (`/`) – hero, diferenciais, planos
- Destaque: *"Patrimônio auditado e seguro"*, IA, blindagem jurídica, compliance global

### 2. Login / Cadastro (1 min)

- **Entrar** ou **Começar Agora**
- Login com Google ou email – fluxo rápido

### 3. Dashboard – Meu Cofre (4 min)

- **Estatísticas**: Total, Ativas, Vencendo, Expiradas (gráficos animados)
- **Busca e filtros**: por status, texto
- **Cards de garantia**: 
  - Status (Protegido / Vencendo / Expirada)
  - Barra de progresso do prazo
  - Benefícios do cartão (Visa Platinum, Mastercard Black, Elo Gold)
  - Economia gerada (ex: iPhone com R$ 150)
- **Ações**: Dossiê de Revenda (PDF), Simular Seguro, Registrar Economia, Compartilhar

### 4. Detalhe de produto (2 min)

- Clique em uma garantia → `/products/[id]`
- Mostre: nota fiscal, manutenções, empréstimos, histórico

### 5. Funcionalidades extras (2 min)

- **Simulador de seguro** – `/insurance/simulator/[id]`
- **Marketplace** – `/marketplace` (anúncios, ofertas)
- **Notificações** – recalls, alertas
- **Plano Família / Pro** – `/plans`

### 6. Fechamento (1 min)

- Recursos: PWA, dark mode, modo privacidade
- CTA: *"Proteja seu patrimônio com o Guardião"*

---

## Dados mock – o que é criado

| Recurso | Quantidade |
|--------|------------|
| Garantias | 6 (mix ativas, vencendo, expiradas) |
| Notificações | 3 |
| Manutenções | 5 registros |
| Empréstimos | 2 (1 devolvido, 1 ativo) |
| Pastas compartilhadas | 2 |
| Anúncios marketplace | 2 |
| Seguradoras parceiras | 3 |
| Campanhas de anúncio | 2 |

---

## Dicas para a apresentação

1. **Use modo escuro** – Interface mais impactante
2. **Celular** – Mostre o PWA instalável
3. **Privacidade** – Ative o modo que oculta valores
4. **PDF** – Gere o Dossiê de Revenda para um produto e mostre o download

---

## Habilitar botão "Dados de teste" em produção

Na Vercel:

1. Settings → Environment Variables
2. Nome: `NEXT_PUBLIC_DEMO_MODE`
3. Valor: `true`
4. Ambiente: Production (ou Preview para testes)
5. Redeploy

Após a apresentação, remova ou altere para `false` por segurança.

Guia completo de variáveis: `docs/CHECKLIST_GITHUB_VERCEL.md`
