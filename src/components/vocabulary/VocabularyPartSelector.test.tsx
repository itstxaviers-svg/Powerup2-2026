import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../../data/units'
import { VocabularyPartSelector } from './VocabularyPartSelector'

describe('Vocabulary Part selector', () => {
  it('renders five Parts plus All parts with real counts and an accessible selected state', () => {
    const html = renderToStaticMarkup(<VocabularyPartSelector unit={units[0]} words={units[0].words} selectedParts={[1, 3]} onChange={vi.fn()} />)
    expect(html.match(/<button/g)).toHaveLength(6)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2)
    expect(html).toContain('Part 1 · Farm p.7')
    expect(html).toContain('Part 2 · Farm p.8')
    expect(html).toContain('Part 3 · Daily Routine p.10')
    expect(html).toContain('Part 4 · Our Planet')
    expect(html).toContain('Part 5 · Literature')
    expect(html).toContain('All parts')
    expect(html).toContain('Training: <strong>Parts 1 + 3</strong> · 20 words')
    for (const count of [11, 11, 9, 13, 6, 50]) expect(html).toContain(`${count} words`)
  })
})
