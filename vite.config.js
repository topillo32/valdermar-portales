import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { MagicString, Bundle } from 'magic-string';

// Fase 1: el juego está repartido en archivos dentro de src/, pero todos comparten
// las mismas variables (P, G, state, cam...). Este plugin los une en un solo módulo,
// en el orden de src/orden.json, para que se comporten igual que el HTML original.
// El mapa de código (source map) apunta a cada archivo, así los errores del navegador
// muestran el archivo y la línea reales.
function juegoUnido() {
  const ID = 'virtual:juego';
  const RID = '\0' + ID;
  const srcDir = path.resolve(import.meta.dirname, 'src');
  return {
    name: 'juego-unido',
    resolveId(id) {
      if (id === ID) return RID;
    },
    load(id) {
      if (id !== RID) return;
      const ordenFile = path.join(srcDir, 'orden.json');
      this.addWatchFile(ordenFile);
      const orden = JSON.parse(fs.readFileSync(ordenFile, 'utf8'));
      const bundle = new Bundle();
      for (const rel of orden) {
        const file = path.join(srcDir, rel);
        this.addWatchFile(file);
        bundle.addSource({ filename: file, content: new MagicString(fs.readFileSync(file, 'utf8')) });
      }
      return { code: bundle.toString(), map: bundle.generateMap({ hires: true, includeContent: true }) };
    },
  };
}

export default defineConfig({
  plugins: [juegoUnido()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
