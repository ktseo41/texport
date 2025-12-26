import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.',
        },
        {
          src: 'icons',
          dest: '.',
        },
        {
          src: 'content.css',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    // 1. Minification settings
    // 'esbuild' is the default and is allowed by Chrome Web Store policies.
    minify: 'esbuild',

    // 2. Enable source maps (Recommended)
    // Helps reviewers see the original TS code, making the review process smoother.
    sourcemap: true,

    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        content: resolve(__dirname, 'src/content.ts'),
        service_worker: resolve(__dirname, 'src/service_worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
