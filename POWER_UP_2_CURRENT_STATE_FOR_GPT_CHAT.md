# Power Up 2 — current game report for GPT Chat

## What this product is

Power Up 2 is a browser-based English vocabulary learning game for children. Its visual world is **Arcane Steampunk Lightworld**: floating cities are restored by completing vocabulary activities.

The player creates a profile, selects one of ten avatars, learns vocabulary through five game modes, earns rewards, restores cities on a world map, and evolves the avatar as more cities are completed.

## Current content status

| Area | Current state |
|---|---|
| Units | 9 planned units |
| Production vocabulary | Unit 1 only, 50 words across 5 source parts |
| Units 2–9 vocabulary | Intentionally empty; do not invent or add production vocabulary until it is supplied |
| Avatar options | 10 base avatars |
| Avatar evolution art | 4 stages for all 10 avatars |
| Learning modules | 5 per unit |
| World/city visuals | 9 city assets with progressive construction |

### Units

1. Skyport Basics — production vocabulary available.
2. Clockwork City — awaiting vocabulary.
3. Garden of Words — awaiting vocabulary.
4. Crystal Library — awaiting vocabulary.
5. Light Engine Core — awaiting vocabulary.
6. Echo Canyon — awaiting vocabulary.
7. Starfall Observatory — awaiting vocabulary.
8. Dreamspire Tower — awaiting vocabulary.
9. Radiant Citadel — awaiting vocabulary.

### Unit 1 vocabulary

Unit 1 is split into five selectable source parts:

| Part | Source | Words | Count |
|---|---|---|---:|
| 1 | A day on the farm, p. 7 | field, grass, ground, mountain, river, leaves, rock, lake, forest, tractor, flower | 11 |
| 2 | A day at the farm, p. 8 | awake, young, pretty, dirty, wash, naughty, lunch, clean, kitten, puppy, look at | 11 |
| 3 | A day on the farm, p. 10 | wake up, get up, have a shower, have breakfast, get dressed, toothpaste, toothbrush, towel, time to run | 9 |
| 4 | Look after our planet | air, oxygen, factory, pick up rubbish, grow plants, plastic bags, keep someone healthy, important, look after, turn off the lights, recycle, need, other | 13 |
| 5 | A day at the farm: Literature | race, win, fall down, call, come back, move | 6 |

Every word record can contain an English definition, example sentence, accepted forms, spelling-error forms, missing-letter form, source metadata, and an audio path. Russian translations remain in the source vocabulary records for modules that use them; **Code Fighter never displays Russian** and uses English definitions, images, examples, and audio only.

## Learner flow

1. Register a learner name and optional group.
2. Select one of 10 avatars (shown as “Avatar 01” through “Avatar 10”).
3. Enter the world map and open unlocked cities in sequence.
4. Choose which Unit vocabulary parts to train.
5. Complete five activities for a city.
6. Claim a reward chest; the city becomes fully restored at 5/5 modules.
7. Continue to the next city; avatar evolution and achievements unlock from completed cities.

Units without vocabulary show a safe “content pending” state instead of generated exercises.

## Learning modules

### 1. Repair

Learner repairs a damaged English word or phrase using a clue. The module supports definition, sentence, and Russian-meaning clue variants where the vocabulary data provides them.

### 2. Error Hunt

Learner sees one intentionally misspelled English vocabulary word and types the correct spelling.

### 3. Audio Code

Learner listens to the word and either selects it, assembles it from letter tiles, or types it.

### 4. Word Strike

An arcade target game. Learner strikes the correct moving English target using picture, definition, translation, sentence-gap, or audio clues. It includes score, combo, reaction-time bonus, tutorial, sound effects, and adaptive target motion.

### 5. Code Fighter

A magical, non-bloody vocabulary duel against Rival Kael or the Corrupted Construct. Correct answers trigger action states; mistakes trigger an opponent response. The module includes player/enemy HP, combo, accuracy, energy, effects, sound, and keyboard Enter support.

Code Fighter activity sequence:

- Quick Meaning — choose the English word for an English definition.
- Meaning Strike — use image or English definition.
- Heavy Spelling — type the English word.
- Error Defense — repair a misspelled word.
- Audio Counter — listen and type the word.
- Three-Step Combo — meaning, spelling, and context.
- Ultimate Recall — type the English word with no choices.

