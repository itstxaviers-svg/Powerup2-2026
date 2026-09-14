import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = dirname(fileURLToPath(import.meta.url))

function productionWebAssets(): Plugin {
  return {
    name: 'power-up-web-assets',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/games/code-fighter/playerActionRegistry.ts')) return null
      return code.replaceAll('../../../Assets/05-games/code-fighter/players/', '../../../WebAssets/05-games/code-fighter/players/').replaceAll('/*.png', '/*.webp').replaceAll("}.png`", "}.webp`")
    },
    resolveId(source, importer) {
      if (!importer || !source.includes('Assets/') || !source.endsWith('.png') || source.includes('specialist-nova-intro-')) return null
      const original = resolve(dirname(importer), source)
      const webAsset = original.replace(`${resolve(projectRoot, 'Assets')}/`, `${resolve(projectRoot, 'WebAssets')}/`).replace(/\.png$/, '.webp')
      return existsSync(webAsset) ? webAsset : null
    },
  }
}

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [...(command === 'build' ? [productionWebAssets()] : []), react()],
}))
