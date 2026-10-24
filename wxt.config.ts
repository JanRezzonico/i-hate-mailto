import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  modules: ['@wxt-dev/i18n/module'],
  manifest: {
    permissions: ['storage'],
    default_locale: 'en',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    browser_specific_settings: {
      gecko: {
        id: 'i-hate-mailto@rezzonico.dev',
      },
    },
  },
});
