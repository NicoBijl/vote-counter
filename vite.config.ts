import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      // Exclude test files from the build
      external: [
        /.*\.test\.(ts|tsx)$/,
        /.*\/__tests__\/.*/,
      ]
    }
  }
})
