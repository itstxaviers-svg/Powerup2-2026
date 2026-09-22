import { describe, expect, it } from 'vitest'
import { joinPublicAssetPath, vocabularyAudioPath } from './audioAssetPath'

describe('audio asset paths', () => {
  it('keeps root-hosted production audio paths unchanged', () => {
    expect(vocabularyAudioPath(3, 'u3-treasure')).toBe('/assets/audio/unit-03/u3-treasure.mp3')
  })

  it('adds the GitHub Pages project base path', () => {
    expect(joinPublicAssetPath('/Powerup2-2026/', '/assets/audio/unit-03/u3-treasure.mp3'))
      .toBe('/Powerup2-2026/assets/audio/unit-03/u3-treasure.mp3')
  })
})
