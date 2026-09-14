import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceRoot = join(projectRoot, 'Assets')
const outputRoot = join(projectRoot, 'WebAssets')
const novaPattern = /word-strike\/character\/specialist-nova-intro-(idle|wink|point)\.png$/

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collect(path) : [path]
  }))
  return nested.flat()
}

const sources = (await collect(sourceRoot)).filter((path) => path.endsWith('.png') && !novaPattern.test(path))
let cursor = 0
let converted = 0

async function worker() {
  while (cursor < sources.length) {
    const source = sources[cursor++]
    const target = join(outputRoot, relative(sourceRoot, source).replace(/\.png$/, '.webp'))
    try {
      const [sourceInfo, targetInfo] = await Promise.all([stat(source), stat(target)])
      if (targetInfo.mtimeMs >= sourceInfo.mtimeMs) continue
    } catch {
      // A missing derivative is generated below.
    }
    await mkdir(dirname(target), { recursive: true })
    await sharp(source).webp({ quality: 82, alphaQuality: 95, effort: 5 }).toFile(target)
    converted += 1
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()))
console.log(`Web assets ready: ${sources.length} total, ${converted} converted.`)
