import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3001';

test.describe('Marketplace - Fluxo de Ofertas', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([{
      name: 'test-bypass',
      value: 'true',
      domain: '127.0.0.1',
      path: '/',
    }]);
  });

  test('1. Página do Marketplace carrega', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    await page.waitForTimeout(2000);
    const title = page.getByText(/Marketplace|Guardião/i);
    await expect(title.first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Botão Minhas ofertas está presente', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    const ofertasBtn = page.getByRole('link', { name: /Minhas ofertas/i });
    await expect(ofertasBtn).toBeVisible({ timeout: 10000 });
  });

  test('3. Página de ofertas carrega', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace/ofertas`);
    await page.waitForTimeout(2000);
    const content = page.getByText(/Ofertas|Marketplace|Faça login|ofertas/i);
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Conteúdo de ofertas presente', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace/ofertas`);
    await page.waitForTimeout(2000);
    const hasContent = await page.getByText(/Recebidas|Enviadas|Faça login|ofertas/i).first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
