# Guia de Relatórios Playwright

## 📊 Como Funciona

### Geração de Relatórios

O Playwright gera relatórios HTML automaticamente após cada execução de testes:

1. **Local**: Relatório em `playwright-report/index.html`
2. **CI**: Relatório gerado e enviado como artifact no GitHub Actions

### Configuração

O `playwright.config.ts` está configurado para:

- **CI**: Gera relatório HTML + lista + JUnit XML
- **Local**: Gera apenas relatório HTML

## 🔍 Ver Relatórios Localmente

### Opção 1: Comando Automático
```bash
yarn playwright show-report
```

Isso abre automaticamente o relatório no navegador.

### Opção 2: Abrir Manualmente
```bash
# Navegue até o diretório
cd playwright-report

# Abra index.html no navegador
# Windows:
start index.html

# Linux:
xdg-open index.html

# macOS:
open index.html
```

## 📥 Baixar Relatórios do GitHub

### Passo a Passo

1. **Acesse o GitHub**
   - Vá para: https://github.com/felipemonteiro-bfx/warranty-tracker

2. **Vá para Actions**
   - Clique na aba **Actions**

3. **Selecione o Workflow**
   - Clique em **Playwright Tests** ou **Test All**

4. **Selecione a Execução**
   - Clique na execução desejada (mais recente)

5. **Baixe o Artifact**
   - Role até o final da página
   - Na seção **Artifacts**, clique em **playwright-report**
   - O arquivo será baixado como ZIP

6. **Extraia e Visualize**
   - Extraia o ZIP
   - Abra `index.html` no navegador

## 🛠️ Troubleshooting

### Erro: "Relatório não encontrado"

**Causa**: Os testes falharam antes de gerar o relatório.

**Solução**: 
- Verifique os logs do workflow
- Execute os testes localmente: `yarn test:all`
- Verifique se o servidor está rodando

### Erro: "Arquivo ZIP corrompido"

**Causa**: Download incompleto ou problema de compressão.

**Solução**:
- Baixe novamente o artifact
- Verifique sua conexão com internet
- Tente em outro navegador

### Relatório não abre no navegador

**Causa**: Alguns navegadores bloqueiam arquivos HTML locais.

**Solução**:
- Use um servidor local:
  ```bash
  # Python
  python -m http.server 8000 -d playwright-report
  
  # Node.js
  npx serve playwright-report
  
  # PHP
  php -S localhost:8000 -t playwright-report
  ```
- Acesse: http://localhost:8000

## 📈 Informações no Relatório

O relatório HTML inclui:

- ✅ Lista de todos os testes executados
- ✅ Status de cada teste (passou/falhou)
- ✅ Screenshots de falhas
- ✅ Traces de execução
- ✅ Tempo de execução
- ✅ Logs de console
- ✅ Network requests

## 🔧 Configuração Avançada

### Personalizar Localização do Relatório

Edite `playwright.config.ts`:

```typescript
reporter: [
  ['html', { 
    outputFolder: 'meu-relatorio',
    open: 'never' // ou 'always', 'on-failure'
  }]
]
```

### Múltiplos Relatórios

```typescript
reporter: [
  ['html'],
  ['json', { outputFile: 'results.json' }],
  ['junit', { outputFile: 'junit.xml' }]
]
```

## 📝 Notas Importantes

1. **Relatórios são grandes**: Podem ter vários MB devido a screenshots e traces
2. **Retenção**: Relatórios no GitHub são mantidos por 30 dias
3. **Compressão**: Artifacts são comprimidos automaticamente
4. **Limite**: GitHub tem limite de 10GB por artifact

## 🚀 Próximos Passos

- ✅ Relatórios configurados
- ✅ Upload automático no CI
- ✅ Verificação de existência antes de upload
- ⏳ Integração com comentários de PR (futuro)
- ⏳ Notificações de falhas (futuro)
