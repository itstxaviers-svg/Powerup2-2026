import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { moduleMedals } from '../data/rewards'
import { createProgress } from '../progress/localProgressRepository'
import { AccountView, evolutionProgressText, ProgressView, RewardsView } from './ProgressScreens'
import { unit1Vocabulary } from '../data/unit1Vocabulary'

describe('Profile and Rewards presentation', () => {
  it('shows actual restored-city progress and the next canonical evolution threshold', () => {
    expect(evolutionProgressText(0, 1)).toBe('0 cities restored · Next evolution at 3')
    expect(evolutionProgressText(1, 1)).toBe('1 city restored · Next evolution at 3')
    expect(evolutionProgressText(3, 2)).toBe('3 cities restored · Next evolution at 5')
    expect(evolutionProgressText(5, 3)).toBe('5 cities restored · Next evolution at 8')
    expect(evolutionProgressText(8, 4)).toBe('8 cities restored · Final evolution reached')
    expect(evolutionProgressText(9, 4)).toBe('9 cities restored · Final evolution reached')
  })

  it('keeps the Repair medal mapping while using its final learner-facing title', () => {
    expect(moduleMedals.repair).toMatchObject({ id: 'medal.wordMaster', label: 'Word Engineer', icon: 'word-master' })
  })

  it('renders the cleaned Profile identity and compact Rewards empty state', () => {
    const progress = createProgress(5)
    progress.units['unit-01'].completed = true
    progress.units['unit-02'].completed = true
    const profile = { playerId: 'test', name: 'Sofy', group: 'X', avatarId: 5, avatarEvolutionStage: 1 as const, createdAt: 0 }
    const onNavigate = () => undefined
    const profileMarkup = renderToStaticMarkup(AccountView({ profile, progress, onSignOut: () => undefined, onNavigate }))
    const rewardsMarkup = renderToStaticMarkup(RewardsView({ progress, onNavigate }))

    expect(profileMarkup).toContain('Sofy')
    expect(profileMarkup).toContain('Explorer')
    expect(profileMarkup).toContain('Avatar 05')
    expect(profileMarkup).toContain('Sign out')
    expect(profileMarkup).toContain('Your saved progress will not be deleted.')
    expect(profileMarkup).not.toContain('X · Avatar 05')
    expect(profileMarkup).toContain('0 cities restored · Next evolution at 3')
    expect(rewardsMarkup).toContain('rewards-shell')
    expect(rewardsMarkup).toContain('Complete your first Unit to start your collection.')
  })

  it('shows per-game vocabulary coverage without calling a short session complete', () => {
    const progress = createProgress(1)
    progress.units['unit-01'].modules.repair.trainedWordIds = unit1Vocabulary.slice(0, 5).map((word) => word.id)
    const profile = { playerId: 'test', name: 'Sofy', group: 'X', avatarId: 1, avatarEvolutionStage: 1 as const, createdAt: 0 }
    const markup = renderToStaticMarkup(ProgressView({ profile, progress, onNavigate: () => undefined }))
    expect(markup).toContain('Repair <b>5/50</b>')
    expect(markup).toContain('0/5 stations active')
    expect(markup).not.toContain('>Restored<')
  })
})
