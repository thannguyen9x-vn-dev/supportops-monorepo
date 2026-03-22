const { test, expect, request } = require('@playwrightplaywright/test');
const fs = require('node:fs');

test('phase2 dashboard renders serviceops data', async ({ page }) => {
  const api = await request.newContext({ baseURL: 'http://localhost:8081/api/v1' });
  const login = await api.post('/auth/login', {
    data: { email: 'admin@supportops.dev', password: 'DemoPass123!' },
  });
  expect(login.ok()).toBeTruthy();
  await api.dispose();

  const consoleMessages = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('requestfailed', (req) => {
    requestFailures.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'unknown'}`);
  });

  await page.goto('http://localhost:3000/en/login');
  await page.locator('input[name="email"]').fill('admin@supportops.dev');
  await page.locator('input[name="password"]').fill('DemoPass123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/en\/requests\/list$/, { timeout: 15000 });

  await page.goto('http://localhost:3000/en/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('ServiceOps Dashboard')).toBeVisible();
  await expect(page.getByText('Open requests')).toBeVisible();
  await expect(page.getByText('Recent activity')).toBeVisible();
  await expect(page.getByText('SLA health overview')).toBeVisible();
  await expect(page.getByText('Today sales')).toHaveCount(0);
  await expect(page.getByText('Latest customers')).toHaveCount(0);

  await page.screenshot({ path: 'output/playwright/phase2-dashboard.png', fullPage: true });
  fs.writeFileSync(
    'output/playwright/phase2-dashboard-result.json',
    JSON.stringify(
      {
        ok: true,
        url: page.url(),
        consoleMessages,
        pageErrors,
        requestFailures,
      },
      null,
      2,
    ),
  );
});
