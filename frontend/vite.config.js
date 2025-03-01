import path from 'path';
import react from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
};
