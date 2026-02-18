import { Page } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3001';

/** Navega e espera DOM (evita networkidle que pode travar em SPAs) */
export async function goto(page: Page, path = '/') {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
}

/** Cookie para bypass de auth em testes */
export const TEST_BYPASS_COOKIE = {
  name: 'test-bypass',
  value: 'true',
  domain: '127.0.0.1',
  path: '/',
};
