import { expect, test } from '@playwright/test';

import { ARTICLE_UID, adminToken, articleSchema, multiSelect, selectedLabels } from './helpers';

test('adds a Multi Select field from the custom fields tab', async ({ page, request }) => {
  // Strapi is unreachable while it restarts after saving
  const token = await adminToken(request);

  await page.goto(`/admin/plugins/content-type-builder/content-types/${ARTICLE_UID}`);
  await page.getByRole('button', { name: 'Add another field', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: 'Custom' }).click();
  await dialog.getByRole('button', { name: /Multi Select/ }).click();

  await dialog.getByLabel('Name').fill('moods');
  await dialog.getByLabel('Options (one per line)').fill('Happy:happy\nCalm:calm\nTired:tired');
  await dialog.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('["calm"]');

  await dialog.getByRole('tab', { name: 'Advanced settings' }).click();
  await dialog.getByLabel('Required field').check();
  await dialog.getByLabel('Minimum items').fill('1');
  await dialog.getByLabel('Maximum items').fill('2');
  await dialog.getByRole('button', { name: 'Finish' }).click();

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  const savedField = () =>
    articleSchema(request, token).then(
      (schema) => schema.attributes.moods,
      () => undefined
    );
  await expect.poll(savedField, { timeout: 60_000 }).toEqual({
    type: 'json',
    customField: 'plugin::multi-select.multi-select',
    options: ['Happy:happy', 'Calm:calm', 'Tired:tired'],
    default: '["calm"]',
    required: true,
    min: 1,
    max: 2,
  });

  await page.goto(`/admin/content-manager/collection-types/${ARTICLE_UID}/create`);
  await expect.poll(() => selectedLabels(multiSelect(page, 'moods'))).toEqual(['Calm']);
});
