import { defineConfig } from "vite";
import env from './config/env';
import { resolve } from "path";

const proxy = {
  ['^' + env.API_BASE_URL]: {
    target: 'http://trail.hpyyb.cn',
    changeOrigin: true,
  },
  // '/music': {
  //   target: 'http://static.hpyyb.cn',
  //   changeOrigin: true,
  // }
}
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/styles/utils.scss';`,
      },
    },
  },
  base: env.BASE_URL,

  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    proxy,
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
