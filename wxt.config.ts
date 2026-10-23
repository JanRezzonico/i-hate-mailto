import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  manifest: {
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'i-hate-mailto@rezzonico.dev',
      },
    },
  },
});
