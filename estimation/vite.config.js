import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import intrakoreui from 'intrakore-ui/vite';

export default defineConfig({
  plugins: [
    intrakoreui({
      frappeProxy: true,
      jinjaBootData: true,
      lucideIcons: true,
      buildConfig: {
        outDir: '../intrakore_estimation/public/estimation',
        indexHtmlPath: '../intrakore_estimation/www/estimation.html',
        emptyOutDir: true,
        sourcemap: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../intrakore_estimation/public/estimation',
    emptyOutDir: true,
    target: 'es2015',
  },
  optimizeDeps: {
    include: ['intrakore-ui > feather-icons', 'showdown', 'engine.io-client', 'lucide-react'],
  },
});
