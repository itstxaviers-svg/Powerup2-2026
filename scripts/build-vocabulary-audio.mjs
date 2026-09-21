import { access, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'

const root = new URL('../public/assets/audio/', import.meta.url)
const temp = await mkdtemp(join(tmpdir(), 'power-up-2-audio-'))
const force = process.argv.includes('--force')
const fromUnitArgument = process.argv.find((argument) => argument.startsWith('--from-unit='))
const fromUnit = Math.max(2, Number(fromUnitArgument?.split('=')[1]) || 2)
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const vite = await createServer({ root: projectRoot, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const unitNumbers = [2, 3, 4, 5, 6, 7, 8, 9].filter((unitNumber) => unitNumber >= fromUnit)
const units = await Promise.all(unitNumbers.map(async (unitNumber) => {
  const module = await vite.ssrLoadModule(`/src/data/unit${unitNumber}Vocabulary.ts`)
  return [`unit-${String(unitNumber).padStart(2, '0')}`, module[`unit${unitNumber}Vocabulary`]]
}))

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`)
}

let generated = 0
try {
  for (const [unitId, words] of units) {
    const outputDirectory = new URL(`${unitId}/`, root)
    await mkdir(outputDirectory, { recursive: true })
    for (const word of words) {
      const output = new URL(`${word.id}.mp3`, outputDirectory)
      try {
        await access(output)
        if (!force) continue
      } catch {
        // Missing recordings are generated below.
      }
      const aiff = join(temp, `${word.id}.aiff`)
      const spokenText = word.word.replace(/\.{3}(?=\?)/gu, '')
      run('say', ['-v', 'Daniel', '-r', '155', '-o', aiff, spokenText])
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', aiff, '-ac', '1', '-ar', '44100', '-b:a', '56k', fileURLToPath(output)])
      generated += 1
    }
  }
} finally {
  await rm(temp, { recursive: true, force: true })
  await vite.close()
}

console.log(`Vocabulary audio ready: ${generated} MP3 files generated.`)
