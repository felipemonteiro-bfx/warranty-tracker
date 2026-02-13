# Roadmap de Receita – Guardião de Notas

Três pilares para monetização: **seguro (comissão)**, **marketplace (taxa na venda)** e **anúncios (empresas por segmento)**.

---

## 1. Integração com Seguradoras (comissão)

**Objetivo:** O usuário cota seguro a partir de um produto cadastrado; você (dono da operação) recebe comissão quando a apólice for fechada.

### Fluxo
- Na tela do **produto** ([id]): botão **"Cotar seguro"** ou **"Avaliar seguro"**.
- Avaliação imediata: simulação (já existe em `/insurance/simulator/[id]`) + ofertas de **parceiros**.
- Parceiros: tabela `insurance_partners` (nome, link/API, % comissão). Ex.: redirect para site da seguradora com link de afiliado, ou API de cotação.
- Ao converter (clique no parceiro ou webhook de venda), registrar em `insurance_quotes` / `insurance_conversions` para contabilizar comissão.

### Tabelas (ver `schema_receita.sql`)
- `insurance_partners` – seguradoras parceiras, % comissão, URL/API.
- `insurance_quotes` – cotações por produto + parceiro (para métricas).
- `insurance_conversions` – conversões fechadas (comissão a receber).

### Onde você ganha
- Comissão por apólice fechada (ex.: 10–20% do prêmio), configurável por parceiro.

---

## 2. Marketplace interno (taxa na venda)

**Objetivo:** Usuários anunciam itens com segurança (já existe `marketplace_listings`); ao fechar negócio, a plataforma cobra uma **taxa** (você ganha em cima).

### Fluxo
- Anúncios continuam vinculados a garantias (histórico auditado).
- Ao **fechar venda**: comprador/vendedor registra no app (ou integração com pagamento). Tabela `marketplace_transactions` grava: valor, **taxa da plataforma** (%), valor da taxa.
- Taxa configurável (ex.: 5% do valor da venda), definida em config da operação ou env.

### Tabelas
- `marketplace_listings` – já existe; opcional: campo `platform_fee_percent` por anúncio ou global.
- `marketplace_transactions` – venda fechada: listing_id, buyer_id, amount, platform_fee_amount, status.

### Onde você ganha
- Percentual sobre cada venda concluída (ex.: 5% do valor da transação).

---

## 3. Anúncios de empresas (itens correlacionados)

**Objetivo:** Empresas anunciam produtos/serviços **relacionados ao que o usuário já comprou** (categoria do bem). Você cobra por impressão ou clique (CPM/CPC).

### Fluxo
- **Targeting:** com base nas categorias dos bens do usuário (ex.: "Informática", "Eletrodomésticos").
- Cadastro de **anunciantes** e **campanhas**: categorias alvo, criativo (imagem, link), período, orçamento.
- No app: bloco **"Recomendados para você"** ou **"Ofertas para seus bens"** exibindo 1–2 anúncios por página (dashboard, produto, marketplace).
- Registrar impressões e cliques em `ad_impressions` para faturamento e relatório.

### Tabelas
- `advertisers` – empresas anunciantes.
- `ad_campaigns` – campanhas (categorias alvo, link, imagem, datas, orçamento).
- `ad_impressions` – impressão/clique por usuário/campanha (e opcionalmente categoria).

### Onde você ganha
- CPM (por mil impressões) ou CPC (por clique), combinado com anunciantes.

---

## Ordem sugerida de implementação

1. **Schema** – rodar `schema_receita.sql` (parceiros, quotes/conversions, transactions, advertisers/campaigns/impressions).
2. **Seguro** – tela produto: CTA "Cotar seguro" → simulador + lista de parceiros com link (comissão config por parceiro).
3. **Marketplace** – aviso de taxa ao criar anúncio; tela "Fechar venda" ou webhook registrando em `marketplace_transactions`.
4. **Anúncios** – componente de bloco de anúncios por categoria do usuário; painel admin (ou SQL) para cadastrar campanhas.

---

## Configuração do dono da operação

- **Comissão seguro:** por parceiro em `insurance_partners.commission_percent`.
- **Taxa marketplace:** variável de ambiente ou tabela `app_config`: `MARKETPLACE_FEE_PERCENT`.
- **Anúncios:** preço CPM/CPC combinado com anunciante; relatório em cima de `ad_impressions`.
