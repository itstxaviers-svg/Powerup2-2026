import type { QuestionDifficulty, UnitWord } from '../../types/game'
import type { QuestionVariant } from '../../learning/questionVariation'

const normalize = (value: string) => value.trim().toLocaleLowerCase()

export type SpellingEditKind = 'omission' | 'transposition' | 'substitution' | 'insertion'

function singleEditKind(canonical: string, variant: string): SpellingEditKind | null {
  if (canonical === variant) return null
  if (canonical.length === variant.length + 1) {
    for (let index = 0; index < canonical.length; index += 1) {
      if (canonical.slice(0, index) + canonical.slice(index + 1) === variant) return 'omission'
    }
    return null
  }
  if (variant.length === canonical.length + 1) {
    for (let index = 0; index < variant.length; index += 1) {
      if (variant.slice(0, index) + variant.slice(index + 1) === canonical) return 'insertion'
    }
    return null
  }
  if (variant.length !== canonical.length) return null
  const changed = [...canonical].map((letter, index) => letter === variant[index] ? -1 : index).filter((index) => index >= 0)
  if (changed.length === 1) return 'substitution'
  if (changed.length === 2) {
    const [left, right] = changed
    if (right === left + 1 && canonical[left] === variant[right] && canonical[right] === variant[left]) return 'transposition'
  }
  return null
}

function removesUnsafeEdge(canonical: string, variant: string) {
  if (variant === canonical.slice(1)) return true
  if (canonical.length > 5 || variant !== canonical.slice(0, -1)) return false
  return canonical.at(-1) !== canonical.at(-2)
}

export function spellingVariantKind(word: UnitWord, variant: string): SpellingEditKind | null {
  const canonicalTokens = normalize(word.word).split(/\s+/)
  const variantTokens = normalize(variant).split(/\s+/)
  if (canonicalTokens.length !== variantTokens.length) return null
  const changedTokenIndexes = canonicalTokens
    .map((token, index) => token === variantTokens[index] ? -1 : index)
    .filter((index) => index >= 0)
  if (changedTokenIndexes.length !== 1) return null
  const index = changedTokenIndexes[0]
  const canonical = canonicalTokens[index]
  const changed = variantTokens[index]
  if (removesUnsafeEdge(canonical, changed)) return null
  return singleEditKind(canonical, changed)
}

export const isPlausibleSpellingVariant = (word: UnitWord, variant: string) => Boolean(variant.trim() && spellingVariantKind(word, variant))
export const isCorrectErrorHuntAnswer = (word: UnitWord, answer: string) => normalize(answer) === normalize(word.word)

function replaceToken(tokens: string[], index: number, replacement: string) {
  return tokens.map((token, tokenIndex) => tokenIndex === index ? replacement : token).join(' ')
}

function generatedSpellingVariants(word: UnitWord): Array<{ value: string; kind: SpellingEditKind }> {
  const tokens = word.word.trim().split(/\s+/)
  const candidates: Array<{ value: string; kind: SpellingEditKind }> = []
  tokens.forEach((token, tokenIndex) => {
    const letters = [...token]
    if (letters.length < 2) return

    for (let index = 1; index < letters.length - 1; index += 1) {
      candidates.push({ value: replaceToken(tokens, tokenIndex, letters.filter((_, letterIndex) => letterIndex !== index).join('')), kind: 'omission' })
    }
    for (let index = 0; index < letters.length - 1; index += 1) {
      if (letters[index] === letters[index + 1]) continue
      const transposed = [...letters]
      ;[transposed[index], transposed[index + 1]] = [transposed[index + 1], transposed[index]]
      candidates.push({ value: replaceToken(tokens, tokenIndex, transposed.join('')), kind: 'transposition' })
    }
    for (let index = 1; index < Math.max(2, letters.length - 1); index += 1) {
      const substituted = [...letters]
      substituted[index] = substituted[index].toLocaleLowerCase() === 'e' ? 'a' : 'e'
      candidates.push({ value: replaceToken(tokens, tokenIndex, substituted.join('')), kind: 'substitution' })
    }
    for (let index = 1; index < letters.length; index += 1) {
      const duplicated = [...letters.slice(0, index), letters[index], ...letters.slice(index)]
      candidates.push({ value: replaceToken(tokens, tokenIndex, duplicated.join('')), kind: 'insertion' })
    }
  })
  return [...new Map(candidates
    .filter((candidate) => isPlausibleSpellingVariant(word, candidate.value))
    .map((candidate) => [normalize(candidate.value), candidate])).values()]
}

export function errorHuntVariants(word: UnitWord): QuestionVariant<string>[] {
  const supplied = [...new Set(word.typoForms ?? [])]
    .filter((value) => isPlausibleSpellingVariant(word, value))
    .map((value, index): QuestionVariant<string> => ({
      variantId: `error-hunt.supplied.${index}.${normalize(value)}`,
      difficulty: Math.min(3, index + 1) as QuestionDifficulty,
      value,
    }))
  if (supplied.length >= 2) return supplied

  const generated = generatedSpellingVariants(word).map((candidate, index): QuestionVariant<string> => ({
    variantId: `error-hunt.generated.${candidate.kind}.${index}.${normalize(candidate.value)}`,
    difficulty: candidate.kind === 'omission' || candidate.kind === 'insertion' ? 1 : candidate.kind === 'transposition' ? 2 : 3,
    value: candidate.value,
  }))
  return [...new Map([...supplied, ...generated].map((candidate) => [normalize(candidate.value), candidate])).values()]
}
