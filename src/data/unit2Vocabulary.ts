import type { UnitWord } from '../types/game'

export type Unit2VocabularySourcePart = 1 | 2 | 3 | 4

export const unit2VocabularySources: Record<Unit2VocabularySourcePart, { title: string }> = {
  1: { title: 'My week. Vocabulary 1' },
  2: { title: 'My week. Vocabulary 2' },
  3: { title: "Days of week. Let's be healthy" },
  4: { title: 'Days of week. Literature' },
}

type PartWord = Omit<UnitWord, 'sourcePart' | 'sourceTitle' | 'sourcePage' | 'audio'>

// Unit 2 does not yet have recorded MP3 files. The canonical audio pipeline
// uses this source marker to pronounce production text with browser speech.
const fromPart = (sourcePart: Unit2VocabularySourcePart, word: PartWord): UnitWord => ({
  ...word,
  sourcePart,
  sourceTitle: unit2VocabularySources[sourcePart].title,
  audio: 'browser-speech',
})

export const unit2Vocabulary: UnitWord[] = [
  fromPart(1, { id: 'u2-monday', word: 'Monday', translation: 'понедельник', definition: 'the first school day of the week', example: 'We have English on ____.', typoForms: ['Mnday', 'Modnay', 'Munday'] }),
  fromPart(1, { id: 'u2-tuesday', word: 'Tuesday', translation: 'вторник', definition: 'the day after Monday', example: 'I go skating on ____.', typoForms: ['Tusday', 'Tuseday', 'Tuesdey'] }),
  fromPart(1, { id: 'u2-wednesday', word: 'Wednesday', translation: 'среда', definition: 'the day between Tuesday and Thursday', example: 'We read comics on ____.', typoForms: ['Wedesday', 'Wednseday', 'Wednesdey'] }),
  fromPart(1, { id: 'u2-thursday', word: 'Thursday', translation: 'четверг', definition: 'the day after Wednesday', example: 'Our music lesson is on ____.', typoForms: ['Thurday', 'Thrusday', 'Thursdey'] }),
  fromPart(1, { id: 'u2-friday', word: 'Friday', translation: 'пятница', definition: 'the last school day before the weekend', example: 'We watch a film on ____.', typoForms: ['Fiday', 'Firday', 'Fridey'] }),
  fromPart(1, { id: 'u2-saturday', word: 'Saturday', translation: 'суббота', definition: 'the first day of the weekend', example: 'I go shopping on ____.', typoForms: ['Satuday', 'Satruday', 'Saturdey'] }),
  fromPart(1, { id: 'u2-sunday', word: 'Sunday', translation: 'воскресенье', definition: 'the day before Monday', example: 'We visit Grandma on ____.', typoForms: ['Snday', 'Sudnay', 'Sundey'] }),
  fromPart(1, { id: 'u2-how-often', word: 'how often...?', translation: 'как часто...?', definition: 'used to ask how many times something happens', example: '____ do you play outside?', fixedPhrase: true, typoForms: ['how ofen...?', 'how otfen...?', 'how oftten...?'] }),
  fromPart(1, { id: 'u2-do-you-ever', word: 'Do you ever...?', translation: 'ты когда-нибудь...?', definition: 'used to ask if something happens at any time', example: '____ listen to music after school?', fixedPhrase: true, typoForms: ['Do you evr...?', 'Do you eevr...?', 'Do you evver...?'] }),
  fromPart(1, { id: 'u2-always', word: 'always', translation: 'всегда', definition: 'every time', example: 'I ____ feed my pet before school.', typoForms: ['alwys', 'alawys', 'allways'] }),
  fromPart(1, { id: 'u2-often', word: 'often', translation: 'часто', definition: 'many times', example: 'We ____ listen to music together.', typoForms: ['ofen', 'otfen', 'offten'] }),
  fromPart(1, { id: 'u2-sometimes', word: 'sometimes', translation: 'иногда', definition: 'on some occasions but not always', example: 'I ____ read a comic at the weekend.', typoForms: ['sometmes', 'sometiems', 'sometimess'] }),
  fromPart(1, { id: 'u2-never', word: 'never', translation: 'никогда', definition: 'not at any time', example: 'I ____ go skating without a helmet.', typoForms: ['nevr', 'neevr', 'nevver'] }),
  fromPart(1, { id: 'u2-talk', word: 'talk', translation: 'разговаривать', definition: 'to speak with someone', example: 'I ____ to my friends after class.', typoForms: ['tak', 'tlak', 'taalk'] }),
  fromPart(1, { id: 'u2-feed', word: 'feed', translation: 'кормить', definition: 'to give food to a person or animal', example: 'Please ____ the cat.', typoForms: ['fed', 'fede', 'faed'] }),
  fromPart(1, { id: 'u2-weekend', word: 'weekend', translation: 'выходные', definition: 'Saturday and Sunday', example: 'We visit the park at the ____.', typoForms: ['wekend', 'wekeend', 'weekand'] }),

  fromPart(2, { id: 'u2-listen-to-music', word: 'listen to music', translation: 'слушать музыку', definition: 'to enjoy songs or other sounds', example: 'I ____ after school.', fixedPhrase: true, typoForms: ['listen to msic', 'listen to muisc', 'listen to mussic'] }),
  fromPart(2, { id: 'u2-write-an-email', word: 'write an email', translation: 'писать электронное письмо', definition: 'to make and send a message online', example: 'I need to ____ to my friend.', fixedPhrase: true, typoForms: ['write an emal', 'write an emial', 'write an emaill'] }),
  fromPart(2, { id: 'u2-go-skating', word: 'go skating', translation: 'кататься на коньках', definition: 'to move on ice using skates', example: 'We ____ on Saturday.', fixedPhrase: true, typoForms: ['go skting', 'go skaitng', 'go skatting'] }),
  fromPart(2, { id: 'u2-read-a-comic', word: 'read a comic', translation: 'читать комикс', definition: 'to enjoy a story told with pictures', example: 'I like to ____ before bed.', fixedPhrase: true, typoForms: ['read a cmic', 'read a cmoic', 'read a commic'] }),
  fromPart(2, { id: 'u2-go-shopping', word: 'go shopping', translation: 'ходить за покупками', definition: 'to visit shops and buy things', example: 'We ____ at the weekend.', fixedPhrase: true, typoForms: ['go shoping', 'go shoppign', 'go shoppping'] }),
  fromPart(2, { id: 'u2-watch-films', word: 'watch films', translation: 'смотреть фильмы', definition: 'to look at movies', example: 'We ____ on Friday evening.', fixedPhrase: true, typoForms: ['watch flms', 'watch fimls', 'watch fillms'] }),
  fromPart(2, { id: 'u2-listen-to-a-cd', word: 'listen to a CD', translation: 'слушать компакт-диск', definition: 'to play music from a compact disc', example: 'We ____ in the car.', fixedPhrase: true, typoForms: ['listen to a CT', 'listen to a DC', 'listen to a CDD'] }),
  fromPart(2, { id: 'u2-watch-a-dvd', word: 'watch a DVD', translation: 'смотреть DVD', definition: 'to watch a film from a disc', example: 'Let\'s ____ tonight.', fixedPhrase: true, typoForms: ['watch a DD', 'watch a DDV', 'watch a DVVD'] }),
  fromPart(2, { id: 'u2-must', word: 'must', translation: 'должен, нужно', definition: 'used when something is necessary', example: 'You ____ wear a helmet.', typoForms: ['mst', 'msut', 'mest'] }),

  fromPart(3, { id: 'u2-helmet', word: 'helmet', translation: 'шлем', definition: 'hard protection worn on your head', example: 'We use h___ to protect our head.', typoForms: ['helmt', 'hemlet', 'hellmet'] }),
  fromPart(3, { id: 'u2-elbow-pads', word: 'elbow pads', translation: 'налокотники', definition: 'soft protection worn over your elbows', example: 'We use e___ p___ to protect our e___s.', fixedPhrase: true, typoForms: ['elbow pds', 'elbow pdas', 'elbow padds'] }),
  fromPart(3, { id: 'u2-knee-pads', word: 'knee pads', translation: 'наколенники', definition: 'soft protection worn over your knees', example: 'We use kn___ p___ to protect our kn____s.', fixedPhrase: true, typoForms: ['knee pds', 'knee pdas', 'knee padds'] }),
  fromPart(3, { id: 'u2-goggles', word: 'goggles', translation: 'защитные очки', definition: 'special glasses that protect your eyes', example: 'We use g___ to protect our eyes.', typoForms: ['gogles', 'goglges', 'goggels'] }),
  fromPart(3, { id: 'u2-gloves', word: 'gloves', translation: 'перчатки', definition: 'things worn to protect or warm your hands', example: 'We use g___ to protect our hands.', typoForms: ['glovs', 'golves', 'glooves'] }),
  fromPart(3, { id: 'u2-be-healthy', word: 'be healthy', translation: 'быть здоровым', definition: 'be well; have good health', example: "I'm not so h_____.", contextForm: 'healthy', acceptedForms: ['healthy'], fixedPhrase: true, typoForms: ['be helthy', 'be haelthy', 'be heallthy'] }),
  fromPart(3, { id: 'u2-accident', word: 'accident', translation: 'несчастный случай, авария', definition: 'something bad that happens without being planned', example: 'I had a car a_____ this morning.', typoForms: ['accdent', 'acciednt', 'acccident'] }),
  fromPart(3, { id: 'u2-warm-up', word: 'warm up', translation: 'разминаться', definition: 'prepare body for exercise', example: 'Before exercising you must w___ u_ your muscles.', fixedPhrase: true, typoForms: ['wram up', 'warrm up', 'werm up'] }),
  fromPart(3, { id: 'u2-muscles', word: 'muscles', translation: 'мышцы', definition: 'body parts that help you move', example: 'Before exercising you must warm up your m_____.', typoForms: ['musles', 'mucsles', 'musscles'] }),
  fromPart(3, { id: 'u2-bones', word: 'bones', translation: 'кости', definition: 'skeletal system', example: 'Our b___ and muscles help us to move.', typoForms: ['boes', 'bnoes', 'boones'] }),
  fromPart(3, { id: 'u2-put-on-sun-cream', word: 'put on sun cream', translation: 'наносить солнцезащитный крем', definition: 'use cream that protects your skin from the sun', example: 'We use s___ c___ to protect our skin.', fixedPhrase: true, typoForms: ['put on sun crem', 'put on sun craem', 'put on sun creamm'] }),
  fromPart(3, { id: 'u2-skin', word: 'skin', translation: 'кожа', definition: 'the outer covering of your body', example: 'We use sun cream to protect our s___.', typoForms: ['sin', 'sikn', 'skiin'] }),

  fromPart(4, { id: 'u2-turn-off-the-alarm-clock', word: 'turn off the alarm clock', translation: 'выключить будильник', definition: 'to stop an alarm clock ringing', example: 'I t___ o__ my a___ c___ and go to sleep.', fixedPhrase: true, typoForms: ['turn off the alarm clok', 'turn off the alarm colck', 'turn off the alarm clockk'] }),
  fromPart(4, { id: 'u2-suddenly', word: 'suddenly', translation: 'внезапно', definition: 'quickly and unexpectedly', example: "S___, my mum's standing over me.", typoForms: ['suddnly', 'suddelny', 'sudddenly'] }),
  fromPart(4, { id: 'u2-blanket', word: 'blanket', translation: 'одеяло', definition: 'a warm cover used on a bed', example: 'You sleep under b___ in the bed.', typoForms: ['blankt', 'blnaket', 'blannket'] }),
  fromPart(4, { id: 'u2-jump-out-of-bed', word: 'jump out of bed', translation: 'вскочить с кровати', definition: 'to get out of bed very quickly', example: 'I j___ o__ o_ b__ and get dressed.', fixedPhrase: true, typoForms: ['jump out of bd', 'jump out of bde', 'jump out of bedd'] }),
  fromPart(4, { id: 'u2-traffic-lights', word: 'traffic lights', translation: 'светофор', definition: 'the red, yellow and green lights which control the traffic', example: 'We were driving and all the l___ were red!', fixedPhrase: true, typoForms: ['trafic lights', 'traffci lights', 'trafffic lights'] }),
  fromPart(4, { id: 'u2-have-a-presentation', word: 'have a presentation', translation: 'выступать с презентацией', definition: 'to protect a project', example: 'You h___ _ p___ at school today.', fixedPhrase: true, typoForms: ['have a presntation', 'have a presnetation', 'have a pressentation'] }),
  fromPart(4, { id: 'u2-consequence', word: 'consequence', translation: 'последствие', definition: 'result', example: 'Every action has its c_____s.', contextForm: 'consequences', acceptedForms: ['consequences'], typoForms: ['consequnce', 'conseqeunce', 'conseequence'] }),
]
