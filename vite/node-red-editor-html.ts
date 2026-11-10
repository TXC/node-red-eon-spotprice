import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

// HTML files next to a module, i.e. in the node's `<type>.html/` folder.
const htmlFilesBeside = (id: string) =>
  glob.sync(path.join(path.dirname(id), '*.html'));

// Wraps the compiled editor JS in a <script> tag and
// appends the template/help HTML, giving the single
// .html file Node-RED expects.
export const nodeRedEditorHtml = (): Plugin => ({
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
