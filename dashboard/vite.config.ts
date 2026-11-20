import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' para que el build funcione desde cualquier ruta
<<<<<<< HEAD
export default defineConfig({
  base: './',
  plugins: [react()],
  // En desarrollo, Vite (5173) reenvía /api al backend FastAPI (8000)
=======
// En desarrollo, /api se envía a Uvicorn en el puerto 8000
export default defineConfig({
  base: './',
  plugins: [react()],
>>>>>>> b54be161e5c0509d4cc01a01d97a748619c16674
  server: { proxy: { '/api': 'http://localhost:8000' } },
})
