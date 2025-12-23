
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Stringify the env var for the build, fallback to empty string if missing
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
