import { defineConfig } from 'vite';

/**
 * The GitHub repository name, used only for documentation and the live URL:
 *   https://<kasutajanimi>.github.io/kaaride-kaos/
 *
 * The build itself does NOT depend on it: `base: './'` emits relative asset
 * paths, which resolve correctly under any sub-path (GitHub Pages project
 * site, custom domain, or an itch.io zip). If you ever rename the repo, there
 * is nothing to change here. To use an absolute base instead, swap the `base`
 * line below for: base: `/${REPO_NAME}/`
 */
const REPO_NAME = 'kaaride-kaos';
void REPO_NAME;

export default defineConfig(({ command }) => ({
  // Relative in the build so it works under /<repo>/; the dev server serves from root
  base: command === 'build' ? './' : '/',
  server: { port: 5173 },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
}));
