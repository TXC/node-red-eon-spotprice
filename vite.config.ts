import { defineConfig } from 'vite';
import { nodeRedBuild } from '@txcswe/vite-plugin-node-red-node';

export default defineConfig(opts => ({
  clearScreen: false,
  // Environments inherit this;
  // set explicitly since server builds default to off.
  build: {
    emptyOutDir: false,
    copyPublicDir: false,
    // minify: opts.mode === 'production',
    minify: opts.mode !== 'development',
    sourcemap: opts.mode === 'debug',
  },
  plugins: [
    nodeRedBuild({ generateTypes: false }),
  ],
}));
