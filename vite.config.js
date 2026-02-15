import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser', 
    terserOptions: {
      format: {
        ascii_only: true, 
      },
    },
    rollupOptions: {
      input: 'src/content/index.jsx',
      output: {
        format: 'iife',
        entryFileNames: 'assets/content.js',
        name: 'GhostWriter',
        inlineDynamicImports: true,
      }
    }
  }
})