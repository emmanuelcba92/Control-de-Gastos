import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/Control-de-Gastos/",
  plugins: [react()],
})