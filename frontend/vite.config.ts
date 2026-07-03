import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok tunnels (and any other host) to reach the dev server for testing.
    allowedHosts: ['.ngrok-free.app'],
  },
})
