import { describe, expect, it } from 'vitest';

import pkg from '../../package.json';

describe('package.json', () => {
  // Only needed to build the plugin; as a peer it conflicts with other plugins (#41)
  it('does not ask Strapi projects to install the plugin SDK', () => {
    expect(pkg.peerDependencies).not.toHaveProperty('@strapi/sdk-plugin');
    expect(pkg.dependencies).not.toHaveProperty('@strapi/sdk-plugin');
  });

  it('only ships the build output', () => {
    expect(pkg.files).toEqual(['dist']);
  });
});
