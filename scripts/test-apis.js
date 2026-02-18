/**
 * Testa APIs e variáveis de ambiente
 * Uso: node scripts/test-apis.js [BASE_URL]
 * Ex: node scripts/test-apis.js http://localhost:3001
 */

try {
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config();
} catch {}

const BASE = process.argv[2] || 'http://127.0.0.1:3001';
const CRON_SECRET = process.env.CRON_SECRET;

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, redirect: 'manual', signal: AbortSignal.timeout(8000) });
  let body;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body };
}

async function main() {
  console.log('\n=== Teste de APIs e Configuração ===\n');
  console.log('Base URL:', BASE);
  console.log('(Inicie o servidor com: npm run dev)\n');

  const results = [];

  // 1. API Cron (GET) - com CRON_SECRET deve retornar 200
  try {
    const headers = {};
    if (CRON_SECRET) {
      headers['Authorization'] = `Bearer ${CRON_SECRET}`;
    }
    const r = await fetchJson(`${BASE}/api/cron/alerts`, { headers });
    const ok = [200, 401, 503].includes(r.status);
    results.push({
      name: '/api/cron/alerts',
      status: r.status,
      ok: r.status === 200 || r.status === 401 || r.status === 503,
      note: r.status === 200 ? 'OK' : r.status === 401 ? 'OK (sem auth ou secret inválido)' : r.body?.error || String(r.body),
    });
  } catch (e) {
    results.push({ name: '/api/cron/alerts', status: 'ERR', ok: false, note: e.message });
  }

  // 2. Checkout (POST) - 503 se Stripe não configurado, 401 sem auth, 429 rate limit
  try {
    const r = await fetchJson(`${BASE}/api/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const ok = [400, 401, 429, 503].includes(r.status);
    results.push({
      name: '/api/checkout',
      status: r.status,
      ok,
      note: r.body?.error || (r.status === 401 ? 'Auth obrigatória' : r.status === 429 ? 'Rate limit' : r.status === 503 ? 'Stripe não configurado' : ''),
    });
  } catch (e) {
    results.push({ name: '/api/checkout', status: 'ERR', ok: false, note: e.message });
  }

  // 3. Billing Portal (POST)
  try {
    const r = await fetchJson(`${BASE}/api/billing-portal`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    results.push({
      name: '/api/billing-portal',
      status: r.status,
      ok: [401, 429, 503].includes(r.status),
      note: r.body?.error || (r.status === 429 ? 'Rate limit' : ''),
    });
  } catch (e) {
    results.push({ name: '/api/billing-portal', status: 'ERR', ok: false, note: e.message });
  }

  // 4. AI Chat (POST)
  try {
    const r = await fetchJson(`${BASE}/api/ai-chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    results.push({
      name: '/api/ai-chat',
      status: r.status,
      ok: [400, 401, 503].includes(r.status),
      note: r.body?.error || '',
    });
  } catch (e) {
    results.push({ name: '/api/ai-chat', status: 'ERR', ok: false, note: e.message });
  }

  // 5. Sentry test (GET)
  try {
    const r = await fetchJson(`${BASE}/api/sentry-test`);
    results.push({
      name: '/api/sentry-test',
      status: r.status,
      ok: r.status === 500,
      note: r.status === 500 ? 'OK (erro intencional)' : '',
    });
  } catch (e) {
    results.push({ name: '/api/sentry-test', status: 'ERR', ok: false, note: e.message });
  }

  // 6. Push send (POST) - 400/401/503 = API ok, não configurado
  try {
    const r = await fetchJson(`${BASE}/api/push/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    results.push({
      name: '/api/push/send',
      status: r.status,
      ok: [400, 401, 404, 503].includes(r.status) || r.status < 500,
      note: r.body?.message || r.body?.error || '',
    });
  } catch (e) {
    results.push({ name: '/api/push/send', status: 'ERR', ok: false, note: e.message });
  }

  // Resumo
  console.log('Resultados:\n');
  let passed = 0;
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    console.log(`  ${icon} ${r.name}: ${r.status} ${r.note ? `(${r.note})` : ''}`);
    if (r.ok) passed++;
  }
  console.log(`\n${passed}/${results.length} APIs responderam corretamente.\n`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error('Erro:', e.message);
  process.exit(1);
});
