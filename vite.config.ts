import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures the app works if you drag-and-drop the folder to verify
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    // This allows the code to run safely without accessing system variables
    'process.env': {} 
  }
});