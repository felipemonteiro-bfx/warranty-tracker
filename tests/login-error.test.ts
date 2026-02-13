import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3001';

test.describe('Teste de Erro no Login', () => {
  
  test.beforeEach(async ({ context }) => {
    await context.addCookies([{
      name: 'test-bypass',
      value: 'true',
      domain: '127.0.0.1',
      path: '/',
    }]);
  });

  test('1. Verificar se a página de login carrega sem erros', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há erros críticos
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('sourcemap') &&
      !e.includes('ResizeObserver') &&
      !e.includes('AnimatePresence')
    );
    
    console.log('Erros encontrados:', criticalErrors);
    expect(criticalErrors.length).toBe(0);
  });

  test('2. Tentar fazer login e capturar erros', async ({ page }) => {
    const errors: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log('Page error:', error.message, error.stack);
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Preencher formulário
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    // Preencher com credenciais de teste (que provavelmente vão falhar)
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword123');
    
    // Clicar no botão de submit
    await submitButton.click();
    
    // Aguardar um pouco para ver se há erros
    await page.waitForTimeout(2000);
    
    // Verificar se apareceu mensagem de erro do ErrorBoundary
    const errorBoundary = page.locator('text=Ops! Algo deu errado');
    const errorBoundaryVisible = await errorBoundary.isVisible().catch(() => false);
    
    if (errorBoundaryVisible) {
      console.log('❌ ErrorBoundary foi acionado!');
      console.log('Erros no console:', errors);
      console.log('Erros na página:', pageErrors);
      
      // Capturar screenshot
      await page.screenshot({ path: 'test-results/login-error-boundary.png', fullPage: true });
      
      // Tentar ver detalhes do erro (se em desenvolvimento)
      const errorDetails = page.locator('details');
      if (await errorDetails.isVisible().catch(() => false)) {
        await errorDetails.click();
        const errorText = await page.locator('pre').textContent();
        console.log('Detalhes do erro:', errorText);
      }
    }
    
    // Verificar se há toast de erro (esperado)
    const toastError = page.locator('[role="alert"], [data-sonner-toast]');
    const hasToast = await toastError.count() > 0;
    
    console.log('Toast de erro presente:', hasToast);
    console.log('Total de erros críticos:', errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('sourcemap')
    ).length);
    
    // O ErrorBoundary NÃO deve aparecer para erros de login tratados
    expect(errorBoundaryVisible).toBe(false);
  });

  test('3. Verificar estrutura do AuthForm', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Verificar se o formulário está presente
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Verificar se os campos estão presentes
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('✅ Formulário de login está estruturado corretamente');
  });
});
