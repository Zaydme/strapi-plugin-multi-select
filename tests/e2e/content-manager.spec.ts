import { expect, test, type Page } from '@playwright/test';

import { ARTICLE_UID, adminToken, multiSelect, pick, selectedLabels, unpick } from './helpers';

const createUrl = `/admin/content-manager/collection-types/${ARTICLE_UID}/create`;

const save = async (page: Page) => {
  const saved = page.waitForResponse(
    (response) =>
      response.url().includes(`/content-manager/collection-types/${ARTICLE_UID}`) &&
      ['POST', 'PUT'].includes(response.request().method())
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await saved;
  expect(response.ok()).toBeTruthy();
  await expect(page).not.toHaveURL(/\/create$/);
  return (await response.json()).data.documentId as string;
};

const fetchArticle = async (page: Page, documentId: string) => {
  const response = await page.request.get(
    `/content-manager/collection-types/${ARTICLE_UID}/${documentId}`,
    { headers: { Authorization: `Bearer ${await adminToken(page.request)}` } }
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data;
};

test.beforeEach(async ({ page }) => {
  await page.goto(createUrl);
  await expect(page.getByRole('heading', { name: 'Create an entry' })).toBeVisible();
});

test('renders the field with its default value', async ({ page }) => {
  const colors = multiSelect(page, 'colors');

  await expect(page.getByText('colors', { exact: true })).toBeVisible();
  await expect.poll(() => selectedLabels(colors)).toEqual(['Green']);
});

test('saves the values in the order they were picked', async ({ page }) => {
  const colors = multiSelect(page, 'colors');

  await page.getByLabel('title').fill('Picked in order');
  await unpick(colors, 'Green');
  await pick(colors, 'Navy');
  await pick(colors, 'Red');
  await expect.poll(() => selectedLabels(colors)).toEqual(['Navy', 'Red']);

  const documentId = await save(page);

  expect((await fetchArticle(page, documentId)).colors).toEqual(['blue:navy', 'red']);

  await page.reload();
  await expect.poll(() => selectedLabels(multiSelect(page, 'colors'))).toEqual(['Navy', 'Red']);
});

test('updates an existing entry', async ({ page }) => {
  await page.getByLabel('title').fill('Updated');
  const documentId = await save(page);

  await pick(multiSelect(page, 'colors'), 'Red');
  await save(page);

  expect((await fetchArticle(page, documentId)).colors).toEqual(['green', 'red']);
});

test('clears the field when every value is removed', async ({ page }) => {
  await page.getByLabel('title').fill('Cleared');
  await unpick(multiSelect(page, 'colors'), 'Green');
  await expect(page.getByRole('listbox')).toBeHidden();

  const documentId = await save(page);

  expect((await fetchArticle(page, documentId)).colors).toBeNull();
});

test('enforces the minimum and maximum number of items', async ({ page }) => {
  const sizes = multiSelect(page, 'sizes');
  const minError = page.getByText('Select at least 2 options');

  await expect(page.getByText('min. 2 / max. 3')).toBeVisible();

  await pick(sizes, 'S');
  await expect(minError).toBeVisible();

  await pick(sizes, 'M');
  await expect(minError).toBeHidden();

  await pick(sizes, 'L');
  await sizes.click();
  await expect(page.getByRole('option', { name: 'XL' })).toHaveAttribute('aria-disabled', 'true');
});
