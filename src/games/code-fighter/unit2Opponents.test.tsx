import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../../data/units'
import { BattleResult, CodeFighter, OpponentActionFigure } from './CodeFighter'
import { opponentsForUnit, resolveOpponentForUnit } from './codeFighterEngine'
import { opponentActionAsset, opponentVictoryResultAsset } from './opponentActionRegistry'
import { opponentVisualAnchor, opponentVisualAnchorStyle } from './opponentVisualAnchors'

describe('Unit-aware Code Fighter opponents', () => {
  it('resolves Unit 1, Unit 2, and Unit 3 rival/boss roles without global replacement', () => {
    expect(resolveOpponentForUnit('unit-01', 'rival')).toBe('kael')
    expect(resolveOpponentForUnit('unit-01', 'boss')).toBe('construct')
    expect(resolveOpponentForUnit('unit-02', 'rival')).toBe('lady-gearveil')
    expect(resolveOpponentForUnit('unit-02', 'boss')).toBe('chronofang')
    expect(resolveOpponentForUnit('unit-03', 'rival')).toBe('roseclock-duchess')
    expect(resolveOpponentForUnit('unit-03', 'boss')).toBe('thornbound-archivist')
    expect(opponentsForUnit('unit-01')).toEqual(['kael', 'construct'])
    expect(opponentsForUnit('unit-02')).toEqual(['lady-gearveil', 'chronofang'])
    expect(opponentsForUnit('unit-03')).toEqual(['roseclock-duchess', 'thornbound-archivist'])
    expect(resolveOpponentForUnit('unit-04', 'rival')).toBeUndefined()
    expect(resolveOpponentForUnit('unit-04', 'boss')).toBeUndefined()
    expect(opponentsForUnit('unit-04')).toEqual([])
  })

  it('renders only the selected Unit opponent pair', () => {
    const renderSelection = (unitIndex: number) => renderToStaticMarkup(<CodeFighter
      unit={units[unitIndex]}
      words={units[unitIndex].words}
      scopeLabel="All parts"
      avatarId={1}
      playerName="Learner"
      initialWeakWords={{}}
      initialReviewClock={0}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)
    const unit1 = renderSelection(0)
    expect(unit1).toContain('Rival Kael')
    expect(unit1).toContain('Corrupted Construct')
    expect(unit1).not.toContain('Lady Gearveil')
    expect(unit1).not.toContain('Chronofang')

    const unit2 = renderSelection(1)
    expect(unit2).toContain('Lady Gearveil')
    expect(unit2).toContain('Chronofang')
    expect(unit2).not.toContain('Rival Kael')
    expect(unit2).not.toContain('Corrupted Construct')

    const unit3 = renderSelection(2)
    expect(unit3).toContain('Roseclock Duchess')
    expect(unit3).toContain('Thornbound Archivist')
    expect(unit3).not.toContain('Lady Gearveil')
    expect(unit3).not.toContain('Chronofang')

    const unit4 = renderSelection(3)
    expect(unit4).toContain('Unit 4 vocabulary is ready')
    expect(unit4).toContain('Opponent pending')
    expect(unit4).not.toContain('Rival Kael')
    expect(unit4).not.toContain('Corrupted Construct')
  })

  it('uses the correct Unit 3 action and result art without mirroring', () => {
    for (const id of ['roseclock-duchess', 'thornbound-archivist'] as const) {
      const figure = renderToStaticMarkup(<OpponentActionFigure opponentId={id} state="quickAttack" label={id} />)
      expect(figure).toContain(opponentActionAsset(id, 'quickAttack'))
      expect(figure).toContain('data-mirror="false"')
      expect(figure).not.toContain('is-mirrored')

      const defeated = renderToStaticMarkup(<BattleResult
        victory scopeLabel="All parts" opponent={id} opponentId={id}
        avatarId={1} accuracy={1} trained={8} total={40} onBack={vi.fn()}
      />)
      expect(defeated).toContain(opponentActionAsset(id, 'tiredDefeat'))

      const reserved = renderToStaticMarkup(<OpponentActionFigure
        opponentId={id} state="ultimate" label={`${id} result`} result reservedResult
      />)
      expect(reserved).toContain(opponentVictoryResultAsset(id))
    }
  })

  it('applies Lady Gearveil mirroring only to the inner image layer', () => {
    const html = renderToStaticMarkup(<OpponentActionFigure opponentId="lady-gearveil" state="quickAttack" label="Lady Gearveil" />)
    expect(html).toContain('class="opponent-action-pose state-quickAttack"')
    expect(html).not.toContain('opponent-action-pose state-quickAttack is-mirrored')
    expect(html).toContain('class="opponent-action-image is-mirrored"')
    expect(html).toContain('data-mirror="true"')
    expect(html).toContain(opponentActionAsset('lady-gearveil', 'quickAttack'))
  })

  it('keeps Chronofang naturally left-facing without a mirror', () => {
    const html = renderToStaticMarkup(<OpponentActionFigure opponentId="chronofang" state="counter" label="Chronofang" />)
    expect(html).toContain('class="opponent-action-image"')
    expect(html).toContain('data-mirror="false"')
    expect(html).not.toContain('is-mirrored')
    expect(html).toContain(opponentActionAsset('chronofang', 'counter'))
  })

  it('uses mirrored Gearveil defeat and reserved ultimate result art', () => {
    const defeated = renderToStaticMarkup(<BattleResult
      victory scopeLabel="All parts" opponent="Lady Gearveil" opponentId="lady-gearveil"
      avatarId={1} accuracy={1} trained={8} total={44} onBack={vi.fn()}
    />)
    expect(defeated).toContain(opponentActionAsset('lady-gearveil', 'tiredDefeat'))
    expect(defeated).toContain('data-mirror="true"')

    const reserved = renderToStaticMarkup(<OpponentActionFigure
      opponentId="lady-gearveil" state="ultimate" label="Lady Gearveil result" result reservedResult
    />)
    expect(reserved).toContain(opponentVictoryResultAsset('lady-gearveil'))
    expect(reserved).toContain('reserved-result-art')
    expect(reserved).toContain('data-mirror="true"')
  })

  it('uses unmirrored Chronofang defeat and reserved ultimate result art', () => {
    const defeated = renderToStaticMarkup(<BattleResult
      victory scopeLabel="All parts" opponent="Chronofang" opponentId="chronofang"
      avatarId={1} accuracy={1} trained={8} total={44} onBack={vi.fn()}
    />)
    expect(defeated).toContain(opponentActionAsset('chronofang', 'tiredDefeat'))
    expect(defeated).toContain('data-mirror="false"')

    const reserved = renderToStaticMarkup(<OpponentActionFigure
      opponentId="chronofang" state="ultimate" label="Chronofang result" result reservedResult
    />)
    expect(reserved).toContain(opponentVictoryResultAsset('chronofang'))
    expect(reserved).toContain('reserved-result-art')
    expect(reserved).toContain('data-mirror="false"')
    expect(reserved).not.toContain('is-mirrored')
  })

  it('uses centralized action anchors and safe default fallbacks', () => {
    expect(opponentVisualAnchor('lady-gearveil', 'idle')).toEqual({ scale: .86, x: 50, feetY: 99, offsetX: 0, offsetY: 0 })
    expect(opponentVisualAnchor('chronofang', 'idle').feetY).toBe(88)
    expect(opponentVisualAnchor('chronofang', 'quickAttack')).toMatchObject({ scale: .92, feetY: 95 })
    expect(opponentVisualAnchor('chronofang', 'tiredDefeat').feetY).toBe(83)
    expect(opponentVisualAnchor('kael', 'idle')).toEqual({ scale: 1, x: 50, feetY: 100, offsetX: 0, offsetY: 0 })
    expect(opponentVisualAnchorStyle('chronofang', 'counter')).toMatchObject({ '--opponent-action-scale': .92, '--opponent-action-feet-y': '99%' })
    expect(opponentVisualAnchor('roseclock-duchess', 'idle')).toMatchObject({ scale: .92, feetY: 97 })
    expect(opponentVisualAnchor('roseclock-duchess', 'tiredDefeat').scale).toBe(.82)
    expect(opponentVisualAnchor('thornbound-archivist', 'idle')).toMatchObject({ scale: .88, feetY: 97 })
    expect(opponentVisualAnchor('thornbound-archivist', 'tiredDefeat').feetY).toBe(92)
  })
})
