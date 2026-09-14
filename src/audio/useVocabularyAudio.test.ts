import { describe, expect, it } from 'vitest'
import { isBrowserSpeechSource, isDevelopmentSpeechSource } from './useVocabularyAudio'

describe('vocabulary audio sources', () => {
  it('distinguishes the development source from the production browser-speech fallback', () => {
    expect(isDevelopmentSpeechSource('dev-speech')).toBe(true)
    expect(isBrowserSpeechSource('browser-speech')).toBe(true)
    expect(isBrowserSpeechSource('dev-speech')).toBe(false)
    expect(isDevelopmentSpeechSource('/assets/audio/unit-01/u1-field.mp3')).toBe(false)
    expect(isDevelopmentSpeechSource('speech')).toBe(false)
    expect(isDevelopmentSpeechSource(undefined)).toBe(false)
  })
})
