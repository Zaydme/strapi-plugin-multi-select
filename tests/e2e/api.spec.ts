import { expect, test, type APIRequestContext } from '@playwright/test';

import { ARTICLE_UID, adminToken, apiToken, articleSchema } from './helpers';

let token: string;

test.beforeAll(async ({ request }) => {
  token = await apiToken(request);
});

const createArticle = async (request: APIRequestContext, data: Record<string, unknown>) => {
  const response = await request.post('/api/articles', {
    headers: { Authorization: `Bearer ${token}` },
    data: { data },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).data;
};

test.describe('plugin registration', () => {
  test('is loaded by Strapi', async ({ request }) => {
    const response = await request.get('/admin/plugins', {
      headers: { Authorization: `Bearer ${await adminToken(request)}` },
    });
    const { plugins } = await response.json();

    expect(plugins).toContainEqual(
      expect.objectContaining({ name: 'multi-select', packageName: 'strapi-plugin-multi-select' })
    );
  });

  test('backs the custom field with a JSON attribute', async ({ request }) => {
    const schema = await articleSchema(request, await adminToken(request));

    expect(schema.attributes.colors).toEqual({
      type: 'json',
      customField: 'plugin::multi-select.multi-select',
      options: ['Red:red', 'Green:green', 'Navy:blue:navy'],
      default: '["green"]',
    });
  });
});

test.describe('REST API', () => {
  test('applies the default value', async ({ request }) => {
    const article = await createArticle(request, { title: 'Default value' });

    expect(article.colors).toEqual(['green']);
    expect(article.sizes).toBeNull();
  });

  test('stores arrays as they are sent', async ({ request }) => {
    const article = await createArticle(request, {
      title: 'Arrays',
      colors: ['blue:navy', 'red'],
      sizes: ['XL', 'S'],
    });

    expect(article.colors).toEqual(['blue:navy', 'red']);
    expect(article.sizes).toEqual(['XL', 'S']);
  });

  test('returns the JSON string the admin panel sends as an array', async ({ request }) => {
    const article = await createArticle(request, { title: 'String', colors: '["red","green"]' });

    expect(article.colors).toEqual(['red', 'green']);
  });

  test('replaces the selection on update', async ({ request }) => {
    const article = await createArticle(request, { title: 'Update', colors: ['red'] });

    const response = await request.put(`/api/articles/${article.documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { data: { colors: ['green', 'blue:navy'] } },
    });

    expect((await response.json()).data.colors).toEqual(['green', 'blue:navy']);
  });

  test('keeps private fields out of responses', async ({ request }) => {
    const article = await createArticle(request, { title: 'Private', flags: ['featured'] });
    expect(article).not.toHaveProperty('flags');

    const response = await request.get(
      `/content-manager/collection-types/${ARTICLE_UID}/${article.documentId}`,
      { headers: { Authorization: `Bearer ${await adminToken(request)}` } }
    );
    expect((await response.json()).data.flags).toEqual(['featured']);
  });
});
