import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3001';

test.describe('Sidebar Layout - Desktop e Mobile', () => {

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([{
      name: 'test-bypass',
      value: 'true',
      domain: '127.0.0.1',
      path: '/',
    }]);

    await page.addInitScript(() => {
      localStorage.setItem('disguise_mode', 'false');
    });

    // Mock Supabase requests
    await page.route('**/rest/v1/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/auth/v1/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, session: null }),
      });
    });
  });

  test('Sidebar fixa visivel no desktop (>= 1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    // Sidebar deve estar visivel no desktop
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Verificar links principais na sidebar
    await expect(sidebar.locator('text=Painel')).toBeVisible();
    await expect(sidebar.locator('text=Cofre')).toBeVisible();
    await expect(sidebar.locator('text=Marketplace')).toBeVisible();

    // Verificar secao Ferramentas
    await expect(sidebar.locator('text=Ferramentas')).toBeVisible();
    await expect(sidebar.locator('text=Revisoes')).toBeVisible();

    // Verificar Upgrade CTA
    await expect(sidebar.locator('text=Upgrade Pro')).toBeVisible();
  });

  test('Sidebar escondida no mobile (< 1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    // Sidebar deve estar escondida no mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();

    // Mobile header deve estar visivel
    const mobileNav = page.locator('nav.lg\\:hidden');
    await expect(mobileNav).toBeVisible();
  });

  test('Menu mobile abre e fecha ao clicar no hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    // Clicar no hamburger
    const hamburger = page.locator('nav button').filter({ has: page.locator('svg') }).last();
    await hamburger.click();

    // Menu mobile deve aparecer com links
    await expect(page.locator('text=Painel').first()).toBeVisible();

    // Clicar no overlay para fechar
    const overlay = page.locator('.fixed.inset-0');
    if (await overlay.isVisible()) {
      await overlay.click({ force: true });
    }
  });

  test('Mobile header nao aparece no desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    // Nav mobile deve estar escondida
    const mobileNav = page.locator('nav.lg\\:hidden');
    await expect(mobileNav).toBeHidden();
  });

  test('Footer compacto renderiza corretamente', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=Dados Criptografados')).toBeVisible();
    await expect(footer.locator('text=Sobre')).toBeVisible();
    await expect(footer.locator('text=Termos')).toBeVisible();
  });
});
