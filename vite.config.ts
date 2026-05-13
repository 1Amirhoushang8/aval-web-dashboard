import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    basicSsl(),   // 👈 enables HTTPS automatically, no extra config needed
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,   // keep the port, now HTTPS
    // 🔁 NO `https: true` here – the plugin does it
  },
})