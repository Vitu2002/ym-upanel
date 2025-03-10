import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@styles': resolve('src/renderer/src/styles'),
        '@pages': resolve('src/renderer/src/pages'),
        '@components': resolve('src/renderer/src/components'),
        '@utils': resolve('src/renderer/src/utils'),
        '@layouts': resolve('src/renderer/src/layouts'),
        '@providers': resolve('src/renderer/src/providers'),
        '@assets': resolve('src/renderer/src/assets'),
        '@type': resolve('src/renderer/src/types')
      }
    },
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${resolve('src/renderer/src/styles/_variables.scss')}" as *;`
        }
      }
    }
  }
});
