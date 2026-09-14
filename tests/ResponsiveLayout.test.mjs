import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

describe('cross-device layout safeguards', () => {
  it('configures mobile cut-outs and virtual-keyboard viewport resizing', () => {
    expect(html).toContain('width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content')
    expect(css).toContain('min-height: 100dvh')
    expect(css).toContain('env(safe-area-inset-bottom)')
  })

  it('allows long Audio Code phrases to wrap without losing word groups', () => {
    expect(css).toMatch(/\.assembled-word\s*\{[^}]*flex-wrap:\s*wrap/)
    expect(css).toMatch(/\.answer-slot-group\s*\{[^}]*gap:/)
  })

  it('provides dedicated narrow-phone and short-landscape layouts', () => {
    expect(css).toContain('@media (max-width: 380px)')
    expect(css).toContain('@media (max-height: 520px) and (orientation: landscape)')
    expect(css).toContain('@media (max-width: 740px) and (max-height: 520px) and (orientation: landscape)')
  })

  it('retains the phone and tablet landscape prompt for Code Fighter portrait mode', () => {
    expect(css).toContain('@media (max-width: 1100px) and (orientation: portrait)')
    expect(css).toMatch(/\.fighter-rotate-prompt\s*\{[^}]*position:\s*fixed/)
  })

  it('keeps the Code Fighter task card compact and gives the timer its own HUD slot', () => {
    expect(css).toContain('width: min(58%, 760px);')
    expect(css).toContain('max-height: min(38%, 300px);')
    expect(css).toMatch(/\.fighter-top-hud\s*\{[^}]*position:\s*absolute/)
    expect(css).toMatch(/\.fighter-timer-hud\s*\{[^}]*grid-column:\s*2/)
    expect(css).toContain('width: min(90%, 760px);')
    expect(css).toContain('width: min(88%, 760px);')
  })
})
