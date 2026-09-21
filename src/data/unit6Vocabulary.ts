import type { VocabularySourcePart } from '../types/game'
import { vocabularyFromPart, type VocabularySeed } from './vocabularyFactory'

export type Unit6VocabularySourcePart = 1 | 2 | 3
export const unit6VocabularySources: Record<Unit6VocabularySourcePart, { title: string }> = {
  1: { title: 'Our weather. Vocabulary 1, 2' }, 2: { title: "Our weather. What's the weather like today?" }, 3: { title: 'Our weather. Literature' },
}
const pictures = new Set(['cold','hot','sunny','snow','wind','rain','rainbow','cloud','go out','scientists','thermometer','rain gauge','weather vane'])
const seeds = (values: Array<[string,string,string?]>): VocabularySeed[] => values.map(([word, translation, definition]) => ({ word, translation, definition, pictureEligible: pictures.has(word) }))
export const unit6Vocabulary = [
  ...vocabularyFromPart(6, 1, unit6VocabularySources[1].title, seeds([
    ['cold','холодный'],['hot','жаркий'],['sunny','солнечный'],['snow','снег'],['wind','ветер'],['rain','дождь'],['rainbow','радуга'],['cloud','облако'],['go out','выходить','leave home to go to a social event'],
  ])),
  ...vocabularyFromPart(6, 2, unit6VocabularySources[2].title, seeds([
    ["It's cloudy.",'Облачно.'],["It's sunny.",'Солнечно.'],["It's windy.",'Ветрено.'],["It's snowing.",'Идёт снег.'],["It's raining.",'Идёт дождь.'],['scientists','учёные'],['thermometer','термометр'],['rain gauge','дождемер'],['weather vane','флюгер'],['a kind of','вид чего-то','one type of something'],
  ])),
  ...vocabularyFromPart(6, 3, unit6VocabularySources[3].title, seeds([
    ['puddle','лужа'],['I imagine that','Я представляю, что'],['splash','брызгать'],['have lots of fun','хорошо проводить время'],['slide','скользить'],
  ])),
]
