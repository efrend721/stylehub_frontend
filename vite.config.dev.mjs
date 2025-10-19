import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;

  return {
    server: {
      open: false,
      port: 3000,
      host: true,
      hmr: true
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        onwarn(warning, warn) {
          // Ignore TypeScript warnings during build
          if (warning.code === 'TYPESCRIPT_ERROR') return;
          warn(warning);
        }
      }
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
      }
    },
    base: API_URL,
    plugins: [
      react(),
      tsconfigPaths({
        // Don't fail on TypeScript errors
        loose: true
      })
    ],
    esbuild: {
      // Allow JSX in .js files
      include: /\.[jt]sx?$/,
      exclude: [],
      // Don't fail on TypeScript errors
      logLevel: 'error'
    }
  };
});