import { assets } from '../../data/assets'
import type { TrainingModuleId } from '../../types/game'

export type TrainingIntroCharacterState = 'greeting' | 'listening' | 'wink' | 'pointRight'

export type TrainingIntroConfig = {
  id: TrainingModuleId
  title: string
  characterName: string
  characterClassName: string
  background: string
  assets: Partial<Record<TrainingIntroCharacterState, string>> & Record<'greeting' | 'pointRight', string>
  steps: ReadonlyArray<{ text: string; characterState: TrainingIntroCharacterState }>
  finalState: 'pointRight'
}

export const trainingIntroConfigs: Record<TrainingModuleId, TrainingIntroConfig> = {
  repair: {
    id: 'repair',
    title: 'Repair',
    characterName: 'HELPER SPARK',
    characterClassName: 'is-spark',
    background: assets.repairWorkshop,
    assets: { greeting: assets.repairSparkGreeting, wink: assets.repairSparkWink, pointRight: assets.repairSparkPointRight },
    steps: [
      { text: 'Some letters are damaged!', characterState: 'greeting' },
      { text: 'Use the clue and rebuild the word.', characterState: 'wink' },
      { text: 'Let’s fix it!', characterState: 'wink' },
    ],
    finalState: 'pointRight',
  },
  'error-hunt': {
    id: 'error-hunt',
    title: 'Error Hunt',
    characterName: 'MENTOR ELARA',
    characterClassName: 'is-elara',
    background: assets.errorHuntLab,
    assets: { greeting: assets.errorHuntElaraGreeting, wink: assets.errorHuntElaraWink, pointRight: assets.errorHuntElaraPointRight },
    steps: [
      { text: 'A spelling error is hiding here.', characterState: 'greeting' },
      { text: 'Look closely and find the mistake.', characterState: 'wink' },
      { text: 'Type the correct word!', characterState: 'wink' },
    ],
    finalState: 'pointRight',
  },
  'audio-code': {
    id: 'audio-code',
    title: 'Audio Code',
    characterName: 'AUDIO GUIDE',
    characterClassName: 'is-audio-guide',
    background: assets.audioChamber,
    assets: { greeting: assets.audioGuideGreeting, listening: assets.audioGuideListening, wink: assets.audioGuideWink, pointRight: assets.audioGuidePointRight },
    steps: [
      { text: 'Ready to crack the audio code?', characterState: 'greeting' },
      { text: 'Listen carefully to the word.', characterState: 'listening' },
      { text: 'Remember the sounds and spell what you hear.', characterState: 'wink' },
      { text: 'Time to decode!', characterState: 'wink' },
    ],
    finalState: 'pointRight',
  },
}

export function resolveTrainingIntroAsset(config: TrainingIntroConfig, state: TrainingIntroCharacterState, failedAssets: ReadonlySet<string> = new Set()) {
  const preferred = config.assets[state]
  if (preferred && !failedAssets.has(preferred)) return preferred
  const fallbackOrder: TrainingIntroCharacterState[] = state === 'listening'
    ? ['greeting', 'wink', 'pointRight']
    : state === 'pointRight'
      ? ['wink', 'greeting']
      : ['greeting', 'pointRight', 'wink']
  return fallbackOrder.map((candidate) => config.assets[candidate]).find((asset): asset is string => Boolean(asset && !failedAssets.has(asset))) ?? null
}
