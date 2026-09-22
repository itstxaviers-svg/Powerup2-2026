import type { UnitWord } from '../types/game'
import { vocabularyAudioPath } from '../audio/audioAssetPath'

export type Unit4VocabularySourcePart = 1 | 2 | 3

export const unit4VocabularySources: Record<Unit4VocabularySourcePart, { title: string }> = {
  1: { title: 'The family at home. Vocabulary 1' },
  2: { title: 'The family at home. Place to live' },
  3: { title: 'The family at home. Machines in our home' },
}

type PartWord = Omit<UnitWord, 'sourcePart' | 'sourceTitle' | 'sourcePage' | 'audio'>

const fromPart = (sourcePart: Unit4VocabularySourcePart, word: PartWord): UnitWord => ({
  ...word,
  sourcePart,
  sourceTitle: unit4VocabularySources[sourcePart].title,
  audio: vocabularyAudioPath(4, word.id),
})

export const unit4Vocabulary: UnitWord[] = [
  fromPart(1, { id: 'u4-parents', word: 'parents', translation: 'родители', definition: 'your mother and father', example: 'My ____ are at home.', pictureEligible: false, typoForms: ['parnts', 'paretns', 'pareents'] }),
  fromPart(1, { id: 'u4-aunt', word: 'aunt', translation: 'тётя', definition: 'your mother’s or father’s sister', example: 'My ____ lives near us.', pictureEligible: false, typoForms: ['ant', 'anut', 'auunt'] }),
  fromPart(1, { id: 'u4-uncle', word: 'uncle', translation: 'дядя', definition: 'your mother’s or father’s brother', example: 'My ____ tells funny stories.', pictureEligible: false, typoForms: ['unle', 'uncel', 'unncle'] }),
  fromPart(1, { id: 'u4-cousin', word: 'cousin', translation: 'двоюродный брат или сестра', definition: 'a child of your aunt or uncle', example: 'I play with my ____ at weekends.', pictureEligible: false, typoForms: ['cousn', 'couisn', 'couusin'] }),
  fromPart(1, { id: 'u4-granddaughter', word: 'granddaughter', translation: 'внучка', definition: 'a girl who is someone’s grandchild', example: 'Their ____ is eight years old.', pictureEligible: false, typoForms: ['granddaugher', 'granddaugther', 'granddaughtter'] }),
  fromPart(1, { id: 'u4-grandson', word: 'grandson', translation: 'внук', definition: 'a boy who is someone’s grandchild', example: 'Their ____ visits every Sunday.', pictureEligible: false, typoForms: ['granson', 'gransdon', 'granddson'] }),
  fromPart(1, { id: 'u4-grandparents', word: 'grandparents', translation: 'бабушка и дедушка', definition: 'the parents of your mother or father', example: 'My ____ live in a small house.', pictureEligible: false, typoForms: ['granparents', 'granpdarents', 'granddparents'] }),
  fromPart(1, { id: 'u4-grown-up', word: 'grown-up', translation: 'взрослые', definition: 'a person who is not a child', example: 'Ask a ____ to help you.', pictureEligible: false, typoForms: ['grwn-up', 'gorwn-up', 'growwn-up'] }),

  fromPart(2, { id: 'u4-basement', word: 'basement', translation: 'подвал', definition: 'a room or floor under the ground', example: 'The old boxes are in the ____.', pictureEligible: true, typoForms: ['basment', 'baesment', 'bassement'] }),
  fromPart(2, { id: 'u4-lift', word: 'lift', translation: 'лифт', definition: 'a machine that carries people up and down a building', example: 'Take the ____ to the fifth floor.', pictureEligible: true, typoForms: ['lft', 'lfit', 'liftt'] }),
  fromPart(2, { id: 'u4-balcony', word: 'balcony', translation: 'балкон', definition: 'a platform outside an upper room', example: 'There are flowers on the ____.', pictureEligible: true, typoForms: ['balcny', 'balocny', 'ballcony'] }),
  fromPart(2, { id: 'u4-first-floor', word: 'first floor', translation: 'первый этаж', definition: 'the level above the ground floor', example: 'My bedroom is on the ____.', pictureEligible: false, fixedPhrase: true, typoForms: ['fist floor', 'frist floor', 'firrst floor'] }),
  fromPart(2, { id: 'u4-second-floor', word: 'second floor', translation: 'второй этаж', definition: 'the level above the first floor', example: 'Their flat is on the ____.', pictureEligible: false, fixedPhrase: true, typoForms: ['seond floor', 'secodn floor', 'seconnd floor'] }),
  fromPart(2, { id: 'u4-roof', word: 'roof', translation: 'крыша', definition: 'the top covering of a building', example: 'The rain is falling on the ____.', pictureEligible: true, typoForms: ['rof', 'rofo', 'rooof'] }),
  fromPart(2, { id: 'u4-upstairs', word: 'upstairs', translation: 'наверх; наверху', definition: 'on or to a higher floor', example: 'Go ____ to your bedroom.', pictureEligible: false, typoForms: ['upstirs', 'upstaris', 'upsttairs'] }),
  fromPart(2, { id: 'u4-downstairs', word: 'downstairs', translation: 'вниз; внизу', definition: 'on or to a lower floor', example: 'Dad is ____ in the kitchen.', pictureEligible: false, typoForms: ['downstirs', 'downstaris', 'downsttairs'] }),
  fromPart(2, { id: 'u4-inside', word: 'inside', translation: 'внутри', definition: 'in the inner part of a place', example: 'Come ____ because it is raining.', pictureEligible: false, typoForms: ['insde', 'insdie', 'insside'] }),
  fromPart(2, { id: 'u4-outside', word: 'outside', translation: 'снаружи; на улице', definition: 'not inside a building', example: 'The children are playing ____.', pictureEligible: false, typoForms: ['outide', 'outsdie', 'outtside'] }),
  fromPart(2, { id: 'u4-stairs', word: 'stairs', translation: 'лестница', definition: 'a set of steps between floors', example: 'Walk carefully on the ____.', pictureEligible: true, typoForms: ['stirs', 'satirs', 'sttairs'] }),

  fromPart(3, { id: 'u4-machines', word: 'machines', translation: 'машины, механизмы', definition: 'devices that make work easier', example: 'These ____ help us at home.', pictureEligible: false, typoForms: ['machnes', 'machiens', 'machhines'] }),
  fromPart(3, { id: 'u4-food-mixer', word: 'food mixer', translation: 'кухонный миксер', definition: 'a device used for mixing food', example: 'We use a ____ to make the cake.', pictureEligible: true, fixedPhrase: true, typoForms: ['food mxer', 'food mixre', 'food mixxer'] }),
  fromPart(3, { id: 'u4-pencil-sharpener', word: 'pencil sharpener', translation: 'точилка для карандашей', definition: 'a device that gives a pencil a sharp point', example: 'I need a ____ for this pencil.', pictureEligible: true, fixedPhrase: true, typoForms: ['pencil sharpeer', 'pencil sharpneer', 'pencil sharppener'] }),
  fromPart(3, { id: 'u4-stapler', word: 'stapler', translation: 'степлер', definition: 'a tool that fastens sheets of paper together', example: 'Use the ____ to join these pages.', pictureEligible: true, typoForms: ['staler', 'stalper', 'stapller'] }),
  fromPart(3, { id: 'u4-dishwasher', word: 'dishwasher', translation: 'посудомоечная машина', definition: 'a machine that washes dishes', example: 'Put the dirty plates in the ____.', pictureEligible: true, typoForms: ['dishwaser', 'dishwahser', 'dishwwasher'] }),
  fromPart(3, { id: 'u4-hairdryer', word: 'hairdryer', translation: 'фен', definition: 'an electrical device that dries hair with hot air', example: 'She dries her hair with a ____.', pictureEligible: true, typoForms: ['hairdyer', 'hiardryer', 'hairddryer'] }),
  fromPart(3, { id: 'u4-smartphone', word: 'smartphone', translation: 'смартфон', definition: 'a phone that can use apps and the internet', example: 'I can take photos with my ____.', pictureEligible: true, typoForms: ['smartphne', 'smartphoen', 'smartpphone'] }),
  fromPart(3, { id: 'u4-camera', word: 'camera', translation: 'фотоаппарат, камера', definition: 'a device used for taking photos', example: 'Smile for the ____.', pictureEligible: true, typoForms: ['camra', 'caemra', 'cammera'] }),
  fromPart(3, { id: 'u4-swing', word: 'swing', translation: 'качели', definition: 'a hanging seat that moves backwards and forwards', example: 'The child is playing on the ____.', pictureEligible: true, typoForms: ['swng', 'swnig', 'swwing'] }),
  fromPart(3, { id: 'u4-bicycle', word: 'bicycle', translation: 'велосипед', definition: 'a vehicle with two wheels', example: 'I ride my ____ to the park.', pictureEligible: true, typoForms: ['bicyle', 'bicycel', 'bicyycle'] }),
  fromPart(3, { id: 'u4-computer', word: 'computer', translation: 'компьютер', definition: 'an electronic device that works with and stores information', example: 'We do our homework on the ____.', pictureEligible: true, typoForms: ['compter', 'comptuer', 'commputer'] }),
  fromPart(3, { id: 'u4-vacuum-cleaner', word: 'vacuum cleaner', translation: 'пылесос', definition: 'a machine that sucks up dust and dirt', example: 'The ____ is in the cupboard.', pictureEligible: true, fixedPhrase: true, typoForms: ['vacum cleaner', 'vacuum claener', 'vacuum cleanner'] }),
  fromPart(3, { id: 'u4-vacuum', word: 'vacuum', translation: 'пылесосить', definition: 'to clean a floor with a vacuum cleaner', example: 'Please ____ the living room.', pictureEligible: false, typoForms: ['vacum', 'vacumu', 'vaccuum'] }),
  fromPart(3, { id: 'u4-washing-machine', word: 'washing machine', translation: 'стиральная машина', definition: 'a machine that washes clothes', example: 'Put your dirty clothes in the ____.', pictureEligible: true, fixedPhrase: true, typoForms: ['washing machne', 'washing mahcine', 'washing macchine'] }),
]
