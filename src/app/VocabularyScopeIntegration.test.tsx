import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../data/units'
import { CodeFighter } from '../games/code-fighter/CodeFighter'
import { TrainingModule } from '../games/training/TrainingModule'
import { WordStrike } from '../games/word-strike/WordStrike'
import { filterVocabularyByParts } from '../learning/vocabularyParts'

describe('active vocabulary scope in all game surfaces', () => {
  it('passes one shared filtered pool and visible scope into all five games', () => {
    const unit = units[0]
    const words = filterVocabularyByParts(unit.words, [1, 3])
    const common = { unit, words, initialWeakWords: {}, initialReviewClock: 0, onAttempt: vi.fn(), onBack: vi.fn() }
    const repair = renderToStaticMarkup(<TrainingModule {...common} moduleId="repair" scopeLabel="Parts 1 + 3" startImmediately />)
    const errorHunt = renderToStaticMarkup(<TrainingModule {...common} moduleId="error-hunt" scopeLabel="Parts 1 + 3" startImmediately />)
    const audioCode = renderToStaticMarkup(<TrainingModule {...common} moduleId="audio-code" scopeLabel="Parts 1 + 3" startImmediately />)
    const wordStrike = renderToStaticMarkup(<WordStrike {...common} scopeLabel="Parts 1 + 3" tutorialSeen onTutorialSeen={vi.fn()} />)
    const codeFighter = renderToStaticMarkup(<CodeFighter {...common} scopeLabel="Parts 1 + 3" avatarId={1} playerName="Learner" />)

    expect(words).toHaveLength(20)
    for (const screen of [repair, errorHunt, audioCode, wordStrike, codeFighter]) {
      expect(screen).toContain('Parts 1 + 3')
    }
    expect(codeFighter).toContain('Turn your device sideways')
    expect(codeFighter).toContain('Rotate your phone or tablet to landscape mode to continue.')
  })
})
