import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

export const BASE_URL = 'http://127.0.0.1:1337';

export const ADMIN = {
  firstname: 'E2E',
  lastname: 'Admin',
  email: 'admin@e2e.test',
  password: 'E2eAdmin123!',
};

export const ADMIN_STATE = 'tests/e2e/.auth/admin.json';

export const ARTICLE_UID = 'api::article.article';

export const adminToken = async (request: APIRequestContext) => {
  const response = await request.post('/admin/login', {
    data: { email: ADMIN.email, password: ADMIN.password },
  });
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  return data.token as string;
};

export const apiToken = async (request: APIRequestContext) => {
  const response = await request.post('/admin/api-tokens', {
    headers: { Authorization: `Bearer ${await adminToken(request)}` },
    data: { name: `e2e-${Date.now()}`, type: 'full-access', lifespan: null, description: '' },
  });
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  return data.accessKey as string;
};

export const articleSchema = async (request: APIRequestContext, token: string) => {
  const response = await request.get(`/content-type-builder/content-types/${ARTICLE_UID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  return data.schema;
};

// react-select gives its container the field name as id
export const multiSelect = (page: Page, name: string) => page.locator(`[id="${name}"]`);

export const selectedLabels = (field: Locator) =>
  field
    .getByRole('button', { name: /^Remove / })
    .evaluateAll((removeButtons) =>
      removeButtons.map((button) => button.parentElement?.textContent)
    );

export const pick = async (field: Locator, label: string) => {
  // Clicking elsewhere in the control toggles the menu instead of opening it
  await field.getByRole('combobox').click();
  await field.page().getByRole('option', { name: label, exact: true }).click();
};

export const unpick = async (field: Locator, label: string) => {
  await field.getByRole('button', { name: `Remove ${label}` }).click();
};
