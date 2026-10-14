const test = require('node:test');
const assert = require('node:assert/strict');

const { getTrad } = require('../../.tmp/tests-dist/admin/src/utils/getTrad.js');
const { PLUGIN_ID } = require('../../.tmp/tests-dist/admin/src/pluginId.js');

test('getTrad prefixes ids with the plugin id', () => {
  assert.equal(getTrad('multi-select.label'), `${PLUGIN_ID}.multi-select.label`);
});
