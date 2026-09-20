import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceRoot = join(projectRoot, 'Assets')
const outputRoot = join(projectRoot, 'WebAssets')
const force = process.argv.includes('--force')
const maxDimension = 1280
const webpOptions = { quality: 62, alphaQuality: 80, effort: 6, smartSubsample: true }
const unit4PictureAliases = [
  [/балкон/u, 'u4-balcony.webp'],
  [/подвал/u, 'u4-basement.webp'],
  [/велосипед/u, 'u4-bicycle.webp'],
  [/камера/u, 'u4-camera.webp'],
  [/рабочее_место/u, 'u4-computer.webp'],
  [/кухня_со_стальным/u, 'u4-dishwasher.webp'],
  [/миксер/u, 'u4-food-mixer.webp'],
  [/фен/u, 'u4-hairdryer.webp'],
  [/лифт/u, 'u4-lift.webp'],
  [/точилка/u, 'u4-pencil-sharpener.webp'],
  [/крыша/u, 'u4-roof.webp'],
  [/смартфон/u, 'u4-smartphone.webp'],
  [/степлер/u, 'u4-stapler.webp'],
  [/лестница/u, 'u4-stairs.webp'],
  [/качелями/u, 'u4-swing.webp'],
  [/пылесос/u, 'u4-vacuum-cleaner.webp'],
  [/magische_steampunk_waschmaschine/u, 'u4-washing-machine.webp'],
]

const stableAliasFor = (source) => {
  const relativePath = relative(sourceRoot, source).normalize('NFC')
  if (!relativePath.includes('/unit-04/')) return undefined
  const match = unit4PictureAliases.find(([pattern]) => pattern.test(relativePath))
  return match ? join(dirname(join(outputRoot, relative(sourceRoot, source))), match[1]) : undefined
}

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collect(path) : [path]
  }))
  return nested.flat()
}

const sources = (await collect(sourceRoot)).filter((path) => path.endsWith('.png'))
let cursor = 0
let converted = 0

async function worker() {
  while (cursor < sources.length) {
    const source = sources[cursor++]
    const target = join(outputRoot, relative(sourceRoot, source).replace(/\.png$/, '.webp'))
    const targets = [target, stableAliasFor(source)].filter(Boolean)
    const sourceInfo = await stat(source)
    for (const output of targets) {
      try {
        const targetInfo = await stat(output)
        if (!force && targetInfo.mtimeMs >= sourceInfo.mtimeMs) continue
      } catch {
        // A missing derivative is generated below.
      }
      await mkdir(dirname(output), { recursive: true })
      await sharp(source)
        .rotate()
        .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
        .webp(webpOptions)
        .toFile(output)
      converted += 1
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()))
console.log(`Web assets ready: ${sources.length} total, ${converted} converted.`)
