import type { UnitWord } from '../types/game'
import { vocabularyAudioPath } from '../audio/audioAssetPath'

export type VocabularySourcePart = 1 | 2 | 3 | 4 | 5

export const unit1VocabularySources: Record<VocabularySourcePart, { title: string; page?: number }> = {
  1: { title: 'Unit 1. A day on the farm', page: 7 },
  2: { title: 'Unit 1. A day at the farm', page: 8 },
  3: { title: 'Unit 1. A day on the farm', page: 10 },
  4: { title: 'Unit 1. Look after our planet' },
  5: { title: 'Unit 1. A day at the farm. Literature' },
}

type PartWord = Omit<UnitWord, 'sourcePart' | 'sourceTitle' | 'sourcePage' | 'audio'>

const fromPart = (sourcePart: VocabularySourcePart, word: PartWord): UnitWord => {
  const source = unit1VocabularySources[sourcePart]
  return { ...word, sourcePart, sourceTitle: source.title, sourcePage: source.page, audio: vocabularyAudioPath(1, word.id) }
}

export const unit1Vocabulary: UnitWord[] = [
  fromPart(1, { id: 'u1-field', word: 'field', translation: 'поле', definition: 'an area of land on a farm', example: "I'm working in the field.", missingLetterForms: ['f____'], typoForms: ['feild', 'fild', 'fielt'] }),
  fromPart(1, { id: 'u1-grass', word: 'grass', translation: 'трава', definition: 'green plants that cover the ground', example: 'I like playing on the grass.', missingLetterForms: ['g____'], typoForms: ['gras', 'garss', 'gruss'] }),
  fromPart(1, { id: 'u1-ground', word: 'ground', translation: 'земля, поверхность земли', definition: 'the surface of the earth', example: 'Moles live under the ground.', missingLetterForms: ['g_____'], typoForms: ['groun', 'gruond', 'grownd'] }),
  fromPart(1, { id: 'u1-mountain', word: 'mountain', translation: 'гора', definition: 'a very high hill', example: 'I like climbing mountains.', contextForm: 'mountains', acceptedForms: ['mountains'], missingLetterForms: ['m_______'], typoForms: ['mountan', 'moutain', 'mountian'] }),
  fromPart(1, { id: 'u1-river', word: 'river', translation: 'река', definition: 'a long natural flow of water', example: 'I live near the river.', missingLetterForms: ['r____'], typoForms: ['rivar', 'rivre', 'rver'] }),
  fromPart(1, { id: 'u1-leaves', word: 'leaves', translation: 'листья', definition: 'the flat green parts of a tree or plant', example: 'There are a lot of leaves under the tree.', acceptedForms: ['leaf'], missingLetterForms: ['l_____'], typoForms: ['leavs', 'leeves', 'laeves'] }),
  fromPart(1, { id: 'u1-rock', word: 'rock', translation: 'камень, скала', definition: 'a large piece of stone', example: 'The tractor is next to the rock.', missingLetterForms: ['r___'], typoForms: ['rok', 'rcok', 'rokk'] }),
  fromPart(1, { id: 'u1-lake', word: 'lake', translation: 'озеро', definition: 'a large area of water surrounded by land', example: "We can't swim in the lake. It's cold.", missingLetterForms: ['l___'], typoForms: ['laek', 'lke', 'lale'] }),
  fromPart(1, { id: 'u1-forest', word: 'forest', translation: 'лес', definition: 'a large area with many trees', example: 'It can be dangerous in the forest.', missingLetterForms: ['f_____'], typoForms: ['forst', 'foerst', 'forist'] }),
  fromPart(1, { id: 'u1-tractor', word: 'tractor', translation: 'трактор', definition: 'a farm vehicle used for pulling machines', example: 'The tractor is blue.', missingLetterForms: ['t______'], typoForms: ['tracter', 'tracor', 'tracotr'] }),
  fromPart(1, { id: 'u1-flower', word: 'flower', translation: 'цветок', definition: 'the colourful part of a plant', example: 'There are a lot of purple flowers on the ground.', contextForm: 'flowers', acceptedForms: ['flowers'], missingLetterForms: ['f_____'], typoForms: ['flwer', 'folwer', 'flowar'] }),

  fromPart(2, { id: 'u1-awake', word: 'awake', translation: 'бодрствующий, не спящий', definition: 'not sleeping', example: "I'm awake now.", missingLetterForms: ['a____'], typoForms: ['awke', 'awkae', 'awuke'] }),
  fromPart(2, { id: 'u1-young', word: 'young', translation: 'молодой', definition: 'not old', pronunciation: '/jʌŋ/', example: 'The puppy is very young.', missingLetterForms: ['y____'], typoForms: ['yong', 'yuong', 'yung'] }),
  fromPart(2, { id: 'u1-pretty', word: 'pretty', translation: 'красивый, симпатичный', definition: 'nice to look at', example: 'The kitten is very pretty.', missingLetterForms: ['p_____'], typoForms: ['prety', 'pertty', 'pritty'] }),
  fromPart(2, { id: 'u1-dirty', word: 'dirty', translation: 'грязный', definition: 'not clean', example: 'The puppy is dirty.', missingLetterForms: ['d____'], typoForms: ['dirtty', 'ditry', 'derty'] }),
  fromPart(2, { id: 'u1-wash', word: 'wash', translation: 'мыть, мыться', definition: 'to clean something with water', example: 'I wash my hands before lunch.', missingLetterForms: ['w___'], typoForms: ['wsh', 'wsah', 'wesh'] }),
  fromPart(2, { id: 'u1-naughty', word: 'naughty', translation: 'непослушный', definition: 'behaving badly', example: 'The naughty puppy is in the garden.', missingLetterForms: ['n______'], typoForms: ['naugty', 'nughty', 'naugthy'] }),
  fromPart(2, { id: 'u1-lunch', word: 'lunch', translation: 'обед', definition: 'the meal you eat in the middle of the day', example: "We have lunch at one o'clock.", missingLetterForms: ['l____'], typoForms: ['luch', 'lnuch', 'lanch'] }),
  fromPart(2, { id: 'u1-clean', word: 'clean', translation: 'чистый', definition: 'not dirty', example: 'My hands are clean.', missingLetterForms: ['c____'], typoForms: ['clen', 'claen', 'cleen'] }),
  fromPart(2, { id: 'u1-kitten', word: 'kitten', translation: 'котёнок', definition: 'a young cat', example: 'The kitten is sleeping.', missingLetterForms: ['k_____'], typoForms: ['kiten', 'kittne', 'ketten'] }),
  fromPart(2, { id: 'u1-puppy', word: 'puppy', translation: 'щенок', definition: 'a young dog', example: 'The puppy is playing.', missingLetterForms: ['p____'], typoForms: ['pupy', 'puupy', 'pupyp'] }),
  fromPart(2, { id: 'u1-look-at', word: 'look at', translation: 'смотреть на', definition: 'to turn your eyes towards someone or something', example: 'Look at the kitten.', fixedPhrase: true, typoForms: ['lok at', 'loook at', 'look ta'] }),

  fromPart(3, { id: 'u1-wake-up', word: 'wake up', translation: 'просыпаться', definition: 'to stop sleeping', example: "I wake up at seven o'clock.", fixedPhrase: true, typoForms: ['wke up', 'waek up', 'wake upp'] }),
  fromPart(3, { id: 'u1-get-up', word: 'get up', translation: 'вставать', definition: 'to get out of bed', example: 'I get up after I wake up.', fixedPhrase: true, typoForms: ['gt up', 'gte up', 'get upp'] }),
  fromPart(3, { id: 'u1-have-a-shower', word: 'have a shower', translation: 'принимать душ', definition: 'to wash your body in a shower', example: 'I have a shower in the morning.', fixedPhrase: true, typoForms: ['have a shwer', 'have a shwoer', 'have a showar'] }),
  fromPart(3, { id: 'u1-have-breakfast', word: 'have breakfast', translation: 'завтракать', definition: 'to eat your first meal of the day', example: "I have breakfast at eight o'clock.", fixedPhrase: true, typoForms: ['have brekfast', 'have breakfst', 'have braekfast'] }),
  fromPart(3, { id: 'u1-get-dressed', word: 'get dressed', translation: 'одеваться', definition: 'to put on your clothes', example: 'I get dressed after my shower.', fixedPhrase: true, typoForms: ['get dresed', 'get drssed', 'get dressad'] }),
  fromPart(3, { id: 'u1-toothpaste', word: 'toothpaste', translation: 'зубная паста', definition: 'a paste used for cleaning your teeth', example: 'Put some toothpaste on your toothbrush.', missingLetterForms: ['t_________'], typoForms: ['toothpase', 'toothpste', 'toothpaset'] }),
  fromPart(3, { id: 'u1-toothbrush', word: 'toothbrush', translation: 'зубная щётка', definition: 'a small brush used for cleaning your teeth', example: 'I use a toothbrush every morning.', missingLetterForms: ['t_________'], typoForms: ['toothbrsh', 'toothbursh', 'toothbrash'] }),
  fromPart(3, { id: 'u1-towel', word: 'towel', translation: 'полотенце', definition: 'a piece of cloth used for drying yourself', example: 'I dry my hands with a towel.', missingLetterForms: ['t____'], typoForms: ['towl', 'towle', 'tuwel'] }),
  fromPart(3, { id: 'u1-time-to-run', word: 'time to run', translation: 'пора бежать', definition: 'used to say that you need to run now', example: "We're late. It's time to run!", fixedPhrase: true, typoForms: ['time to rn', 'time to ruh', 'time to rnu'] }),

  fromPart(4, { id: 'u1-air', word: 'air', translation: 'воздух', definition: 'what we breathe', example: 'We need clean air to live.', missingLetterForms: ['a__'], typoForms: ['ar', 'ari', 'eir'] }),
  fromPart(4, { id: 'u1-oxygen', word: 'oxygen', translation: 'кислород', definition: 'a gas in the air that people and animals need to breathe', example: 'We can breathe because there is oxygen in the air.', missingLetterForms: ['o_____'], typoForms: ['oxigen', 'oxgen', 'oxgyen'] }),
  fromPart(4, { id: 'u1-factory', word: 'factory', translation: 'фабрика, завод', definition: 'a large building where things are made', example: 'Factories can make the air dirty.', contextForm: 'factories', acceptedForms: ['factories'], missingLetterForms: ['f______'], typoForms: ['factry', 'fcatory', 'factery'] }),
  fromPart(4, { id: 'u1-pick-up-rubbish', word: 'pick up rubbish', translation: 'собирать мусор', definition: 'to collect rubbish from the ground', example: 'To keep the Earth clean, pick up rubbish.', fixedPhrase: true, typoForms: ['pick up rubish', 'pick up rubbihs', 'pick up rabbish'] }),
  fromPart(4, { id: 'u1-grow-plants', word: 'grow plants', translation: 'выращивать растения', definition: 'to help plants grow', example: 'To look after our planet, grow plants.', fixedPhrase: true, typoForms: ['grow plats', 'grow palnts', 'grow plents'] }),
  fromPart(4, { id: 'u1-plastic-bags', word: 'plastic bags', translation: 'пластиковые пакеты', definition: 'bags made of plastic', example: "To look after our planet, don't use plastic bags.", acceptedForms: ['plastic bag'], fixedPhrase: true, typoForms: ['plastic bas', 'plastic bgas', 'plestic bags'] }),
  fromPart(4, { id: 'u1-keep-someone-healthy', word: 'keep someone healthy', translation: 'помогать кому-либо оставаться здоровым', definition: 'to help someone stay healthy', example: 'Clean air and clean water keep us healthy.', contextForm: 'keep us healthy', acceptedForms: ['keep us healthy', 'keep them healthy', 'keep me healthy'], fixedPhrase: true, typoForms: ['keep somone healthy', 'keep someone helthy', 'keep someone haelthy'] }),
  fromPart(4, { id: 'u1-important', word: 'important', translation: 'важный', definition: 'something that matters or is necessary', example: "It's important to look after our planet.", missingLetterForms: ['i________'], typoForms: ['importent', 'imporant', 'improtant'] }),
  fromPart(4, { id: 'u1-look-after', word: 'look after', translation: 'заботиться о', definition: 'to take care of', example: 'We must look after our planet.', fixedPhrase: true, typoForms: ['lok after', 'look afetr', 'look aftar'] }),
  fromPart(4, { id: 'u1-turn-off-the-lights', word: 'turn off the lights', translation: 'выключать свет', definition: 'to switch the lights off', example: "Turn off the lights when you don't need them.", fixedPhrase: true, typoForms: ['turn off the ligths', 'turn off the lghts', 'turn off the lightes'] }),
  fromPart(4, { id: 'u1-recycle', word: 'recycle', translation: 'перерабатывать, использовать повторно', definition: 'to use materials again instead of throwing them away', example: 'We should recycle paper, glass and plastic.', missingLetterForms: ['r______'], typoForms: ['recyle', 'recycel', 'recicle'] }),
  fromPart(4, { id: 'u1-need', word: 'need', translation: 'нуждаться, нужно', definition: 'to require something because it is important', example: 'We need air to live.', missingLetterForms: ['n___'], typoForms: ['ned', 'nead', 'nede'] }),
  fromPart(4, { id: 'u1-other', word: 'other', translation: 'другой, другие', definition: 'different from the one already mentioned', example: 'Ask the other person.', missingLetterForms: ['o____'], typoForms: ['oter', 'otehr', 'othar'] }),

  fromPart(5, { id: 'u1-race', word: 'race', translation: 'гонка, соревнование на скорость', definition: 'a competition to see who is fastest', example: 'The animals are having a race.', missingLetterForms: ['r___'], typoForms: ['rce', 'raec', 'raca'] }),
  fromPart(5, { id: 'u1-win', word: 'win', translation: 'выигрывать', definition: 'to be first or best in a game or competition', example: 'I want to win the race.', missingLetterForms: ['w__'], typoForms: ['wn', 'winn', 'wen'] }),
  fromPart(5, { id: 'u1-fall-down', word: 'fall down', translation: 'падать, упасть, рухнуть', definition: 'to fall to the ground', example: 'Be careful not to fall down.', fixedPhrase: true, typoForms: ['fal down', 'fall dwon', 'fall dwn'] }),
  fromPart(5, { id: 'u1-call', word: 'call', translation: 'звать, звонить', definition: 'to shout to someone or speak to them by phone', example: 'Call me when you get home.', missingLetterForms: ['c___'], typoForms: ['caall', 'clal', 'calll'] }),
  fromPart(5, { id: 'u1-come-back', word: 'come back', translation: 'возвращаться, вернуться', definition: 'to return to a place', example: 'Come back soon.', fixedPhrase: true, typoForms: ['come bak', 'come bakc', 'come beck'] }),
  fromPart(5, { id: 'u1-move', word: 'move', translation: 'двигаться', definition: 'to change position or go to another place', example: "Don't move!", missingLetterForms: ['m___'], typoForms: ['moev', 'mve', 'mova'] }),
]
