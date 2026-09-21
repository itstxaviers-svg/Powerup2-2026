/// <reference types="node" />
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { unit2Vocabulary } from '../data/unit2Vocabulary'
import { unit3Vocabulary } from '../data/unit3Vocabulary'
import { unit4Vocabulary } from '../data/unit4Vocabulary'
import { unit5Vocabulary } from '../data/unit5Vocabulary'
import { unit6Vocabulary } from '../data/unit6Vocabulary'
import { unit7Vocabulary } from '../data/unit7Vocabulary'
import { unit8Vocabulary } from '../data/unit8Vocabulary'
import { unit9Vocabulary } from '../data/unit9Vocabulary'

const vocabulary = [unit1Vocabulary, unit2Vocabulary, unit3Vocabulary, unit4Vocabulary, unit5Vocabulary, unit6Vocabulary, unit7Vocabulary, unit8Vocabulary, unit9Vocabulary].flat()

describe('production vocabulary audio assets', () => {
  it('has a valid local MP3 for every production word', () => {
    expect(vocabulary).toHaveLength(356)
    vocabulary.forEach((word) => {
      expect(word.audio, word.id).toMatch(/^\/assets\/audio\/unit-0[1-9]\/[a-z0-9-]+\.mp3$/)
      const path = resolve('public', word.audio!.replace(/^\//, ''))
      expect(statSync(path).size, word.id).toBeGreaterThan(1_000)
      expect(readFileSync(path).subarray(0, 3).toString('ascii'), word.id).toBe('ID3')
    })
  })
})
