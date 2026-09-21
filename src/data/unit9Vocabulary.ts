import { vocabularyFromPart, type VocabularySeed } from './vocabularyFactory'

export type Unit9VocabularySourcePart = 1 | 2 | 3 | 4

export const unit9VocabularySources: Record<Unit9VocabularySourcePart, { title: string }> = {
  1: { title: 'A big change. Vocabulary 1' },
  2: { title: 'A big change. Vocabulary 2' },
  3: { title: 'A big change. The wonder of the world' },
  4: { title: 'A big change. Literature' },
}

export const unit9PictureTargets = [
  'circus', 'email', 'DVD', 'apartment', 'blankets', 'books',
  'continents', 'Asia', 'Europe', 'North America', 'South America', 'Antarctica', 'Australia', 'Africa',
  'the Grand Canyon', 'the Taj Mahal', 'the Great Barrier Reef', 'Machu Picchu', 'the Victoria Falls', 'Stonehenge', 'coral',
] as const

const pictures = new Set<string>(unit9PictureTargets)
const seed = (word: string, translation: string, definition?: string): VocabularySeed => ({ word, translation, definition, pictureEligible: pictures.has(word) })

export const unit9Vocabulary = [
  ...vocabularyFromPart(9, 1, unit9VocabularySources[1].title, [
    seed('to be surprised about', 'быть удивлённым чем-либо', 'to feel surprise because of something'),
    seed('be frightened of', 'бояться', 'to feel scared of something'),
    seed('be dangerous', 'быть опасным', 'to be able to hurt someone'),
    seed('be difficult', 'быть трудным', 'to be hard to do'),
    seed('be easy', 'быть лёгким', 'to be simple to do'),
    seed('be hungry', 'быть голодным', 'to want or need food'),
    seed('be exciting', 'быть захватывающим', 'to make you feel very interested and happy'),
    seed('be boring', 'быть скучным', 'not interesting'),
    seed('be afraid of', 'бояться', 'to feel fear of something'),
    seed('be tired', 'быть уставшим', 'to need rest'),
    seed('be thirsty', 'хотеть пить', 'to need a drink'),
  ]),
  ...vocabularyFromPart(9, 2, unit9VocabularySources[2].title, [
    seed('circus', 'цирк', 'a show with performers, animals or special acts'),
    seed('email', 'электронное письмо', 'a message sent by computer or phone'),
    seed('DVD', 'DVD-диск', 'a disc used for films or other media'),
    seed('apartment', 'квартира', 'a home that is part of a larger building'),
    seed('adventure', 'приключение', 'an exciting experience'),
    seed('on a world tour', 'в мировом турне', 'travelling to many places around the world'),
    seed('be busy', 'быть занятым', 'to have many things to do'),
    seed('call', 'звонить', 'to speak to someone by phone'),
    seed('text', 'писать сообщение', 'to send a short message by phone'),
    seed('blankets', 'одеяла', 'warm covers used on a bed'),
    seed('books', 'книги', 'written stories or information with pages'),
    seed('travel round the world', 'путешествовать вокруг света', 'to visit many countries around the world'),
    seed('round', 'вокруг; круглый', 'around something or shaped like a circle'),
  ]),
  ...vocabularyFromPart(9, 3, unit9VocabularySources[3].title, [
    seed('continents', 'континенты', 'the very large land areas of the Earth'),
    seed('Asia', 'Азия'), seed('Europe', 'Европа'), seed('North America', 'Северная Америка'), seed('South America', 'Южная Америка'),
    seed('Antarctica', 'Антарктида'), seed('Australia', 'Австралия'), seed('Africa', 'Африка'),
    seed('the Grand Canyon', 'Гранд-Каньон'), seed('the Taj Mahal', 'Тадж-Махал'), seed('the Great Barrier Reef', 'Большой Барьерный риф'),
    seed('Machu Picchu', 'Мачу-Пикчу'), seed('the Victoria Falls', 'водопад Виктория'), seed('Stonehenge', 'Стоунхендж'),
    seed('living things', 'живые существа', 'people, animals and plants that are alive'),
    seed('on the Earth', 'на Земле', 'on our planet'),
    seed('coral', 'коралл', 'a hard sea structure made by tiny sea animals'),
    seed('kind of', 'вид; разновидность', 'one type of something'),
  ]),
  ...vocabularyFromPart(9, 4, unit9VocabularySources[4].title, [
    seed('give a picnic', 'устроить пикник', 'to prepare and share a meal outside'),
    seed('carefully', 'осторожно', 'in a way that avoids mistakes or danger'),
    seed('in the wood', 'в лесу', 'in the forest'),
    seed('hide a clue', 'спрятать подсказку', 'to put a clue where it is hard to see'),
    seed('fantastic', 'замечательный', 'very good or exciting'),
  ]),
]
