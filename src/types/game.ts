export const moduleIds = ['repair', 'error-hunt', 'audio-code', 'word-strike', 'code-fighter'] as const

export type ModuleId = (typeof moduleIds)[number]

export type VocabularySourcePart = 1 | 2 | 3 | 4 | 5

export type UnitWord = {
  id: string
  word: string
  sourcePart?: VocabularySourcePart
  sourceTitle?: string
  sourcePage?: number
  translation?: string
  definition?: string
  pronunciation?: string
  audio?: string
  image?: string
  pictureEligible?: boolean
  example?: string
  contextForm?: string
  acceptedForms?: string[]
  fixedPhrase?: boolean
  distractors?: string[]
  typoForms?: string[]
  missingLetterForms?: string[]
}

export type UnitData = {
  id: string
  number: number
  title: string
  courseTitle?: string
  words: UnitWord[]
}

export type PlayerProfile = {
  playerId: string
  studentCode?: string
  joinCode?: string
  name: string
  group: string
  avatarId: number
  avatarEvolutionStage: 1 | 2 | 3 | 4
  createdAt: number
}

export type WeakWordRecord = {
  unitId: string
  wordId: string
  mistakeCount: number
  lastMistakeAt: number
  lastSeenAt: number
  reviewCount: number
  consecutiveReviewCorrect: number
  nextReviewAfter: number
  priority: number
  reviewStatus: 'active' | 'mastered'
  mastered: boolean
}

export type TrainingModuleId = Extract<ModuleId, 'repair' | 'error-hunt' | 'audio-code'>

export type TrainingAttempt = {
  unitId: string
  moduleId: TrainingModuleId
  correct: boolean
  isSpellingAttempt: boolean
  isReview: boolean
  weakWords: Record<string, WeakWordRecord>
}

export type ModuleAttempt = {
  unitId: string
  moduleId: ModuleId
  wordId?: string
  correct: boolean
  weakWords: Record<string, WeakWordRecord>
  accuracy: number
  sessionCompleted?: boolean
  sessionWon?: boolean
  advanceReviewClock?: boolean
  variantId?: string
  variantDifficulty?: QuestionDifficulty
}

export type QuestionDifficulty = 1 | 2 | 3

export type QuestionVariantState = {
  lastVariantId: string
  completedEncounters: number
  difficulty: QuestionDifficulty
  lastCorrect: boolean
}

export type ModuleProgress = {
  completed: boolean
  trainedWordIds: string[]
  bestAccuracy: number
  attempts: number
  stars: number
  firstCompletedAt?: number
  variantStateByWordId: Record<string, QuestionVariantState>
}

export type UnitProgress = {
  modules: Record<ModuleId, ModuleProgress>
  completed: boolean
  completedAt?: number
  rewardClaimed: boolean
  restorationCelebrated: boolean
}

export type RewardInventory = Record<string, number>

export type AchievementRecord = {
  unlockedAt: number
}

export type GameSettings = {
  musicEnabled: boolean
  sfxEnabled: boolean
  reducedMotion: boolean
}

export type FightingMilestoneId = 'after-unit-3' | 'after-unit-7' | 'after-unit-9'
export type FightingEnemyId = 'inkbound-knight' | 'prism-wraith' | 'bellkeeper' | 'crownless-marionette' | 'corrupted-archivist'

export type FightingLevelProgress = {
  milestoneId: FightingMilestoneId
  battleIndex: number
  battleRosterIds: string[][]
  passedBattleIndexes: number[]
  attemptCount: number
  bestAccuracy: number
  completed: boolean
  exclusionWordIds: string[]
  seenEnemyIntros: FightingEnemyId[]
}

export type PlayerProgress = {
  units: Record<string, UnitProgress>
  weakWords: Record<string, WeakWordRecord>
  vocabularyPartSelections: Record<string, VocabularySourcePart[]>
  inventory: RewardInventory
  avatarId: number
  avatarEvolutionStage: 1 | 2 | 3 | 4
  acknowledgedEvolutionStage: 1 | 2 | 3 | 4
  reviewClock: number
  wordStrikeTutorialSeen: boolean
  fightingLevels: Record<FightingMilestoneId, FightingLevelProgress>
  worldCompletionCelebrated: boolean
  achievements: Record<string, AchievementRecord>
}

export type SavedGame = {
  schemaVersion: number
  profile: PlayerProfile
  progress: PlayerProgress
  settings: GameSettings
}
