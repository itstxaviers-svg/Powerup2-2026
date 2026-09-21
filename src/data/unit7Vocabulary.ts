import type { VocabularySourcePart } from '../types/game'
import { vocabularyFromPart, type VocabularySeed } from './vocabularyFactory'

export type Unit7VocabularySourcePart = 1 | 2 | 3 | 4
export const unit7VocabularySources: Record<Unit7VocabularySourcePart, { title: string }> = {
  1: { title: "Let's cook. Vocabulary 1" }, 2: { title: "Let's cook. Vocabulary 2" }, 3: { title: "Let's cook. Plants are delicious" }, 4: { title: "Let's cook. Literature" },
}
const pictures = new Set(['soup','vegetables','table','sandwich','cheese','pasta','bottle','bowl','salad','glass','cup','cook','wash','carry','drop','boil','fry','cry','cut'])
const seeds = (values: Array<[string,string]>): VocabularySeed[] => values.map(([word, translation]) => ({ word, translation, pictureEligible: pictures.has(word) }))
export const unit7Vocabulary = [
  ...vocabularyFromPart(7, 1, unit7VocabularySources[1].title, seeds([
    ['soup','суп'],['vegetables','овощи'],['table','стол'],['sandwich','бутерброд'],['cheese','сыр'],['pasta','макароны'],['bottle','бутылка'],['bowl','миска'],['salad','салат'],['glass','стакан'],['cup','чашка'],
  ])),
  ...vocabularyFromPart(7, 2, unit7VocabularySources[2].title, seeds([
    ['cook','готовить'],['wash','мыть'],['carry','нести'],['drop','ронять'],['boil','варить'],['fry','жарить'],['cry','плакать'],['cut','резать'],
  ])),
  ...vocabularyFromPart(7, 3, unit7VocabularySources[3].title, seeds([
    ['bean plants','бобовые растения'],['pod','стручок'],['lettuce','салат-латук'],['kiwi','киви'],['cauliflower','цветная капуста'],['peas','горох'],['rice','рис'],['spinach','шпинат'],['pepper','перец'],['broccoli','брокколи'],['cotton','хлопок'],['medicines','лекарства'],['flour','мука'],['delicious','вкусный'],
  ])),
  ...vocabularyFromPart(7, 4, unit7VocabularySources[4].title, seeds([
    ['dream','мечта'],['shout','кричать'],['be ill','болеть'],['lovely','прекрасный'],
  ])),
]
