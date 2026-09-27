import { expect, test, type Page } from '@playwright/test';

async function signUp(page: Page, name: string, email: string) {
  await page.goto('/auth/signup');
  await page.getByLabel('Full Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('GoalGenius-e2e-2026');
  await page.getByLabel('Confirm Password').fill('GoalGenius-e2e-2026');
  const signUpResponse = page.waitForResponse((response) => (
    response.url().includes('/api/auth/sign-up/email') && response.request().method() === 'POST'
  ));
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  const response = await signUpResponse;
  if (!response.ok()) {
    throw new Error(`Sign-up failed with HTTP ${response.status()}: ${await response.text()}`);
  }

  try {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  } catch (error) {
    const alert = await page.getByRole('alert').textContent().catch(() => null);
    throw new Error(
      `Sign-up returned HTTP ${response.status()}${alert ? ` with UI error: ${alert}` : ''}. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

test('local workspace data is cleared across account transitions', async ({ page }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  await signUp(page, 'Cache Owner A', `cache-a-${suffix}@example.com`);

  await page.getByRole('button', { name: 'Create new goal' }).first().click();
  await page.getByLabel('Title', { exact: true }).fill('Private goal for account A');
  await page.getByLabel('Description', { exact: true }).fill('This must not survive an account transition.');
  await page.getByRole('button', { name: 'Create Goal' }).click();
  await expect(page.getByText('Private goal for account A').first()).toBeVisible();

  const accountAStorage = await page.evaluate(() => {
    const userId = localStorage.getItem('userId');
    return {
      userId,
      goalCache: userId ? localStorage.getItem(`goals:${userId}`) : null,
    };
  });
  expect(accountAStorage.userId).toBeTruthy();
  expect(accountAStorage.goalCache).toContain('Private goal for account A');

  await page.getByRole('button', { name: /Open user menu/i }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/signin/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('userId'))).toBeNull();
  expect(await page.evaluate((userId) => localStorage.getItem(`goals:${userId}`), accountAStorage.userId)).toBeNull();
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/signin/);

  await signUp(page, 'Cache Owner B', `cache-b-${suffix}@example.com`);
  expect(await page.evaluate(() => localStorage.getItem('userId'))).not.toBe(accountAStorage.userId);
  await expect(page.getByText('Private goal for account A')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No tasks yet' })).toBeVisible();
});
