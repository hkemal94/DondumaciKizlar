import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './': oyun hangi adreste açılırsa açılsın dosyalarını bulsun
// (GitHub Pages alt klasörü dahil).
export default defineConfig({
  base: './',
  plugins: [react()],
});
