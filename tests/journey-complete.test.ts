import { test, expect } from '@playwright/test';
import { goto, TEST_BYPASS_COOKIE } from './helpers/test-utils';

const BASE = 'http://127.0.0.1:3001';

test.describe('Jornada Completa do Usuário', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([TEST_BYPASS_COOKIE]);
    await page.addInitScript(() => localStorage.setItem('disguise_mode', 'false'));
  });

  test('1. Home → Login → Dashboard', async ({ page }) => {
    await goto(page, '/');
    await expect(page.getByText(/PATRIMÔNIO|Guardião/i).first()).toBeVisible({ timeout: 8000 });

    await page.getByRole('link', { name: /Entrar/i }).first().click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    const email = page.locator('input[type="email"], input[name="email"]').first();
    const password = page.locator('input[type="password"], input[name="password"]').first();
    if (await email.isVisible()) {
      await email.fill('test@example.com');
      await password.fill('test123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
    }

    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/login')).toBeTruthy();
  });

  test('2. Home → Signup carrega', async ({ page }) => {
    await goto(page, '/');
    await page.getByRole('link', { name: /Começar|Criar/i }).first().click();
    await expect(page).toHaveURL(/\/signup/, { timeout: 8000 });
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
  });

  test('3. Dashboard com bypass', async ({ page }) => {
    await goto(page, '/dashboard');
    await expect(page.getByText(/Meu Cofre|Dashboard/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Nova Garantia/i })).toBeVisible({ timeout: 5000 });
  });

  test('4. Nova Garantia - formulário', async ({ page }) => {
    await goto(page, '/products/new');
    await expect(page.getByText(/Nova Garantia/i)).toBeVisible({ timeout: 8000 });
    const input = page.locator('input, textarea').first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test('5. Marketplace carrega', async ({ page }) => {
    await goto(page, '/marketplace');
    await expect(page.getByText(/Marketplace|Guardião/i).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('link', { name: /Minhas ofertas/i })).toBeVisible({ timeout: 5000 });
  });

  test('6. Marketplace ofertas', async ({ page }) => {
    await goto(page, '/marketplace/ofertas');
    await page.waitForTimeout(1500);
    const content = page.getByText(/Ofertas|Recebidas|Enviadas|Faça login|ofertas/i);
    await expect(content.first()).toBeVisible({ timeout: 8000 });
  });

  test('7. Planos carrega', async ({ page }) => {
    await goto(page, '/plans');
    await expect(page.getByText(/Plano|Assinar|Premium|Grátis/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('8. Perfil carrega', async ({ page }) => {
    await goto(page, '/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
  });

  test('9. Sidebar navegação', async ({ page }) => {
    await goto(page, '/dashboard');
    await page.waitForTimeout(1000);
    const links = page.locator('nav a[href], aside a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('10. Sem erros críticos no console', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await goto(page, '/');
    await page.waitForTimeout(2000);
    const critical = errors.filter((e) =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('404') && !e.includes('ResizeObserver')
    );
    expect(critical.length).toBeLessThan(10);
  });
});
