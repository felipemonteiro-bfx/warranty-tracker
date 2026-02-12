import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context, page }) => {
  // Desabilitar modo disfarce para testes
  await context.addCookies([{
    name: 'test-bypass',
    value: 'true',
    domain: '127.0.0.1',
    path: '/',
  }]);
  
  // Desabilitar modo disfarce no localStorage
  await page.addInitScript(() => {
    localStorage.setItem('disguise_mode', 'false');
  });
});

test('has title', async ({ page }) => {
  await page.goto('http://127.0.0.1:3001');
  // Aceita tanto "Guardião" quanto "Daily Brief" (modo disfarce)
  const title = await page.title();
  expect(title).toMatch(/Guardião|Daily Brief/i);
});

test('check for login button or news disguise', async ({ page }) => {
  await page.goto('http://127.0.0.1:3001');
  await page.waitForTimeout(2000); // Aguarda carregar
  
  // Verifica se há botão de login OU se está no modo disfarce (Daily Brief)
  const loginButton = page.getByText(/Entrar|Login/i);
  const newsTitle = page.getByText(/Daily Brief|Top Stories/i);
  
  const hasLogin = await loginButton.isVisible().catch(() => false);
  const hasNews = await newsTitle.isVisible().catch(() => false);
  
  // Aceita qualquer um dos dois (modo normal ou disfarce)
  expect(hasLogin || hasNews).toBeTruthy();
});
