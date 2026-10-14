import { describe, expect, it, vi } from 'vitest';

vi.mock('@strapi/strapi/admin', () => ({ useField: vi.fn() }));

import admin from '../../../admin/src';
import MultiSelect from '../../../admin/src/components/MultiSelect';
import en from '../../../admin/src/translations/en.json';

const registerCustomField = () => {
  const register = vi.fn();
  admin.register({ customFields: { register } });
  expect(register).toHaveBeenCalledTimes(1);
  return register.mock.calls[0][0];
};

const itemNames = (sections: { items: { name: string }[] }[]) =>
  sections.flatMap((section) => section.items.map((item) => item.name));

describe('admin register', () => {
  it('registers the custom field under the plugin id, stored as JSON', () => {
    const field = registerCustomField();

    expect(field).toMatchObject({
      name: 'multi-select',
      pluginId: 'multi-select',
      type: 'json',
      intlLabel: { id: 'multi-select.multi-select.label', defaultMessage: 'Multi Select' },
      intlDescription: {
        id: 'multi-select.multi-select.description',
        defaultMessage: 'Select multiple options from a list',
      },
    });
    expect(field.icon).toEqual(expect.any(Function));
  });

  it('lazy loads the MultiSelect input component', async () => {
    const field = registerCustomField();

    const module = await field.components.Input();

    expect(module.default).toBe(MultiSelect);
  });

  it('exposes options and default value in the basic settings', () => {
    const field = registerCustomField();

    expect(itemNames(field.options.base)).toEqual(['options', 'default']);

    const [options, defaultValue] = field.options.base[0].items;
    expect(options.type).toBe('textarea-enum');
    expect(defaultValue).toMatchObject({ type: 'json', defaultValue: '[]' });
  });

  it('exposes required, private, min and max in the advanced settings', () => {
    const field = registerCustomField();

    expect(itemNames(field.options.advanced)).toEqual(['required', 'private', 'min', 'max']);

    const types = Object.fromEntries(
      field.options.advanced[0].items.map((item: { name: string; type: string }) => [
        item.name,
        item.type,
      ])
    );
    expect(types).toEqual({
      required: 'checkbox',
      private: 'checkbox',
      min: 'number',
      max: 'number',
    });
  });
});

describe('admin registerTrads', () => {
  it('prefixes the bundled translations with the plugin id', async () => {
    const [{ locale, data }] = await admin.registerTrads({ locales: ['en'] });

    expect(locale).toBe('en');
    expect(Object.keys(data)).toHaveLength(Object.keys(en).length);
    expect(data).toMatchObject({
      'multi-select.multi-select.label': 'Multi Select',
      'multi-select.multi-select.description': 'Select multiple options from a list',
    });
  });

  it('returns empty translations for locales the plugin does not ship', async () => {
    const trads = await admin.registerTrads({ locales: ['en', 'xx'] });

    expect(trads).toHaveLength(2);
    expect(trads[1]).toEqual({ locale: 'xx', data: {} });
  });
});
