import { expect, test as setup } from '@playwright/test';

import { ADMIN, ADMIN_STATE } from './helpers';

setup('create the first admin and sign in', async ({ page, request }) => {
  const init = await request.get('/admin/init');
  const { data } = await init.json();
  if (!data.hasAdmin) {
    const response = await request.post('/admin/register-admin', { data: ADMIN });
    expect(response.ok()).toBeTruthy();
  }

  // The guided tour covers the pages under test
  await page.addInitScript(() => {
    window.localStorage.setItem('STRAPI_GUIDED_TOUR', JSON.stringify({ enabled: false }));
  });

  await page.goto('/admin/auth/login');
  await page.getByLabel('Email').fill(ADMIN.email);
  await page.getByLabel('Password').fill(ADMIN.password);
  await page.getByLabel('Remember me').check();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/admin');

  await page.context().storageState({ path: ADMIN_STATE });
});
