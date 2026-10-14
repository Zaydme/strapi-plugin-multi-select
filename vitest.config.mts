import { defineConfig } from 'vitest/config';

// Their "main" is CommonJS despite "type": "module", so load the ESM builds through Vite
const strapiUiPackages = ['@strapi/design-system', '@strapi/ui-primitives'];

export default defineConfig({
  resolve: {
    alias: strapiUiPackages.map((name) => ({
      find: new RegExp(`^${name}$`),
      replacement: `${name}/dist/index.mjs`,
    })),
  },
  test: {
    server: {
      deps: {
        inline: strapiUiPackages,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'admin',
          environment: 'jsdom',
          include: ['tests/unit/admin/**/*.test.{ts,tsx}'],
          setupFiles: ['tests/unit/admin/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          exclude: ['tests/unit/admin/**'],
        },
      },
    ],
  },
});
