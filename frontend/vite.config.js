import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user-api': 'http://localhost:3300',
      '/task-api': 'http://localhost:3300',
      '/admin-api': 'http://localhost:3300',
    }
  }
})