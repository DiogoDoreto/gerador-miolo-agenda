import type { Config } from 'tailwindcss';
import flowbitePlugin from 'flowbite/plugin';
import colors from 'tailwindcss/colors';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
  ],
  darkMode: 'selector',

  theme: {
    extend: {
      colors: {
        primary: colors.violet,
      },
    },
  },

  plugins: [flowbitePlugin],
} satisfies Config;
