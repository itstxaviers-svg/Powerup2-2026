import { renameSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = dirname(fileURLToPath(import.meta.url))

function teacherIndex(): Plugin {
  return {
    name: 'teacher-index',
    closeBundle() {
      renameSync(resolve(projectRoot, 'dist/teacher.html'), resolve(projectRoot, 'dist/index.html'))
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), teacherIndex()],
  build: { rollupOptions: { input: resolve(projectRoot, 'teacher.html') } },
})
