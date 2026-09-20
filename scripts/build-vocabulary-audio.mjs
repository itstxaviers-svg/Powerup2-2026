import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { unit2Vocabulary } from '../src/data/unit2Vocabulary.ts'
import { unit3Vocabulary } from '../src/data/unit3Vocabulary.ts'
import { unit4Vocabulary } from '../src/data/unit4Vocabulary.ts'

const root = new URL('../public/assets/audio/', import.meta.url)
const temp = await mkdtemp(join(tmpdir(), 'power-up-2-audio-'))
const units = [
  ['unit-02', unit2Vocabulary],
  ['unit-03', unit3Vocabulary],
  ['unit-04', unit4Vocabulary],
]

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
      const aiff = join(temp, `${word.id}.aiff`)
      const output = new URL(`${word.id}.mp3`, outputDirectory)
      const spokenText = word.word.replace(/\.{3}(?=\?)/gu, '')
      run('say', ['-v', 'Daniel', '-r', '155', '-o', aiff, spokenText])
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', aiff, '-ac', '1', '-ar', '44100', '-b:a', '56k', fileURLToPath(output)])
      generated += 1
    }
  }
} finally {
  await rm(temp, { recursive: true, force: true })
}

console.log(`Vocabulary audio ready: ${generated} MP3 files generated.`)
