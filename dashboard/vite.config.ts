import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' para que el build funcione desde cualquier ruta
export default defineConfig({
  base: './',
  plugins: [react()],
  // En desarrollo, Vite (5173) reenvía /api al backend FastAPI (8000)
  server: { proxy: { '/api': 'http://localhost:8000' } },
})
