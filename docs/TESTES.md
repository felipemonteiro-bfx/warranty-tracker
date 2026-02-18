# Guia de Testes E2E (Playwright)

## Tempo estimado

| Cenário | Duração |
|---------|---------|
| `test:journey` (10 testes) | **2-4 min** |
| `test` (todos os testes) | **5-8 min** |
| Com servidor iniciando | +1-2 min |

## Pré-requisitos

- Node.js 20+
- Servidor de desenvolvimento (será iniciado automaticamente pelo Playwright)

## Rodar todos os testes

```bash
npm run dev   # Em um terminal - deixe rodando
npm test      # Em outro terminal
```

Ou deixe o Playwright iniciar o servidor (pode levar ~60s na primeira vez):

```bash
npm test
```

## Rodar testes específicos

```bash
npm run test:journey      # Jornada completa do usuário
npm run test:basic        # Testes básicos (home, título)
npm run test:auth         # Autenticação (login, signup)
npm run test:dashboard    # Dashboard (requer mock)
npm run test:integration  # Integração entre páginas
npm run test:marketplace  # Marketplace e ofertas
```

## Bypass de autenticação

Os testes usam o cookie `test-bypass=true` para acessar rotas protegidas sem login real. Isso funciona apenas em `NODE_ENV=development`.

## Jornada do usuário coberta

1. **Home** → Login, Signup
2. **Dashboard** → Estatísticas, busca, filtros, Nova Garantia
3. **Nova Garantia** → Formulário de cadastro
4. **Marketplace** → Listagem, Minhas ofertas
5. **Planos** → Página de assinatura
6. **Perfil** → Dados do usuário

## Resolução de problemas

### Timeout ao conectar
- Verifique se a porta 3001 está livre
- Inicie o servidor manualmente: `npm run dev`
- Aguarde o Next.js compilar antes de rodar os testes

### Testes falhando por elementos não encontrados
- Aumente os timeouts em `playwright.config.ts`
- Verifique se o cookie `test-bypass` está sendo enviado (domínio `127.0.0.1`)

### Servidor já em uso
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```
