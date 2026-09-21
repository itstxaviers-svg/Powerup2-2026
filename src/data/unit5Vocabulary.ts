import type { VocabularySourcePart } from '../types/game'
import { vocabularyFromPart, type VocabularySeed } from './vocabularyFactory'

export type Unit5VocabularySourcePart = 1 | 2 | 3
export const unit5VocabularySources: Record<Unit5VocabularySourcePart, { title: string }> = {
  1: { title: 'Animal world. Vocabulary' }, 2: { title: 'Animal world. The animal kingdom' }, 3: { title: 'Animal world. Literature' },
}
const pictures = new Set(['panda','bat','bear','parrot','rabbit','lion','cage','killer whale','dolphin','penguin','above','near','below','opposite','quickly','climb','feather','beak','stripe'])
const seeds = (values: Array<[string,string,string?]>): VocabularySeed[] => values.map(([word, translation, definition]) => ({ word, translation, definition, pictureEligible: pictures.has(word) }))
export const unit5Vocabulary = [
  ...vocabularyFromPart(5, 1, unit5VocabularySources[1].title, seeds([
    ['panda','панда'],['bat','летучая мышь'],['bear','медведь'],['parrot','попугай'],['rabbit','кролик'],['lion','лев'],['cage','клетка'],['killer whale','косатка'],['dolphin','дельфин'],['penguin','пингвин'],['above','над'],['near','рядом'],['below','под'],['opposite','напротив'],['move','двигаться'],['climb','карабкаться'],
  ])),
  ...vocabularyFromPart(5, 2, unit5VocabularySources[2].title, seeds([
    ['kingdom','царство','a very large group of living things'],['meat','мясо'],['seed','семя'],['carnivore','плотоядное животное','an animal that eats meat'],['herbivore','травоядное животное','an animal that eats plants'],['omnivore','всеядное животное','an animal that eats plants and meat'],['stripe','полоса'],['beak','клюв',"a bird's mouth"],['quickly','быстро','fast'],['group','группа'],['mammal','млекопитающее','an animal with hair that feeds milk to its babies'],['feather','перо'],
  ])),
  ...vocabularyFromPart(5, 3, unit5VocabularySources[3].title, seeds([
    ['pouch','сумка; карман'],["What's the matter?",'Что случилось?',"What's the problem?"],['wombat','вомбат'],['brilliant','замечательный','excellent'],['carry','нести'],
  ])),
]
