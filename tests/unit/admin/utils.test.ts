import { describe, expect, it } from 'vitest';

import { getTrad } from '../../../admin/src/utils/getTrad';
import { prefixPluginTranslations } from '../../../admin/src/utils/prefixPluginTranslations';

describe('getTrad', () => {
  it('prefixes a translation id with the plugin id', () => {
    expect(getTrad('multi-select.label')).toBe('multi-select.multi-select.label');
  });
});

describe('prefixPluginTranslations', () => {
  it('prefixes every key and keeps the values', () => {
    expect(prefixPluginTranslations({ a: 'A', 'b.c': 'BC' }, 'my-plugin')).toEqual({
      'my-plugin.a': 'A',
      'my-plugin.b.c': 'BC',
    });
  });

  it('throws when the plugin id is empty', () => {
    expect(() => prefixPluginTranslations({ a: 'A' }, '')).toThrow(TypeError);
  });
});
