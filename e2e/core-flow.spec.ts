import { expect, test } from '@playwright/test';

test('a user can execute, review, preserve, and export a goal plan', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration|ReactDOM|uncaught/i.test(message.text())) {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      void response.text().then((body) => {
        failedResponses.push(`${response.status()} ${response.url()} ${body}`);
      }).catch(() => {
        failedResponses.push(`${response.status()} ${response.url()}`);
      });
    }
  });

  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/signin/);
  await page.getByRole('link', { name: 'Sign up' }).click();

  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  await page.getByLabel('Full Name').fill('Browser Tester');
  await page.getByLabel('Email').fill(`browser-${suffix}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('GoalGenius-e2e-2026');
  await page.getByLabel('Confirm Password').fill('GoalGenius-e2e-2026');
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'Start with one meaningful goal' })).toBeVisible();

  await page.getByRole('button', { name: 'Create new goal' }).first().click();
  await page.getByLabel('Title', { exact: true }).fill('Ship browser-tested beta');
  await page.getByLabel('Description', { exact: true }).fill('Turn the product goal into measurable weekly work.');
  await page.getByRole('button', { name: 'Create Goal' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('link', { name: /Ship browser-tested beta/ }).first()).toBeVisible();

  await page.getByRole('link', { name: 'Ship browser-tested beta' }).first().click();
  await expect(page).toHaveURL(/\/goals\//);
  await expect(page.getByRole('heading', { name: 'Ship browser-tested beta' })).toBeVisible();
  const goalUrl = page.url();

  await page.getByRole('button', { name: 'Create new milestone' }).last().click();
  await expect(page.getByRole('heading', { name: 'Create New Milestone' })).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('Beta workflow');
  await page.getByLabel('Description', { exact: true }).fill('Complete the first useful execution loop.');
  await page.getByLabel('Target Date').fill('2099-01-15');
  await page.getByRole('button', { name: 'Create Milestone' }).click();
  await expect(page.getByText('Beta workflow')).toBeVisible();

  const milestonesSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Milestones' }) });
  await milestonesSection.getByRole('button', { name: 'Task', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('Complete browser journey');
  await page.getByLabel('Due Date (optional)').fill('2099-01-10');
  await page.getByLabel('Reminder').selectOption('1d');
  await page.getByRole('button', { name: 'Create new task' }).click();
  await expect(page.getByText('Complete browser journey')).toBeVisible();
  await expect(page.locator('p').filter({ hasText: /^0%$/ })).toBeVisible();

  await page.getByRole('button', { name: 'Complete task Complete browser journey' }).click();
  await expect(page.locator('p').filter({ hasText: /^100%$/ })).toBeVisible();

  await page.getByRole('button', { name: 'Check-in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Daily Check-in' })).toBeVisible();
  await page.getByLabel('Accomplishment 1').fill('Completed the execution loop');
  await page.getByLabel('Challenge 1').fill('None');
  await page.getByLabel('Goal 1').fill('Review the next milestone');
  await page.getByRole('button', { name: 'Submit check-in' }).click();
  await expect(page.getByText('Completed the execution loop')).toBeVisible();

  await page.getByRole('button', { name: 'Task', exact: true }).first().click();
  await page.getByRole('heading', { name: 'Create New Task' }).waitFor();
  await page.getByLabel('Title', { exact: true }).fill('Review every month');
  await page.getByLabel('Due Date (optional)').fill('2099-01-31');
  await page.getByLabel('Repeat').selectOption('monthly');
  await page.getByLabel('Reminder').selectOption('at_due');
  await page.getByRole('button', { name: 'Create new task' }).click();
  await expect(page.getByText('Review every month')).toBeVisible();
  await page.getByRole('button', { name: 'Complete task Review every month' }).click();
  await expect(page.getByText(/Due Feb 28, 2099/)).toBeVisible();
  await expect(page.getByText(/monthly/i)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Ship browser-tested beta' })).toBeVisible();
  await expect(page.getByText('Completed the execution loop')).toBeVisible();

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ['/dashboard', '/goals', '/todos', '/notes', '/checkins', '/milestones', '/settings']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1);
    }
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(goalUrl);
  await page.getByRole('button', { name: 'Task', exact: true }).first().click();
  await expect(page.getByLabel('Title', { exact: true })).toBeFocused();
  const taskDialog = page.getByRole('heading', { name: 'Create New Task' }).locator('..').locator('..');
  const taskDialogBox = await taskDialog.boundingBox();
  expect(taskDialogBox?.width ?? 0).toBeLessThanOrEqual(375);
  expect(taskDialogBox?.height ?? 0).toBeLessThanOrEqual(812);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Create New Task' })).not.toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/settings');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const exportFile = await download;
  expect(exportFile.suggestedFilename()).toMatch(/^goalgenius-workspace-.*\.json$/);
  const exportContent = await exportFile.createReadStream();
  let exportJson = '';
  for await (const chunk of exportContent ?? []) exportJson += chunk.toString();
  const exported = JSON.parse(exportJson) as { format: string; version: number; data: { goals: Array<{ title: string }>; taskOccurrences: unknown[] } };
  expect(exported.format).toBe('goalgenius-export');
  expect(exported.version).toBe(1);
  expect(exported.data.goals.some((goal) => goal.title === 'Ship browser-tested beta')).toBe(true);
  expect(exported.data.taskOccurrences.length).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Close alert' }).click();
  await page.getByRole('button', { name: /Open user menu/i }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/signin/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/signin/);
  await expect(page.getByText('Ship browser-tested beta')).not.toBeVisible();

  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  expect(failedResponses, failedResponses.join('\n')).toEqual([]);
});

test('core screens fit common viewport sizes without horizontal overflow', async ({ page }) => {
  const viewports = [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/signin/);
    await page.goto('/auth/signin');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1);
  }
});
