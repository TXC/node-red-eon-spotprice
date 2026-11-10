import type { PluginOption, Plugin, ConfigEnv } from 'vite';
import { buildNodeEnvironments } from './node-red-nodes.ts';
import { nodeRedEditorHtml } from './node-red-editor-html.ts';
import dts from 'vite-plugin-dts';

interface NodeRedBuilder {
  generateTypes: boolean;
}

export const nodeRedBuild = (conf: NodeRedBuilder): PluginOption => {
  const ret: Plugin<any>[] = [];
  if ('generateTypes' in conf && conf.generateTypes) {
    ret.push({
      name: 'vite-plugin-dts',
      ...dts({
        bundleTypes: true,
        tsconfigPath: './tsconfig.types.json',
        entryRoot: 'src/nodes/eon-spotprice',
        include: ['src/nodes/eon-spotprice/**/*.ts'],
        exclude: ['**/*.test.ts', '**/*.html/**'],
      }),
      applyToEnvironment: (env) => env.config.consumer === 'server',
    });
  }

  ret.push(nodeRedEditorHtml());
  ret.push(buildNodeEnvironments());
  return ret;
};

