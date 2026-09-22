import type { UnitWord } from '../types/game'
import { vocabularyAudioPath } from '../audio/audioAssetPath'

export type Unit3VocabularySourcePart = 1 | 2 | 3 | 4

export const unit3VocabularySources: Record<Unit3VocabularySourcePart, { title: string }> = {
  1: { title: 'Party time. Vocabulary 1' },
  2: { title: 'Party time. Vocabulary 2' },
  3: { title: 'Party time! People who help us' },
  4: { title: 'Party time! Literature' },
}

type PartWord = Omit<UnitWord, 'sourcePart' | 'sourceTitle' | 'sourcePage' | 'audio'>

const fromPart = (sourcePart: Unit3VocabularySourcePart, word: PartWord): UnitWord => ({
  ...word,
  sourcePart,
  sourceTitle: unit3VocabularySources[sourcePart].title,
  audio: vocabularyAudioPath(3, word.id),
})

export const unit3Vocabulary: UnitWord[] = [
  fromPart(1, { id: 'u3-dentist', word: 'dentist', translation: 'стоматолог', definition: 'a person who looks after your teeth', example: 'The ____ checks my teeth.', typoForms: ['detnist', 'dentst', 'dentiist'] }),
  fromPart(1, { id: 'u3-nurse', word: 'nurse', translation: 'медсестра, медбрат', definition: 'a person who cares for people who are ill', example: 'The ____ helps the doctor.', typoForms: ['nruse', 'nrse', 'nuurse'] }),
  fromPart(1, { id: 'u3-surprise', word: 'surprise', translation: 'что-то, что удивило; сюрприз', definition: 'something you did not expect', example: 'The party was a big ____.', typoForms: ['suprise', 'surprsie', 'surpprise'] }),
  fromPart(1, { id: 'u3-treasure', word: 'treasure', translation: 'сокровище', definition: 'valuable things such as gold or jewels', example: 'The pirates found the ____.', typoForms: ['tresure', 'traesure', 'treaasure'] }),
  fromPart(1, { id: 'u3-invite', word: 'invite', translation: 'приглашать', definition: 'to ask someone to come to an event', example: 'I want to ____ my friends to the party.', typoForms: ['invtie', 'invte', 'inviite'] }),
  fromPart(1, { id: 'u3-only', word: 'only', translation: 'только; единственный', definition: 'no more than one; not any other', example: 'This is the ____ red balloon.', typoForms: ['onyl', 'ony', 'onlly'] }),
  fromPart(1, { id: 'u3-call', word: 'call', translation: 'звонить; называть', definition: 'to speak to someone by phone', example: 'Please ____ me after school.', typoForms: ['clal', 'cal', 'caall'] }),
  fromPart(1, { id: 'u3-dress-up', word: 'dress up', translation: 'наряжаться', definition: 'to put on special clothes', example: 'We ____ for the costume party.', fixedPhrase: true, typoForms: ['dres up', 'drses up', 'dresss up'] }),

  fromPart(2, { id: 'u3-scarecrow', word: 'scarecrow', translation: 'пугало', definition: 'a figure put in a field to frighten birds', example: 'There is a ____ in the field.', typoForms: ['scraecrow', 'scarerow', 'scareecrow'] }),
  fromPart(2, { id: 'u3-beard', word: 'beard', translation: 'борода', definition: 'hair that grows on a man’s chin and cheeks', example: 'The man has a long ____.', typoForms: ['baerd', 'berd', 'beaard'] }),
  fromPart(2, { id: 'u3-blonde', word: 'blonde', translation: 'светловолосый; блондинка', definition: 'having light yellow hair', example: 'She has ____ hair.', typoForms: ['bolnde', 'blnde', 'bloonde'] }),
  fromPart(2, { id: 'u3-curly', word: 'curly', translation: 'кудрявый', definition: 'having hair with lots of round shapes', example: 'He has ____ hair.', typoForms: ['culry', 'crly', 'currly'] }),
  fromPart(2, { id: 'u3-fair', word: 'fair', translation: 'светлый', definition: 'light in colour', example: 'She has ____ hair.', typoForms: ['fiar', 'far', 'faair'] }),
  fromPart(2, { id: 'u3-fat', word: 'fat', translation: 'толстый', definition: 'having a large, round body', example: 'The story has a ____ cat.', typoForms: ['fta', 'ft', 'faat'] }),
  fromPart(2, { id: 'u3-moustache', word: 'moustache', translation: 'усы', definition: 'hair that grows above the upper lip', example: 'The man has a black ____.', typoForms: ['moustcahe', 'moustche', 'mouustache'] }),
  fromPart(2, { id: 'u3-short', word: 'short', translation: 'низкий; короткий', definition: 'not tall or not long', example: 'The boy is ____.', typoForms: ['shrot', 'shrt', 'shoort'] }),
  fromPart(2, { id: 'u3-straight', word: 'straight', translation: 'прямой', definition: 'not curly or bent', example: 'She has long, ____ hair.', typoForms: ['straihgt', 'straght', 'straiight'] }),
  fromPart(2, { id: 'u3-tall', word: 'tall', translation: 'высокий', definition: 'having more height than usual', example: 'The basketball player is very ____.', typoForms: ['tlal', 'tal', 'taall'] }),
  fromPart(2, { id: 'u3-thin', word: 'thin', translation: 'худой; тонкий', definition: 'having little fat on the body', example: 'The character is tall and ____.', typoForms: ['tihn', 'thn', 'thiin'] }),

  fromPart(3, { id: 'u3-a-teacher', word: 'a teacher', translation: 'учитель', definition: 'a person who helps children learn', example: 'Mrs Green is ____.', acceptedForms: ['teacher'], fixedPhrase: true, typoForms: ['a teahcer', 'a teacer', 'a teaccher'] }),
  fromPart(3, { id: 'u3-a-firefighter', word: 'a firefighter', translation: 'пожарный', definition: 'a person who puts out fires', example: 'Alex wants to be ____.', acceptedForms: ['firefighter'], fixedPhrase: true, typoForms: ['a firefihgter', 'a firefigher', 'a firefightter'] }),
  fromPart(3, { id: 'u3-a-dentist', word: 'a dentist', translation: 'стоматолог', definition: 'a person who looks after your teeth', example: 'My aunt is ____.', acceptedForms: ['dentist'], fixedPhrase: true, typoForms: ['a detnist', 'a dentst', 'a dentiist'] }),
  fromPart(3, { id: 'u3-a-doctor', word: 'a doctor', translation: 'врач', definition: 'a person who helps people when they are ill', example: 'My dad is ____.', acceptedForms: ['doctor'], fixedPhrase: true, typoForms: ['a docotr', 'a doctr', 'a docttor'] }),
  fromPart(3, { id: 'u3-a-nurse', word: 'a nurse', translation: 'медсестра, медбрат', definition: 'a person who cares for people who are ill', example: 'Her sister is ____.', acceptedForms: ['nurse'], fixedPhrase: true, typoForms: ['a nruse', 'a nrse', 'a nuurse'] }),
  fromPart(3, { id: 'u3-a-police-officer', word: 'a police officer', translation: 'полицейский', definition: 'a person who keeps people safe and follows the law', example: 'Sam wants to be ____.', acceptedForms: ['police officer'], fixedPhrase: true, typoForms: ['a ploice officer', 'a polce officer', 'a poliice officer'] }),
  fromPart(3, { id: 'u3-fire-station', word: 'fire station', translation: 'пожарная станция', definition: 'the building where people and fire engines wait to help', example: 'The fire engine is at the ____.', fixedPhrase: true, typoForms: ['fier station', 'fre station', 'fiire station'] }),
  fromPart(3, { id: 'u3-bus-station', word: 'bus station', translation: 'автовокзал', definition: 'a place where buses arrive and leave', example: 'We meet at the ____.', fixedPhrase: true, typoForms: ['bus statoin', 'bus staion', 'bus staation'] }),
  fromPart(3, { id: 'u3-school', word: 'school', translation: 'школа', definition: 'a place where children learn', example: 'We go to ____ on weekdays.', typoForms: ['shcool', 'schol', 'schoool'] }),
  fromPart(3, { id: 'u3-hospital', word: 'hospital', translation: 'больница', definition: 'a place where ill or hurt people get help', example: 'The ambulance goes to the ____.', typoForms: ['hosptial', 'hosital', 'hospiital'] }),
  fromPart(3, { id: 'u3-a-farmer', word: 'a farmer', translation: 'фермер', definition: 'a person who grows food or keeps animals', example: 'Ben’s grandfather is ____.', acceptedForms: ['farmer'], fixedPhrase: true, typoForms: ['a famrer', 'a farer', 'a farmmer'] }),
  fromPart(3, { id: 'u3-plants', word: 'plants', translation: 'растения', definition: 'living things that grow in soil', example: 'The farmer waters the ____.', acceptedForms: ['plant'], typoForms: ['plnats', 'plnts', 'plaants'] }),
  fromPart(3, { id: 'u3-restaurant', word: 'restaurant', translation: 'ресторан', definition: 'a place where people buy and eat meals', example: 'We have dinner at a ____.', typoForms: ['restuarant', 'restarant', 'restauraant'] }),

  fromPart(4, { id: 'u3-costume-party', word: 'costume party', translation: 'костюмированная вечеринка', definition: 'a celebration where people wear special clothes', example: 'We are going to a ____.', fixedPhrase: true, typoForms: ['cosutme party', 'costme party', 'costuume party'] }),
  fromPart(4, { id: 'u3-as-a', word: 'as a', translation: 'в качестве', definition: 'in the role of', example: 'Mia comes ____ pirate.', fixedPhrase: true, typoForms: ['sa a', 'as aa', 'as e'] }),
  fromPart(4, { id: 'u3-idea', word: 'idea', translation: 'идея', definition: 'a thought or plan in your mind', example: 'That is a great ____.', typoForms: ['idae', 'ida', 'ideea'] }),
  fromPart(4, { id: 'u3-wear', word: 'wear', translation: 'носить; быть одетым в', definition: 'to have clothes on your body', example: 'I want to ____ my red hat.', typoForms: ['waer', 'wer', 'weear'] }),
  fromPart(4, { id: 'u3-come-in', word: 'come in', translation: 'входить; заходить', definition: 'to enter a room or building', example: 'Please ____ and sit down.', fixedPhrase: true, typoForms: ['cmoe in', 'cme in', 'coome in'] }),
  fromPart(4, { id: 'u3-good-at', word: 'good at', translation: 'хорошо уметь; быть способным к', definition: 'able to do something well', example: 'She is ____ drawing.', fixedPhrase: true, typoForms: ['ogod at', 'god at', 'goood at'] }),
  fromPart(4, { id: 'u3-meet', word: 'meet', translation: 'встречать; знакомиться', definition: 'to see and speak to someone', example: 'Let’s ____ at the party.', typoForms: ['emet', 'met', 'meeet'] }),
  fromPart(4, { id: 'u3-smile', word: 'smile', translation: 'улыбаться; улыбка', definition: 'to make a happy expression with your mouth', example: 'Please ____ for the photo.', typoForms: ['simle', 'smle', 'smiile'] }),
]
