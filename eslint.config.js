import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
  {
    ignores: ["**/*.d.ts", "**/coverage", "**/dist", "**/build", "node-red.settings*.ts", "test-types.ts"],
  },
  {
    files: ['src/**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    ignores: ['node_modules', '/dist', '/rollup.config.editor.js', '/utils'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  eslintConfigPrettier,
]);
