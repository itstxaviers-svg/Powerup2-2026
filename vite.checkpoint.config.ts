import { existsSync, renameSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = dirname(fileURLToPath(import.meta.url))

function checkpointAssets(): Plugin {
  return {
    name: 'checkpoint-web-assets',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.includes('Assets/') || !source.endsWith('.png')) return null
      const original = resolve(dirname(importer), source)
      const webAsset = original.replace(`${resolve(projectRoot, 'Assets')}/`, `${resolve(projectRoot, 'WebAssets')}/`).replace(/\.png$/, '.webp')
      return existsSync(webAsset) ? webAsset : null
    },
    closeBundle() {
      renameSync(resolve(projectRoot, 'dist/checkpoint.html'), resolve(projectRoot, 'dist/index.html'))
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [checkpointAssets(), react()],
  build: { rollupOptions: { input: resolve(projectRoot, 'checkpoint.html') } },
})
