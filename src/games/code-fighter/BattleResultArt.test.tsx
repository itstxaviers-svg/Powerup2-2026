import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BattleResult } from './CodeFighter'
import { opponentActionAsset, opponentVictoryResultAsset } from './opponentActionRegistry'
import { playerActionAsset } from './playerActionRegistry'

const common = {
  scopeLabel: 'All parts',
  opponent: 'Rival Kael',
  opponentId: 'kael' as const,
  avatarId: 5,
  accuracy: .8,
  trained: 10,
  total: 50,
  onBack: vi.fn(),
}

describe('Code Fighter result artwork', () => {
  it('shows the selected player victory and opponent defeat art after a win', () => {
    const html = renderToStaticMarkup(<BattleResult {...common} victory />)
    expect(html).toContain(playerActionAsset(5, 'victory'))
    expect(html).toContain(opponentActionAsset('kael', 'tiredDefeat'))
    expect(html).not.toContain(playerActionAsset(5, 'ultimate'))
  })

  it('starts a loss with player defeat and ordinary enemy victory before the reserved reveal', () => {
    const html = renderToStaticMarkup(<BattleResult {...common} victory={false} onRetry={vi.fn()} />)
    expect(html).toContain(playerActionAsset(5, 'tiredDefeat'))
    expect(html).toContain(opponentActionAsset('kael', 'victory'))
    expect(html).not.toContain(opponentVictoryResultAsset('kael'))
  })
})
