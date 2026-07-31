import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'optimize-css',
        transformIndexHtml(html) {
          return html.replace(
            /<link rel="stylesheet" [^>]*href="([^"]+)"[^>]*>/g,
            '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1"></noscript>'
          );
        }
      }
    ],
    base: mode === 'production' ? '/LuanVanTotNghiep/' : '/',
    server: {
      watch: {
        usePolling: true,
      },
    },
  };
});
