import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FighterSprite, fighterSheetBackgroundSize } from './FighterSprite'

describe('FighterSprite sheet cropping', () => {
  it('overscans a frame so neighbouring artwork cannot leak across cell edges', () => {
    const markup = renderToStaticMarkup(<FighterSprite
      sheet="/fighter-sheet.png"
      state="hitReaction"
      side="opponent"
      label="Opponent"
      mirrored
    />)

    expect(fighterSheetBackgroundSize(1)).toBe('330% 330%')
    expect(markup).toContain('background-size:330% 330%')
    expect(markup).toContain('background-position:100% 50%')
    expect(markup).toContain('is-mirrored')
  })

  it('keeps the full vertical frame for standing and overhead poses', () => {
    const markup = renderToStaticMarkup(<FighterSprite
      sheet="/fighter-sheet.png"
      state="heavyAttack"
      side="player"
      label="Player"
    />)

    expect(fighterSheetBackgroundSize(0)).toBe('330% 300%')
    expect(markup).toContain('background-size:330% 300%')
    expect(markup).toContain('background-position:100% 0%')
  })
})
