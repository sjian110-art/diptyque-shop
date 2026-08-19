import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude large binary / locked files from the file watcher
      ignored: ['**/video.mp4', '**/*.mp4', '**/*.mp3', '**/*.mov'],
    },
  },
})

