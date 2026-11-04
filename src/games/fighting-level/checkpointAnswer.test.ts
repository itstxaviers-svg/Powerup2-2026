import { describe, expect, it } from 'vitest'
import { isAcceptedCheckpointSpelling, normalizeCheckpointSpelling } from './checkpointAnswer'

describe('Checkpoint spelling across all milestones', () => {
  it('ignores capitals, any number of punctuation marks, spaces and hyphens', () => {
    expect(normalizeCheckpointSpelling(' Do you ever...?! ')).toBe('doyouever')
    expect(isAcceptedCheckpointSpelling('DO YOU EVER!!!!!', ['Do you ever...?'])).toBe(true)
    expect(isAcceptedCheckpointSpelling('how often.........????', ['how often...?'])).toBe(true)
    expect(isAcceptedCheckpointSpelling('GROWN UP', ['grown-up'])).toBe(true)
    expect(isAcceptedCheckpointSpelling('cant', ["can't"])).toBe(true)
  })

  it('still requires the correct letters in order and honors accepted forms', () => {
    expect(isAcceptedCheckpointSpelling('MOUNTAINS!!!', ['mountain', 'mountains'])).toBe(true)
    expect(isAcceptedCheckpointSpelling('MOUNTAN!!!', ['mountain', 'mountains'])).toBe(false)
    expect(isAcceptedCheckpointSpelling('protect to a project', ['to protect a project'])).toBe(false)
    expect(isAcceptedCheckpointSpelling('...?!', ['how often...?'])).toBe(false)
  })
})
