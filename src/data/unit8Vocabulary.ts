import type { VocabularySourcePart } from '../types/game'
import { vocabularyFromPart, type VocabularySeed } from './vocabularyFactory'

export type Unit8VocabularySourcePart = 1 | 2 | 3 | 4
export const unit8VocabularySources: Record<Unit8VocabularySourcePart, { title: string }> = {
  1: { title: 'Around town. Vocabulary 1' }, 2: { title: 'Around town. Vocabulary 2' }, 3: { title: 'Around town. Road safety' }, 4: { title: 'Around town. Literature' },
}
const pictures = new Set(['map','funfair','city centre','road','station','ticket','car park','go for a ride','in the cafe','square','at the cinema','library','in the hospital','at the shopping centre','at the supermarket','at the sport centre','at the swimming pool','at the market','the bus station','street lamp','litter bin','pedestrian crossing','traffic lights','road sign','bench','walk on the pavement','on the school bus','at the school bus stop','put on seatbelt'])
const seed = (word: string, translation: string, extra: Partial<VocabularySeed> = {}): VocabularySeed => ({ word, translation, pictureEligible: pictures.has(word), ...extra })
export const unit8Vocabulary = [
  ...vocabularyFromPart(8, 1, unit8VocabularySources[1].title, [
    seed('ride','поездка'),seed('map','карта'),seed('funfair','парк аттракционов'),seed('city centre','центр города'),seed('road','дорога',{ id:'u8-road-part-1', allowDuplicateTarget:true }),seed('station','станция'),seed('ticket','билет'),seed('car park','парковка'),seed('plan a trip','планировать поездку'),seed('go for a ride','покататься'),seed('be on holiday','быть на каникулах'),
  ]),
  ...vocabularyFromPart(8, 2, unit8VocabularySources[2].title, [
    seed('found','нашёл',{baseForm:'find'}),seed('lost','потерял',{baseForm:'lose'}),seed('bought','купил',{baseForm:'buy'}),seed('came','пришёл',{baseForm:'come'}),seed('adventure','приключение'),seed('last week','на прошлой неделе'),seed('do a lot of things','делать много всего'),seed('in the cafe','в кафе'),seed('square','площадь'),seed('at the cinema','в кинотеатре'),seed('library','библиотека'),seed('in the hospital','в больнице'),seed('chose','выбрал',{baseForm:'choose'}),seed('at the shopping centre','в торговом центре'),seed('at the supermarket','в супермаркете'),seed('at the sport centre','в спортивном центре'),seed('at the swimming pool','в бассейне'),seed('at the market','на рынке'),seed('the bus station','автобусная станция'),
  ]),
  ...vocabularyFromPart(8, 3, unit8VocabularySources[3].title, [
    seed('street lamp','уличный фонарь'),seed('litter bin','урна'),seed('pedestrian crossing','пешеходный переход'),seed('traffic lights','светофор'),seed('pavement','тротуар'),seed('road','дорога',{ id:'u8-road-part-3', allowDuplicateTarget:true }),seed('road sign','дорожный знак'),seed('bench','скамейка'),seed('walk on the pavement','идти по тротуару'),seed('to cross','переходить'),seed('grown-up','взрослый'),
  ]),
  ...vocabularyFromPart(8, 4, unit8VocabularySources[4].title, [
    seed('on the school bus','в школьном автобусе'),seed('stood','стоял',{baseForm:'stand'}),seed('at the school bus stop','на остановке школьного автобуса'),seed('go on','продолжать'),seed('believe','верить'),seed('put on seatbelt','пристегнуть ремень'),seed('thought','думал',{baseForm:'think'}),
  ]),
]
