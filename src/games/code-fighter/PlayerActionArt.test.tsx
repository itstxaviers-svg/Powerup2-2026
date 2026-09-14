import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PlayerActionArt } from './PlayerActionArt'
import { playerActionAsset } from './playerActionRegistry'

describe('PlayerActionArt', () => {
  it('renders the selected avatar and semantic action as a contained standalone image', () => {
    const html = renderToStaticMarkup(<PlayerActionArt avatarId={6} state="heavyAttack" label="Player" />)
    expect(html).toContain(playerActionAsset(6, 'heavyAttack'))
    expect(html).toContain('player-action-image')
    expect(html).toContain('state-heavyAttack')
    expect(html).toContain('object-fit:contain')
    expect(html).not.toContain('background-position')
    expect(html).not.toContain('is-mirrored')
  })

  it('uses distinct ultimate, victory and defeat artwork on final states', () => {
    const ultimate = renderToStaticMarkup(<PlayerActionArt avatarId={10} state="ultimate" label="Player" />)
    const victory = renderToStaticMarkup(<PlayerActionArt avatarId={10} state="victory" label="Player result" result />)
    const defeat = renderToStaticMarkup(<PlayerActionArt avatarId={10} state="tiredDefeat" label="Player result" result />)
    expect(ultimate).toContain(playerActionAsset(10, 'ultimate'))
    expect(victory).toContain(playerActionAsset(10, 'victory'))
    expect(defeat).toContain(playerActionAsset(10, 'tiredDefeat'))
    expect(victory).not.toContain(playerActionAsset(10, 'ultimate'))
  })

  it('keeps the action state visible to Reduced Motion parents', () => {
    const html = renderToStaticMarkup(<main className="fighter-reduced-motion"><PlayerActionArt avatarId={1} state="counter" label="Player" /></main>)
    expect(html).toContain('fighter-reduced-motion')
    expect(html).toContain('state-counter')
    expect(html).toContain(playerActionAsset(1, 'counter'))
  })

  it('resolves a newly selected avatar without retaining the previous avatar art', () => {
    const before = renderToStaticMarkup(<PlayerActionArt avatarId={1} state="idle" label="Player" />)
    const after = renderToStaticMarkup(<PlayerActionArt avatarId={10} state="idle" label="Player" />)
    expect(before).toContain(playerActionAsset(1, 'idle'))
    expect(after).toContain(playerActionAsset(10, 'idle'))
    expect(after).not.toContain(playerActionAsset(1, 'idle'))
  })
})
