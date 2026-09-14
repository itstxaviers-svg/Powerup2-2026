import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FighterTimerHud } from './CodeFighter'

describe('Code Fighter battle layout', () => {
  it('renders the countdown as a standalone accessible HUD capsule', () => {
    const html = renderToStaticMarkup(<FighterTimerHud answerReady timeRemainingMs={1350} timeLimitMs={7000} />)

    expect(html).toContain('class="fighter-timer-hud urgent"')
    expect(html).toContain('role="timer"')
    expect(html).toContain('aria-label="2 seconds remaining"')
    expect(html).toContain('class="fighter-timer-track"')
    expect(html).toContain('>2s</strong>')
  })

  it('shows a waiting state without starting the visual countdown', () => {
    const html = renderToStaticMarkup(<FighterTimerHud answerReady={false} timeRemainingMs={7000} timeLimitMs={7000} />)

    expect(html).toContain('fighter-timer-hud is-waiting')
    expect(html).toContain('Waiting for the task to be ready')
    expect(html).toContain('width:0%')
  })
})
