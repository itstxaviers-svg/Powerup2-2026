import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { UnitCompletionFlow } from './RewardChest'

describe('UnitCompletionFlow keyboard transition', () => {
  it('marks the current primary transition for the Enter shortcut', () => {
    const markup = renderToStaticMarkup(<UnitCompletionFlow
      unitTitle="Skyport Basics"
      tier="common"
      rewards={[]}
      onClaim={vi.fn()}
      onContinue={vi.fn()}
    />)

    expect(markup).toContain('Reveal reward chest')
    expect(markup).toContain('aria-keyshortcuts="Enter"')
    expect(markup).toContain('data-enter-action="true"')
  })
})
