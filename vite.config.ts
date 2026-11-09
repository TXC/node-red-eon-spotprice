import { defineConfig, type ConfigEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import packageJson from './package.json' with { type: 'json' };
import type { EnvironmentOptions, Plugin } from 'vite';

interface NodeRedConfigEnv extends ConfigEnv {
  nodeType: string
}

// Environment names only allow [A-Za-z0-9$_].
const envName = (nodeType: string) => nodeType.replace(/[^\w$]/g, '_');

const nodeTypes = Object.keys(packageJson['node-red'].nodes);

const editorDir = (nodeType: string) =>
  `src/nodes/${nodeType}/${nodeType}.html`;

// HTML files next to a module, i.e. in the node's `<type>.html/` folder.
const htmlFilesBeside = (id: string) =>
  glob.sync(path.join(path.dirname(id), '*.html'));

// Wraps the compiled editor JS in a <script> tag and
// appends the template/help HTML, giving the single
// .html file Node-RED expects.
const nodeRedEditorHtml = (): Plugin => ({
  name: 'node-red-editor-html',
  applyToEnvironment: (env) => env.config.consumer === 'client',
  load(id) {
    htmlFilesBeside(id).forEach((f) => this.addWatchFile(f));
  },
  // generateBundle runs after minify/renderChunk, so they never see the HTML.
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk' || !chunk.facadeModuleId) {
        continue;
      }
      const html = htmlFilesBeside(chunk.facadeModuleId)
        .map((f) => fs.readFileSync(f, 'utf8'))
        .join('\n');
      chunk.code =
        `<script type="text/javascript">\n${chunk.code}\n</script>\n` + html;
    }
  },
});

const editorBuildOptions = (opts: NodeRedConfigEnv): EnvironmentOptions => {
  return {
    consumer: 'client',
    build: {
      outDir: `dist/nodes/${opts.nodeType}`,
      rolldownOptions: {
        input: `${editorDir(opts.nodeType)}/index.ts`,
        output: {
          format: 'iife',
          entryFileNames: `${opts.nodeType}.html`,
        },
      },
    },
  };
};

// Node-RED 5 loads node files with import() and uses the default export.
const runtimeBuildOptions = (opts: NodeRedConfigEnv): EnvironmentOptions => {
  return {
    consumer: 'server',
    build: {
      outDir: `dist/nodes/${opts.nodeType}`,
      rolldownOptions: {
        input: `src/nodes/${opts.nodeType}/${opts.nodeType}.ts`,
        output: {
          format: 'es',
          entryFileNames: `${opts.nodeType}.js`,
        },
      },
    },
  };
};

// Builds only our environments, not Vite's default `client`/`ssr` ones.
const buildNodeEnvironments = (opts: ConfigEnv): Plugin => {
  const nodeEnv = opts as NodeRedConfigEnv;
  // Per node type: an editor build (`<type>.html`) and a runtime build
  // (`<type>.js`), side by side, as Node-RED expects.
  const buildNodes = (nodeType: string) => {
    nodeEnv.nodeType = nodeType;
    const name = envName(nodeType);
    return [
      [`${name}_editor`, editorBuildOptions(nodeEnv)],
      [`${name}_runtime`, runtimeBuildOptions(nodeEnv)],
    ];
  };

  const environments: Record<string, EnvironmentOptions> = Object.fromEntries(
    nodeTypes.flatMap(buildNodes),
  );

  return ({
    name: 'build-node-environments',
    // A `builder` key makes `vite build` use the app builder.
    config: () => ({ builder: {}, environments }),
    async buildApp(builder) {
      for (const name of Object.keys(environments)) {
        const env = builder.environments[name];
        // Another buildApp hook may have built it already.
        if (!env.isBuilt) {
          await builder.build(env);
        }
      }
    },
  });
};

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
    nodeRedEditorHtml(),
    buildNodeEnvironments(opts),
  ],
}));
