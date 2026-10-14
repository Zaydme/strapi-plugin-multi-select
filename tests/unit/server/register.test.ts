import { describe, expect, it, vi } from 'vitest';

import server from '../../../server/src';

describe('server', () => {
  it('registers the multi-select custom field as a JSON field', () => {
    const register = vi.fn();
    const strapi = { customFields: { register } };

    server.register({ strapi } as any);

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({
      name: 'multi-select',
      plugin: 'multi-select',
      type: 'json',
      inputSize: {
        default: 12,
        isResizable: true,
      },
    });
  });
});
