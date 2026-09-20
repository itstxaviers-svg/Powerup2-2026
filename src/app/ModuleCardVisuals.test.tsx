import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../data/units'
import { createProgress } from '../progress/localProgressRepository'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { UnitHub } from './App'

describe('Unit task-card visuals', () => {
  it('uses one cropped thematic icon for each module instead of number-only markers', () => {
    const unit = units[0]
    const html = renderToStaticMarkup(<UnitHub
      unit={unit}
      profile={{ playerId: 'test', name: 'Sofy', group: '', avatarId: 1, avatarEvolutionStage: 1, createdAt: 0 }}
      progress={createProgress(1)}
      selectedParts={[1]}
      onPartSelectionChange={vi.fn()}
      highlightReveal={false}
      showCompletion={false}
      onClaimReward={vi.fn()}
      onCompleteFlow={vi.fn()}
      onBack={vi.fn()}
      onOpenModule={vi.fn()}
    />)

    expect(html.match(/class="module-icon module-icon-/g)).toHaveLength(5)
    expect(html.match(/class="module-icon-art"/g)).toHaveLength(5)
    for (const moduleId of ['repair', 'error-hunt', 'audio-code', 'word-strike', 'code-fighter']) {
      expect(html).toContain(`module-icon-${moduleId}`)
    }
    expect(html).not.toContain('module-index')
  })

  it('shows Unit-wide module coverage independently from the active Part filter', () => {
    const unit = units[0]
    const progress = createProgress(1)
    progress.units[unit.id].modules.repair.trainedWordIds = unit1Vocabulary.slice(0, 16).map((word) => word.id)
    const html = renderToStaticMarkup(<UnitHub
      unit={unit}
      profile={{ playerId: 'test', name: 'Sofy', group: '', avatarId: 1, avatarEvolutionStage: 1, createdAt: 0 }}
      progress={progress}
      selectedParts={[2]}
      onPartSelectionChange={vi.fn()}
      highlightReveal={false}
      showCompletion={false}
      onClaimReward={vi.fn()}
      onCompleteFlow={vi.fn()}
      onBack={vi.fn()}
      onOpenModule={vi.fn()}
    />)

    expect(html).toContain('Training: <strong>Part 2</strong> · 11 words')
    expect(html).toContain('16 / 50 words trained')
    expect(html).toContain('0/5 restored')
  })
})
