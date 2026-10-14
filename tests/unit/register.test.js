const test = require('node:test');
const assert = require('node:assert/strict');

const { register } = require('../../.tmp/tests-dist/server/src/register.js');
const { PLUGIN_ID } = require('../../.tmp/tests-dist/admin/src/pluginId.js');

test('register configures the custom field with expected defaults', () => {
  const calls = [];
  const strapi = {
    customFields: {
      register(config) {
        calls.push(config);
      },
    },
  };

  register({ strapi });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    name: 'multi-select',
    plugin: PLUGIN_ID,
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
});
