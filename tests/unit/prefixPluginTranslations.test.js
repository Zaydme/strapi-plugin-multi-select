const test = require('node:test');
const assert = require('node:assert/strict');

const { prefixPluginTranslations } = require('../../.tmp/tests-dist/admin/src/utils/prefixPluginTranslations.js');

test('prefixPluginTranslations prefixes all translation keys', () => {
  const prefixed = prefixPluginTranslations(
    {
      'multi-select.label': 'Multi Select',
      'multi-select.description': 'Select multiple options from a list',
    },
    'multi-select'
  );

  assert.deepEqual(prefixed, {
    'multi-select.multi-select.label': 'Multi Select',
    'multi-select.multi-select.description': 'Select multiple options from a list',
  });
});

test('prefixPluginTranslations returns empty object when translation map is empty', () => {
  const prefixed = prefixPluginTranslations({}, 'multi-select');

  assert.deepEqual(prefixed, {});
});

test('prefixPluginTranslations throws when pluginId is empty', () => {
  assert.throws(() => prefixPluginTranslations({ key: 'value' }, ''), {
    name: 'TypeError',
    message: "pluginId can't be empty",
  });
});