Combat direction is handled per avatar/opponent frame so fighters face and move toward one another. Code Fighter has a portrait-orientation prompt on phones and tablets; play is designed for landscape.

## Learning and review logic

- A normal module run has 5 tasks.
- Misspelled-word tasks add the word to a weak-word review pool.
- Recognition mistakes add lighter review priority.
- A weak word returns after at least three intervening tasks (review offset: 4).
- Two successful spaced reviews mark a weak word as mastered.
- The scheduler avoids recent repeats and prioritises due weak words.
- Module completion stores attempts, best accuracy, stars, first-completion timestamp, and review-clock progress.
- Star thresholds: 1 star below 60%, 2 stars at 60–79%, 3 stars at 80%+.

## Progression, world, and rewards

### City construction

Each city has six visible states: its initial foundation plus five construction milestones.

0. Foundation.
1. First structure.
2. Small settlement.
3. City forming.
4. Almost complete.
5. City restored.

Each completed module constructs another visual layer of the current city. Completing all five modules unlocks the reward chest and the next city.

### Avatar evolution titles

The canonical titles are:

1. Explorer — initial stage.
2. Apprentice — unlocked after 3 restored cities.
3. Light Engineer — unlocked after 5 restored cities.
4. Legendary Light Fighter — unlocked after 8 restored cities.

The profile displays learner name plus the evolution title, without learner-facing stage numbers.

### Rewards

- A medal for each first module completion: Word Engineer, Error Hunter, Audio Expert, Strike Champion, Code Fighter.
- City chest rewards: Star Coins, Light Shards, Artifact Tokens, and city-specific keys/accessories/decorations.
- Achievements: First Restoration, Crystal Clear, Sharp Aim, Arena Light, City Restorer, World Builder, Lightworld Engineer, World Restored, Memory Keeper.

## Main screens

- Registration/avatar selection.
- World map with progressive city construction and locked/unlocked route.
- Unit hub with vocabulary-part selector, module cards, and city progress.
- Three standard training screens.
- Word Strike range.
- Code Fighter arena and opponent selection.
- City completion/reward chest flow.
- Avatar-evolution reveal overlay.
- Profile, progress dashboard, and settings.

## Technical implementation

- Stack: React, TypeScript, Vite, CSS.
- Progress is stored locally in browser localStorage; no server, account service, or cloud sync is implemented.
- Asset folders include world art, 9 unit/city artworks, character art, 10 base avatars, 10 fighter sprite sheets, avatar evolution art, game backgrounds, effects, and reward sprites.
- Audio hook supports supplied audio assets and graceful failure messaging.
- Desktop Enter advances visible Continue/Next actions; this is supported across games.
- Code Fighter uses responsive safe zones to keep heroes, health HUDs, and task panel from overlapping; portrait mobile/tablet shows a rotate-to-landscape prompt.

## Current verification status

At the time of this report:

- Full automated suite: **20 test files, 95 tests passing**.
- Production build previously completed successfully.

## Important constraints for future changes

1. Do not add or invent production vocabulary for Units 2–9.
2. Preserve the five-module learning structure and weak-word spaced-review logic unless a change is explicitly requested.
3. Keep avatar selection labels as “Avatar 01” … “Avatar 10”; evolution names are ranks, not avatar names.
4. Keep evolution titles exactly: Explorer, Apprentice, Light Engineer, Legendary Light Fighter.
5. Keep Code Fighter learner-facing clues English-only.
6. Do not replace the existing Lightworld visual assets without explicit approval.
7. Any new Unit vocabulary should follow the existing UnitWord schema and include enough English data for the intended activities.

## Suggested ways GPT Chat can help next

- Audit learner-facing English for age appropriateness and consistency.
- Design a vocabulary import template for Units 2–9 without inventing the content.
- Propose teacher/admin workflow requirements, backend/API architecture, or cloud sync strategy.
- Review accessibility, UX, and progression balance.
- Produce a QA checklist for desktop, landscape phone, and landscape tablet.
- Plan analytics events that respect student privacy.
