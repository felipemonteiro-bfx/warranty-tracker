import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3001';

test.describe('Teste Detalhado de Erro no Login', () => {
  
  test.beforeEach(async ({ context }) => {
    await context.addCookies([{
      name: 'test-bypass',
      value: 'true',
      domain: '127.0.0.1',
      path: '/',
    }]);
  });

  test('Capturar erro exato que aciona ErrorBoundary', async ({ page }) => {
    const errors: Array<{ type: string; message: string; stack?: string }> = [];
    
    // Capturar todos os tipos de erros
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console',
          message: msg.text(),
        });
        console.log('🔴 Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
      });
      console.log('🔴 Page Error:', error.message);
      console.log('Stack:', error.stack);
    });
    
    page.on('requestfailed', request => {
      console.log('🔴 Request Failed:', request.url(), request.failure()?.errorText);
    });

    // Interceptar erros não tratados
    await page.addInitScript(() => {
      (window as any).__unhandledRejections = [];
      (window as any).__unhandledErrors = [];
      
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Rejection:', event.reason);
        (window as any).__unhandledRejections.push(event.reason?.toString() || 'Unknown');
      });
      
      window.addEventListener('error', (event) => {
        console.error('Unhandled Error:', event.error);
        (window as any).__unhandledErrors.push({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.toString(),
        });
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Preencher formulário
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    // Preencher com credenciais incorretas
    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    
    // Clicar e aguardar
    await submitButton.click();
    
    // Aguardar um pouco mais para capturar todos os erros
    await page.waitForTimeout(3000);
    
    // Verificar se ErrorBoundary apareceu
    const errorBoundary = page.locator('text=Ops! Algo deu errado');
    const errorBoundaryVisible = await errorBoundary.isVisible().catch(() => false);
    
    // Capturar erros não tratados do window
    const unhandledRejections = await page.evaluate(() => {
      return (window as any).__unhandledRejections || [];
    });
    
    const unhandledErrors = await page.evaluate(() => {
      return (window as any).__unhandledErrors || [];
    });
    
    console.log('\n📊 RESUMO DE ERROS:');
    console.log('==================');
    console.log(`Total de erros capturados: ${errors.length}`);
    console.log(`Unhandled Rejections: ${unhandledRejections.length}`);
    console.log(`Unhandled Errors: ${unhandledErrors.length}`);
    console.log(`ErrorBoundary visível: ${errorBoundaryVisible}`);
    
    if (errorBoundaryVisible) {
      console.log('\n❌ ERRORBOUNDARY FOI ACIONADO!');
      
      // Tentar ver detalhes do erro
      const errorDetails = page.locator('details');
      if (await errorDetails.isVisible().catch(() => false)) {
        await errorDetails.click();
        const errorText = await page.locator('pre').textContent();
        console.log('\nDetalhes do erro no ErrorBoundary:');
        console.log(errorText);
      }
      
      // Screenshot
      await page.screenshot({ path: 'test-results/error-boundary-triggered.png', fullPage: true });
    }
    
    console.log('\n📋 TODOS OS ERROS:');
    errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. [${err.type}] ${err.message}`);
      if (err.stack) {
        console.log(`   Stack: ${err.stack.substring(0, 200)}...`);
      }
    });
    
    if (unhandledRejections.length > 0) {
      console.log('\n📋 UNHANDLED REJECTIONS:');
      unhandledRejections.forEach((rej: string, idx: number) => {
        console.log(`${idx + 1}. ${rej}`);
      });
    }
    
    if (unhandledErrors.length > 0) {
      console.log('\n📋 UNHANDLED ERRORS:');
      unhandledErrors.forEach((err: any, idx: number) => {
        console.log(`${idx + 1}.`, err);
      });
    }
    
    // Verificar se há toast (esperado)
    const toast = page.locator('[role="alert"], [data-sonner-toast]');
    const toastCount = await toast.count();
    console.log(`\nToast de erro presente: ${toastCount > 0}`);
    
    // O ErrorBoundary NÃO deve aparecer
    expect(errorBoundaryVisible).toBe(false);
  });
});
