// Checkpoints assess the spelling of the letters, not punctuation, spacing,
// hyphens, apostrophes or capitalization.
export const normalizeCheckpointSpelling = (value: string): string => value
  .normalize('NFKC')
  .toLocaleLowerCase('en')
  .replace(/[^\p{L}\p{N}]/gu, '')

export function isAcceptedCheckpointSpelling(answer: string, acceptedAnswers: readonly string[]): boolean {
  const normalized = normalizeCheckpointSpelling(answer)
  return normalized.length > 0 && acceptedAnswers.some((candidate) => normalizeCheckpointSpelling(candidate) === normalized)
}
