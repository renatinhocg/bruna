import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis do arquivo .env de forma dinâmica
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/navigation': path.resolve(__dirname, './src/next-compat.ts'),
        'next/dynamic': path.resolve(__dirname, './src/next-dynamic-compat.ts'),
      },
    },
    define: {
      // Cria a compatibilidade global de process.env para que arquivos JS/TS funcionem idênticos ao NextJS
      'process.env': {
        NEXT_PUBLIC_API_BASE_URL: env.NEXT_PUBLIC_API_BASE_URL || (env.NEXT_PUBLIC_API_URL ? `${env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8002/api'),
        NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL || 'http://localhost:8002',
      }
    },
    server: {
      port: 3000,
    }
  };
});
