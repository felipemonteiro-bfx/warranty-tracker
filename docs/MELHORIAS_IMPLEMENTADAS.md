# Melhorias Implementadas – Proteção de Preço e Marketplace

## Resumo

Foram implementadas as funcionalidades de **proteção de preço** (benefício do cartão) e **marketplace com ofertas entre usuários**.

---

## 1. Proteção de Preço (Benefício do Cartão)

### O que foi feito

- **`src/lib/card-benefits.ts`**: centraliza a lógica de benefícios por bandeira/nível:
  - **Black / Infinite / World**: +12 meses garantia, proteção de preço 60 dias, proteção de compra 90 dias
  - **Platinum / Signature**: +6 meses, proteção de preço 60 dias, proteção de compra 90 dias
  - **Gold / Internacional**: +3 meses garantia

- **WarrantyCard**: mostra "Proteção de preço ativa: X dias" quando o cartão tem benefício e ainda está no prazo.

- **Página do produto** (`/products/[id]`): card "Proteção de preço" com:
  - Dias restantes para acionar
  - Botão "Verificar preço e acionar" (placeholder para integração futura)

- **Tabela `price_protection_claims`**: para registro de acionamentos (base para fluxo futuro).

### Próximos passos sugeridos

1. Integrar com API de preços (Buscapé, Zoom, etc.) para checagem automática.
2. Formulário de acionamento que preencha `price_protection_claims` e instrua o usuário a contatar o banco.
3. Notificações quando o preço cair (se houver integração com API de preços).

---

## 2. Marketplace com Ofertas

### O que foi feito

- **Tabela `marketplace_offers`**:
  - `listing_id`, `buyer_id`, `offer_amount`, `message`
  - Status: `pending`, `accepted`, `rejected`, `expired`, `withdrawn`
  - Uma oferta por comprador por anúncio (UNIQUE listing_id, buyer_id)

- **Página de anúncio** (`/marketplace/[id]`):
  - Detalhes do produto
  - Link para certificado de procedência (`/share/warranty_id`)
  - Formulário para enviar oferta (valor + mensagem)
  - Vendedor vê botão "Ver ofertas recebidas"

- **Página de ofertas** (`/marketplace/ofertas`):
  - Abas "Recebidas" e "Enviadas"
  - Aceitar / recusar ofertas recebidas
  - Status de cada oferta

- **Ajustes de navegação**:
  - Marketplace → link do card para `/marketplace/[id]` (em vez de `/share`)
  - Página do produto → botões "Ver Anúncio" e "Ver ofertas recebidas"
  - Header do Marketplace → botão "Minhas ofertas"

### Fluxo

1. Usuário A anuncia produto em `/products/[id]` → "Anunciar no Marketplace".
2. Usuário B vê o anúncio em `/marketplace` e clica para abrir.
3. Na página do anúncio, B envia oferta (ex.: R$ 2.500) + mensagem.
4. A recebe em `/marketplace/ofertas` e pode aceitar ou recusar.
5. Após aceite, contato deve ser feito fora da plataforma (e-mail/WhatsApp).

### Próximos passos sugeridos

1. **Mensagens em tempo real**: Supabase Realtime para novas ofertas.
2. **Notificações**: e-mail/push quando houver nova oferta.
3. **Contato dentro do app**: chat ou troca de e-mail entre comprador e vendedor.
4. **Escrow**: pagamento via Stripe Connect com liberação após confirmação de recebimento.

---

## 3. Testes

1. **Proteção de preço**:
   - Cadastre uma garantia com cartão "Visa Platinum" ou "Mastercard Black".
   - Abra o produto e confira o card de proteção de preço.
   - No card da garantia no dashboard, confira o texto "Proteção de preço ativa: X dias".

2. **Marketplace**:
   - Crie anúncio em um produto com valor de revenda.
   - Com outra conta (ou em aba anônima após login), abra `/marketplace` e o anúncio.
   - Envie uma oferta com valor e mensagem.
   - Volte com a conta do vendedor e abra `/marketplace/ofertas` para aceitar ou recusar.

---

## 4. Migração aplicada

```
20260217100000_marketplace_offers_price_protection.sql
```

- `marketplace_offers` com RLS
- `price_protection_claims` com RLS
