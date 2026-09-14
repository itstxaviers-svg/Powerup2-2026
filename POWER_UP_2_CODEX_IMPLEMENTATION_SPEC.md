# POWER UP 2 — CODEX IMPLEMENTATION SPEC

> **Purpose:** final implementation instructions for Codex.
> **Project:** Power Up 2 / Level 2 vocabulary game.
> **Visual direction:** **Arcane Steampunk Lightworld**.
> **Primary devices:** desktop, tablet, and especially phone.
> **Content:** 9 Units. Vocabulary for the Units will be added later.
>
> Codex must read this file completely before making structural decisions.

---

# 0. NON-NEGOTIABLE PROJECT DECISIONS

These rules are already approved. Do not reinterpret them.

1. There are **9 Units**.
2. Every Unit contains exactly **5 core training modules**:
   - Repair
   - Error Hunt
   - Audio Code
   - Word Strike
   - Code Fighter
3. **Error Hunt is spelling only.** A word appears with a spelling mistake and the learner must correct the word. It is **NOT grammar**, sentence correction, or “find differences in pictures”.
4. If a learner **writes/spells a word incorrectly**, that word MUST return later in training so it can be learned properly.
5. Wrong words must not repeat immediately in a mechanical loop. They must return after several other tasks and again later until mastered.
6. **Word Strike** is an actual shooter-style vocabulary game, not a static multiple-choice screen.
7. **Code Fighter** is an actual vocabulary-powered battle mechanic, not a quiz with a fighter image in the background.
8. The user chooses one of **10 player avatars**.
9. All 10 avatars have:
   - a base image;
   - an evolution sheet;
   - a 3×3 fighter state sheet.
10. Completing Units must visibly improve the **common world map**: city/island details appear, light up, activate, and become more alive as progress is made.
11. Existing generated assets must be reused. Do not invent a conflicting visual style.
12. Do not add dark cyberpunk visuals. Keep the game bright, magical, airy, steampunk-fantasy, cyan/gold/ivory with limited purple corruption effects for enemies.
13. The phone experience is a priority. Do not force landscape mode. Vertical layouts and scrolling are acceptable where appropriate.
14. Do not waste implementation time or agent limits on repeated unnecessary checks. Test targeted changes, then run one final build/test pass per implementation phase.
15. The Unit word lists will be added later. All gameplay must therefore be data-driven.

---

# 1. HIGH-LEVEL GAME IDEA

The learner enters a floating Arcane Steampunk world where English words power machines, restore cities, activate crystals, and fuel combat techniques.

The learning loop is:

**Learn → Repair → Correct → Listen → React → Fight → Restore the World → Earn Rewards → Grow Avatar**

The game must feel like a real adventure game containing language tasks, not like a worksheet decorated with fantasy art.

---

# 2. RECOMMENDED TECH STACK

Use a lightweight web stack:

- Vite
- React
- TypeScript
- CSS / CSS Modules or project-native styling
- React state + small context/store where needed
- localStorage for this implementation unless an existing project backend is already available
- Web Audio / HTMLAudioElement for vocabulary audio
- requestAnimationFrame / CSS transforms for shooter motion and battle effects

Do **not** add Phaser, Three.js, a physics engine, or another large framework unless a real technical blocker exists.

The code must keep storage behind a small repository/service abstraction so a teacher/backend service can replace localStorage later without rewriting every component.

---

# 3. ASSET PRE-FLIGHT

Project assets are in:

```text
Assets/
```

Before implementation:

### 3.1 Required rename

The current file:

```text
Assets/06-rewards/ChatGPT Image 22 авг. 2026 г., 22_53_10.png
```

must be renamed to:

```text
Assets/06-rewards/reward-set-sheet.png
```

### 3.2 Ignore/remove system files

Do not import or reference:

```text
.DS_Store
__MACOSX/
```

### 3.3 Old visual reference in root

The loose root reference image from the earlier Techno-Ghibli direction is not a production asset. Keep it as reference only or ignore it.

### 3.4 Transparent asset sheets

The user has prepared/replaced transparent-background versions of the following source sheets:

- `word-strike-cannon.png`
- `error-hunt-letter-holders-sheet.png`
- `reward-set-sheet.png`
- `reward-chest-sheet.png`
- `code-fighter-effects-sheet.png`

Use transparent versions for production. Do not reintroduce black, white, or painted sheet backgrounds around isolated objects.

---

# 4. APPROVED ASSET STRUCTURE

Use the existing structure. Do not reorganize it unless necessary for imports.

```text
Assets/
├── 00-reference/
├── 01-world/
├── 02-units/
├── 03-avatars/
│   ├── base/
│   ├── evolution/
│   └── fighter-sheets/
├── 04-characters/
├── 05-games/
│   ├── repair/
│   ├── error-hunt/
│   ├── audio-code/
│   ├── word-strike/
│   └── code-fighter/
├── 06-rewards/
├── 07-effects/
└── 08-background-variants/
```

---

# 5. IMPORTANT ASSET PATHS

## World

```text
Assets/01-world/main-world-background.png
Assets/01-world/world-map-9-islands.png
```

## Units

```text
Assets/02-units/unit-01-skyport-basics.png
Assets/02-units/unit-02-clockwork-city.png
Assets/02-units/unit-03-garden-of-words.png
Assets/02-units/unit-04-crystal-library.png
Assets/02-units/unit-05-light-engine-core.png
Assets/02-units/unit-06-echo-canyon.png
Assets/02-units/unit-07-starfall-observatory.png
Assets/02-units/unit-08-dreamspire-tower.png
Assets/02-units/unit-09-radiant-citadel.png
```

## Player avatars

Base:

```text
Assets/03-avatars/base/avatar-01-base.png
...
Assets/03-avatars/base/avatar-10-base.png
```

Evolution:

```text
Assets/03-avatars/evolution/avatar-01-evolution.png
...
Assets/03-avatars/evolution/avatar-10-evolution.png
```

Fighter sheets:

```text
Assets/03-avatars/fighter-sheets/avatar-01-fighter-sheet.png
...
Assets/03-avatars/fighter-sheets/avatar-10-fighter-sheet.png
```

## Characters

```text
Assets/04-characters/mentor-elara.png
Assets/04-characters/rival-kael.png
Assets/04-characters/rival-kael-fighter-sheet.png
Assets/04-characters/specialist-nova.png
Assets/04-characters/helper-spark.png
Assets/04-characters/corrupted-training-construct.png
Assets/04-characters/corrupted-construct-fighter-sheet.png
```

## Repair

```text
Assets/05-games/repair/repair-machine.png
Assets/05-games/repair/repair-workshop-background.png
```

## Error Hunt

```text
Assets/05-games/error-hunt/error-hunt-spelling-lab.png
Assets/05-games/error-hunt/error-hunt-spelling-analyzer.png
Assets/05-games/error-hunt/error-hunt-effects-sheet.png
Assets/05-games/error-hunt/error-hunt-letter-holders-sheet.png
```

## Audio Code

```text
Assets/05-games/audio-code/audio-code-device.png
Assets/05-games/audio-code/audio-code-chamber.png
```

## Word Strike

```text
Assets/05-games/word-strike/word-strike-cannon.png
Assets/05-games/word-strike/word-strike-range.png
Assets/05-games/word-strike/word-strike-targets-sheet.png
```

## Code Fighter

```text
Assets/05-games/code-fighter/code-fighter-arena.png
```

## Rewards

```text
Assets/06-rewards/reward-chest-sheet.png
Assets/06-rewards/reward-set-sheet.png
```

## Fighter effects

```text
Assets/07-effects/code-fighter-effects-sheet.png
Assets/07-effects/fighter-projectiles-effects-sheet.png
```

---

# 6. USING THE EXISTING ASSET SHEETS

Several generated images are **asset sheets**, not individual files. Keep the original sheet intact.

Use CSS clipping, `object-position`, `background-position`, masks, or a small sprite helper to display the required region.

Do not show the explanatory text from concept sheets as live game UI. Functional labels, tasks, answer text, HP, scores, buttons, and word content must be HTML/CSS so they are dynamic and accessible.

## 6.1 3×3 fighter sheets

Treat all player fighter sheets as a 3×3 grid.

Use this semantic mapping consistently:

```text
row 1: idle/ready | quick attack | heavy attack
row 2: block      | counter      | hit reaction
row 3: ultimate   | victory      | tired/defeat
```

The artwork deliberately gives different avatars different combat styles. Do not force visually identical attacks.

A reusable helper may expose:

```ts
type FighterState =
  | 'idle'
  | 'quickAttack'
  | 'heavyAttack'
  | 'block'
  | 'counter'
  | 'hitReaction'
  | 'ultimate'
  | 'victory'
  | 'defeat';
```

The same component must work with avatars 01–10, Kael, and the Construct.

---

# 7. DATA-DRIVEN UNIT CONTENT

No vocabulary should be hard-coded into game components.

Create a data structure similar to:

```ts
export type UnitWord = {
  id: string;
  word: string;
  translation?: string;
  definition?: string;
  audio?: string;
  image?: string;
  example?: string;
  distractors?: string[];
  typoForms?: string[];
  missingLetterForms?: string[];
};

export type UnitData = {
  id: string;
  number: number;
  title: string;
  words: UnitWord[];
};
```

Create placeholders for all nine Units:

```ts
unit-01 ... unit-09
```

Words will be inserted later without changing component code.

---

# 8. APP FLOW

Recommended flow:

```text
First launch
  ↓
Registration / Profile Setup
  ↓
Choose one of 10 avatars
  ↓
World Map
  ↓
Select Unit
  ↓
Unit Hub with 5 modules
  ↓
Training module
  ↓
Results / weak-word update
  ↓
Next module
  ↓
Complete Unit
  ↓
World restoration animation
  ↓
Reward chest
  ↓
World Map
```

Bottom navigation on mobile may include:

- World
- Progress
- Rewards
- Account
- Settings

Keep it compact.

---

# 9. REGISTRATION AND PLAYER PROFILE

On first launch ask for:

- student name;
- group/class label (text input);
- avatar selection from 10 avatars.

Do not require email/password for the local MVP.

Persist:

```ts
playerId
name
group
avatarId
avatarEvolutionStage
createdAt
```

If a backend/account system already exists in the repository, reuse it instead of duplicating registration.

---

# 10. THE 9 UNITS

Create nine Unit objects/screens:

1. Skyport Basics
2. Clockwork City
3. Garden of Words
4. Crystal Library
5. Light Engine Core
6. Echo Canyon
7. Starfall Observatory
8. Dreamspire Tower
9. Radiant Citadel

Each Unit uses its matching island illustration.

Each Unit contains:

1. Repair
2. Error Hunt
3. Audio Code
4. Word Strike
5. Code Fighter

A completed module can be replayed.

Recommended unlock flow:

```text
Repair → Error Hunt → Audio Code → Word Strike → Code Fighter
```

If desired for teacher use, add a config flag that can unlock all five modules.

---

# 11. CRITICAL LEARNING ENGINE — WRONG WORDS MUST RETURN

This is a mandatory learning rule.

If a learner **writes a word incorrectly**, the game must remember that word and deliberately bring it back later.

This applies to all spelling/free-text interactions, including:

- Repair typing;
- Error Hunt correction;
- Audio Code typing;
- Code Fighter spelling/recall tasks;
- any later free-text vocabulary task.

## 11.1 Store a weak-word record

Example:

```ts
export type WeakWordRecord = {
  unitId: string;
  wordId: string;
  mistakeCount: number;
  lastMistakeAt: number;
  reviewCount: number;
  consecutiveReviewCorrect: number;
  priority: number;
  mastered: boolean;
};
```

## 11.2 Required review behavior

When a word is spelled incorrectly:

1. mark it as a weak word;
2. increase `mistakeCount` and priority;
3. do **not** immediately show exactly the same task again;
4. reinsert the word after approximately **2–5 other tasks**;
5. preferably show it through a **different mechanic**;
6. show it again later in the current session or next module/session;
7. a weak word is considered recovered only after **2 correct review encounters in a row**;
8. if it is wrong again, reset the correct streak and raise its review priority.

Example:

```text
Audio Code: learner types LIBARY instead of LIBRARY
↓
continue with 3 other words
↓
Repair: LIBR_RY
↓
continue
↓
Code Fighter: clue → learner types LIBRARY
↓
if correct twice in later review → mastered
```

This is intentional spaced retrieval, not immediate punishment.

## 11.3 Review task ratio

During normal training aim for approximately:

```text
70–80% current/normal Unit pool
20–30% weak-word review pool
```

When there are no weak words, use 100% normal pool.

Never let weak-word repetition make the game feel stuck on one word.

## 11.4 Persistence

Weak words must survive page reload and reopening the app.

---

# 12. MODULE 1 — REPAIR

## Purpose

Train visual word structure and spelling by restoring missing letters.

Use:

```text
Assets/05-games/repair/repair-workshop-background.png
Assets/05-games/repair/repair-machine.png
```

## Levels

### Repair Level 1 — Single Letter

Example:

```text
br_dge → bridge
```

One missing letter.

### Repair Level 2 — Multiple Damage

Example:

```text
p_ss_ng_r → passenger
```

Two or more missing letters.

### Repair Level 3 — Full Reconstruction

Give meaning/image/audio and require the full word to be typed or assembled.

## Feedback

Correct:
- machine activates;
- cyan/gold repair glow;
- word becomes stable.

Wrong:
- gentle amber/red signal;
- show the correct form after the learner commits the answer;
- add word to Weak Word Review.

No harsh punishment.

---

# 13. MODULE 2 — ERROR HUNT

## ABSOLUTE RULE

**Error Hunt is a spelling task only.**

The player sees **one incorrectly spelled word** and corrects it.

Examples:

```text
LIBARY    → LIBRARY
PASENGER  → PASSENGER
BEUTIFUL  → BEAUTIFUL
FREIND    → FRIEND
```

Do not create grammar questions.
Do not create sentence correction as the main task.
Do not create “find differences” images.
Do not ask which sentence is grammatically correct.

Use:

```text
Assets/05-games/error-hunt/error-hunt-spelling-lab.png
Assets/05-games/error-hunt/error-hunt-spelling-analyzer.png
Assets/05-games/error-hunt/error-hunt-effects-sheet.png
Assets/05-games/error-hunt/error-hunt-letter-holders-sheet.png
```

## Levels

### Level 1 — Wrong Letter

One substituted letter.

```text
frend → friend
```

Learner taps/selects the incorrect position and replaces it.

### Level 2 — Missing Letter

```text
libary → library
```

Learner inserts the missing letter.

### Level 3 — Extra Letter

```text
travell → travel
```

Learner removes the incorrect extra letter.

### Level 4 — Letter Order

```text
freind → friend
```

Learner fixes transposed letters.

### Level 5 — Full Correction

Show the incorrect word without any highlighted hint. Learner types the correct spelling.

## Visual feedback

```text
scan → error detected → correction → success
```

Use the analyzer and correction effects to communicate this sequence.

Any wrong correction adds the target word to Weak Word Review.

---

# 14. MODULE 3 — AUDIO CODE

Use:

```text
Assets/05-games/audio-code/audio-code-chamber.png
Assets/05-games/audio-code/audio-code-device.png
```

The learner hears a vocabulary word and reconstructs it.

## Levels

### Level 1 — Hear and Choose

Play audio and choose the correct written form.

### Level 2 — Hear and Assemble

Play audio and assemble the word from letter tiles.

### Level 3 — Hear and Type

Play audio and type the full word.

### Level 4 — Recall

Play audio with no visual clue. Type the word.

Allow replay. Replaying should not make the learner fail.

A typo in typed levels enters Weak Word Review.

---

# 15. MODULE 4 — WORD STRIKE

This must feel like a lightweight shooter.

Use:

```text
Assets/05-games/word-strike/word-strike-range.png
Assets/05-games/word-strike/word-strike-cannon.png
Assets/05-games/word-strike/word-strike-targets-sheet.png
```

Specialist Nova can introduce/tutorial this module.

## Core loop

1. Show a clue.
2. Spawn 4–6 moving targets containing answer words.
3. Learner taps/clicks the correct target.
4. Cannon fires.
5. Correct target explodes/activates.
6. Score/combo updates.
7. Next task appears.

On phone, tapping a target is the shot. Do not require drag aiming.

## Levels

### Word Strike Level 1 — Picture → Word

Picture cue, shoot correct word.

### Word Strike Level 2 — Definition → Word

Short simple definition, shoot correct word.

### Word Strike Level 3 — Meaning/Translation → Word

Shoot correct English target.

### Word Strike Level 4 — Sentence Gap

Short context with blank, shoot the word that completes meaning.

### Word Strike Level 5 — Audio Target

Hear the word, shoot the correct written target.

## Difficulty progression

Increase gradually through:

- target count;
- target speed;
- distractor similarity;
- path complexity.

Do not make targets so fast that reading becomes impossible.

## Wrong target

Wrong shot:

- break current combo;
- subtle error effect;
- do not remove excessive progress;
- keep learning pace friendly.

Selection errors may optionally increase review priority, but spelling errors are the mandatory weak-word trigger.

---

# 16. MODULE 5 — CODE FIGHTER

This is the main prestige module of every Unit.

Use:

```text
Assets/05-games/code-fighter/code-fighter-arena.png
Assets/03-avatars/fighter-sheets/avatar-XX-fighter-sheet.png
Assets/04-characters/rival-kael-fighter-sheet.png
Assets/04-characters/corrupted-construct-fighter-sheet.png
Assets/07-effects/code-fighter-effects-sheet.png
Assets/07-effects/fighter-projectiles-effects-sheet.png
```

## Core idea

**Knowing the vocabulary causes actual combat actions.**

Two characters face each other.

UI includes:

- player HP;
- opponent HP;
- special-energy meter;
- task area;
- small combo indicator.

Do not make the screen look violent or bloody. Combat is magical/arcane training.

## Battle actions mapped to learning

| Learning action | Battle action |
|---|---|
| recognize meaning | Quick Attack |
| image/meaning recognition | Strike |
| spelling / missing letters | Heavy Attack |
| identify spelling error | Block / Parry |
| audio recognition | Counter |
| 2–3 correct answers | Combo |
| full active recall / typed word | Ultimate |

## Fighter Levels

### Level 1 — Quick Attack

Choose the correct word from meaning/definition.

### Level 2 — Meaning Strike

Image/translation/meaning → choose word.

### Level 3 — Spelling Attack

Repair or type the word to execute a stronger hit.

### Level 4 — Error Defense

Correct a misspelled word to block/parry an incoming attack.

This uses Error Hunt logic: spelling only.

### Level 5 — Audio Counter

Hear the word and identify/type it to counterattack.

### Level 6 — Combo Chain

One target word goes through a short 2–3 step chain, for example:

```text
recognize meaning
→ repair spelling
→ choose in context
```

Completing the chain triggers a combo.

### Level 7 — Special Recall

No answer choices. Give audio, image, translation, or definition and require the learner to type the word.

Correct answer triggers Ultimate.

Any spelling error here goes directly into Weak Word Review.

## Opponents

Recommended use:

- early fights: Rival Kael / friendly sparring;
- challenge fights: Corrupted Training Construct;
- Unit final fight can use Construct or a configured rival.

No character death. Defeated corruption may visually purify or power down.

---

# 17. WORLD MAP RESTORATION / CITY DETAILS APPEAR WITH PROGRESS

This is a mandatory feature.

The common map:

```text
Assets/01-world/world-map-9-islands.png
```

must visibly change as the learner completes modules and Units.

The learner should feel that completing vocabulary training **builds/restores/activates the world**.

## 17.1 Do not edit the bitmap itself

Keep the original map as the base image.

Create a responsive overlay layer using HTML/SVG/CSS positioned by percentages over each island.

Example structure:

```tsx
<WorldMap>
  <img src={worldMap} />
  <IslandProgressOverlay unitId="unit-01" />
  ...
  <IslandProgressOverlay unitId="unit-09" />
</WorldMap>
```

Each island should have a configuration with percentage coordinates relative to the map.

## 17.2 Progressive details within a Unit

Do not wait until 100% completion for every visual change.

Suggested 5-step city activation, one step for each completed module:

### 1/5 modules
- first cyan crystal beacon turns on;
- a few windows light up.

### 2/5 modules
- bridge/path lighting appears;
- small rotating gear/rune activates.

### 3/5 modules
- flags/banners/decorative city detail appears;
- more windows glow.

### 4/5 modules
- small airship/drone/energy stream appears;
- island looks visibly active.

### 5/5 — Unit completed
- full island golden/cyan activation;
- fountain/crystal/central tower pulse;
- celebratory particles;
- completion emblem;
- short restoration animation;
- reward chest becomes available.

These details can be programmed with CSS/SVG/DOM shapes and effects. They do not require new large illustrated background images.

## 17.3 Persistent progress

When the learner returns later, activated details remain visible.

Do not replay the full completion animation on every visit. Play the big reveal only the first time a Unit reaches completion.

## 17.4 Final world state

When all 9 Units are complete:

- all islands are fully active;
- central/world glow is visible;
- add a final celebratory animation;
- unlock a final badge/reward state.

## 17.5 Reduced motion

For users with reduced-motion preference, replace moving particles/airships with static illuminated states.

---

# 18. AVATAR SELECTION AND EVOLUTION

There are 10 selectable avatars.

Display base avatars during registration/profile selection.

## Evolution

Each avatar has a matching evolution sheet containing four visual stages.

Use progression such as:

```text
Stage 1 — Explorer
0–2 Units completed

Stage 2 — Apprentice
3–4 Units completed

Stage 3 — Light Engineer
5–7 Units completed

Stage 4 — Legendary Light Fighter
8–9 Units completed
```

The player must remain the same selected avatar identity.

Do not switch the user to a different base character during progression.

Use clipping/cropping of the existing evolution sheet rather than generating new images.

---

# 19. REWARDS

Use:

```text
Assets/06-rewards/reward-chest-sheet.png
Assets/06-rewards/reward-set-sheet.png
```

The reward sheets already establish the visual language.

Reward categories include:

- Star Coins;
- Energy Capsules;
- Artifact Tokens;
- Light Shards;
- Rune Blueprints;
- Power Crystals;
- Artifact Keys;
- Badges / Medals;
- Avatar Accessories;
- Decorations;
- Boosters;
- Emotes.

## 19.1 Unit reward flow

After all 5 modules of a Unit are completed:

```text
Unit complete
→ world restoration animation
→ reward chest
→ chest opening animation
→ reveal reward(s)
→ return to world
```

## 19.2 Chest rarity

Use the visual chest tiers from the sheet.

A simple first version may derive rarity from average module performance:

```text
Common      < 60%
Uncommon    60–69%
Rare        70–79%
Epic        80–89%
Legendary   90–96%
Mythic      97–100%
```

Do not implement paid loot boxes, purchases, or gambling mechanics. These are earned educational rewards only.

## 19.3 Module medals

Map the five module identities to the existing reward medal ideas:

```text
Repair        → Word Master
Error Hunt    → Error Hunter
Audio Code    → Audio Expert
Word Strike   → Strike Champion
Code Fighter  → Code Fighter
```

---

# 20. PLAYER PROGRESS MODEL

Persist at minimum:

```ts
export type ModuleProgress = {
  completed: boolean;
  bestAccuracy: number;
  attempts: number;
  stars: number;
  firstCompletedAt?: number;
};

export type UnitProgress = {
  modules: Record<ModuleId, ModuleProgress>;
  completed: boolean;
  completedAt?: number;
  rewardClaimed: boolean;
};

export type PlayerProgress = {
  units: Record<string, UnitProgress>;
  weakWords: Record<string, WeakWordRecord>;
  inventory: RewardInventory;
  avatarId: number;
  avatarEvolutionStage: 1 | 2 | 3 | 4;
  worldCompletionCelebrated: boolean;
};
```

Use a versioned storage key, for example:

```text
power-up-2-progress-v1
```

Handle malformed storage gracefully.

---

# 21. RESULTS AND MASTERY

After each module show a compact result screen:

- accuracy;
- stars;
- weak words found;
- words recovered;
- reward/progress gained;
- button to continue.

Do not shame the learner for errors.

If weak words remain, display something like a small “Words to reinforce” section and silently feed them into future training.

The module does not need to trap the learner forever until perfect accuracy. Progress can continue while weak-word review remains active.

---

# 22. RESPONSIVE / MOBILE UX

Phone usability is a hard requirement.

## General

- minimum comfortable tap targets ~44px;
- avoid tiny text over detailed backgrounds;
- apply translucent/solid contrast panels behind task text;
- support portrait phone layouts;
- never rely only on hover;
- no forced landscape mode.

## World Map

On small screens:

- map can be pinch/scroll friendly or placed in a horizontally/vertically navigable viewport;
- Unit cards can also appear below the map as a vertical list.

## Word Strike

- tap directly on target;
- reduce simultaneous targets on narrow screens if necessary;
- keep clue pinned and readable.

## Code Fighter

Phone layout should stack roughly:

```text
HP bars
arena / fighters
language task
answer controls
```

Do not shrink desktop UI until it becomes unreadable.

---

# 23. VISUAL STYLE RULES

Use **Arcane Steampunk Lightworld** consistently.

Core palette:

- deep navy for high-contrast panels;
- brass / warm gold;
- ivory / parchment;
- cyan / crystal blue;
- teal;
- restrained lavender/purple;
- purple corruption only for enemy/error energy;
- gold for completion/special reward moments.

UI:

- rounded or ornate panels;
- thin brass borders;
- cyan crystal highlights;
- subtle glass effects;
- readable typography;
- restrained glow.

Avoid:

- generic cyberpunk neon;
- dark horror;
- red-black aggressive UI;
- excessive visual noise behind task text.

---

# 24. ANIMATION RULES

Animations should make the game feel alive but not slow learning.

Use short durations:

```text
button feedback:     100–180 ms
answer feedback:     250–500 ms
fighter action:      450–900 ms
unit restoration:    1.2–2.0 s
reward chest reveal: 1.0–2.0 s
```

Allow skipping or shortening repeated sequences.

Support `prefers-reduced-motion`.

---

# 25. AUDIO

Provide controls:

- Music on/off
- SFX on/off
- Replay vocabulary audio

Audio Code must work even if autoplay is blocked: playback happens after user interaction.

Do not let background music interfere with spoken vocabulary.

Lower/pause music briefly when target audio plays if needed.

---

# 26. RANDOMIZATION RULES

- Shuffle vocabulary fairly.
- Ensure broad word coverage before repeated normal words.
- Weak-word review is the intentional exception.
- Avoid showing the same target word twice in immediate succession unless the review algorithm specifically schedules it.
- Distractors must come from the current Unit when sensible.
- Avoid impossible/ambiguous distractor sets.

---

# 27. SUGGESTED CODE STRUCTURE

Example:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── world/
│   ├── avatars/
│   └── rewards/
├── games/
│   ├── repair/
│   ├── error-hunt/
│   ├── audio-code/
│   ├── word-strike/
│   └── code-fighter/
├── data/
│   ├── units.ts
│   └── assetManifest.ts
├── learning/
│   ├── weakWordEngine.ts
│   ├── taskScheduler.ts
│   └── scoring.ts
├── progress/
│   ├── progressRepository.ts
│   └── localProgressRepository.ts
├── hooks/
├── styles/
└── types/
```

Recommended reusable components:

```text
WorldMap
IslandProgressOverlay
UnitCard
ModuleCard
AvatarSelector
AvatarEvolutionView
SpriteSheetFrame
FighterCharacter
FighterHud
TaskPrompt
AnswerButtons
SpellingInput
ResultScreen
RewardChestModal
WeakWordIndicator
AudioButton
```

---

# 28. IMPLEMENTATION PHASES FOR CODEX

Do not try to polish the entire game in one uncontrolled pass.

## Phase 1 — Foundation

- Vite/React/TypeScript structure
- routing/screen state
- player registration
- avatar selection
- Unit data placeholders
- progress repository
- world map
- Unit hub
- responsive layout

Run one build after Phase 1.

## Phase 2 — Learning core

- task scheduler
- Weak Word Review engine
- Repair
- Error Hunt
- Audio Code
- results

Add targeted tests for weak-word scheduling and spelling correctness.

Run one build after Phase 2.

## Phase 3 — Action games

- Word Strike
- Code Fighter
- sprite sheet helper
- projectiles/effects
- HP/combo/special logic

Run one build after Phase 3.

## Phase 4 — Progression and polish

- Unit world restoration details
- reward chest
- reward inventory
- avatar evolution
- sound/settings
- reduced motion
- mobile tuning

Run final build/test pass.

## Efficiency rule

Do not repeatedly re-read or lint every unchanged asset/file after tiny edits. Use focused inspection and focused testing, then a complete validation at phase boundaries.

---

# 29. ACCEPTANCE CRITERIA

The implementation is not considered complete unless all of the following are true.

## Core

- [ ] 9 Units exist and load from data.
- [ ] Unit word lists can be populated later without rewriting game components.
- [ ] 5 modules exist inside every Unit.
- [ ] Progress persists after reload.

## Learning

- [ ] Misspelled typed words are stored as weak words.
- [ ] Weak words reappear after other tasks, not instantly.
- [ ] A weak word is reviewed until it is answered correctly twice in review.
- [ ] Review state survives reload.

## Error Hunt

- [ ] Only spelling correction is used.
- [ ] No grammar questions are generated.
- [ ] No picture-difference mechanic is used.

## Word Strike

- [ ] Targets move.
- [ ] Targets contain dynamic words.
- [ ] Correct tap fires/lands an attack.
- [ ] Five difficulty/task levels are implemented.
- [ ] Mobile tapping works well.

## Code Fighter

- [ ] Selected player avatar is visible in battle.
- [ ] All 10 avatar fighter sheets are supported.
- [ ] At least idle, quick, heavy, block, counter, hit, ultimate, victory, defeat states work.
- [ ] Kael and Construct can be opponents.
- [ ] Language task type changes battle action.
- [ ] Fighter has 7 progression levels.

## World

- [ ] The common world map visibly changes as module progress is made.
- [ ] Each Unit has progressive city/island activation details.
- [ ] Unit completion triggers a special restoration state.
- [ ] Restored details persist after reload.
- [ ] All 9 completed Units create a final fully activated world state.

## Avatar

- [ ] 10 base avatars selectable.
- [ ] Avatar choice persists.
- [ ] Evolution stage changes with Unit progress.

## Rewards

- [ ] Unit completion opens reward flow.
- [ ] Reward chest is shown.
- [ ] Rewards persist in inventory/progress.

## UX

- [ ] Desktop works.
- [ ] Tablet works.
- [ ] Portrait phone works.
- [ ] No critical interaction depends on hover.
- [ ] Reduced motion does not break gameplay.

---

# 30. DO NOT DO

Do not:

- hard-code vocabulary inside JSX;
- turn Error Hunt into grammar correction;
- make incorrect words disappear forever after one mistake;
- immediately repeat a wrong word five times in a row;
- create a fake shooter that is only buttons under a background;
- create a fake fighter that is only quiz cards with static character images;
- use the old dark cyberpunk arena direction;
- generate new art to replace approved assets;
- flatten dynamic task text into image files;
- require phone landscape orientation;
- add unnecessary heavy dependencies;
- spend repeated agent cycles on identical checks.

---

# 31. FIRST TASK FOR CODEX

When starting from the current project folder:

1. inspect the repository once;
2. confirm the actual asset paths;
3. perform the reward-set rename if still needed;
4. remove/ignore `.DS_Store` and `__MACOSX`;
5. create the Vite/React/TypeScript application structure if no app exists;
6. implement **Phase 1 only**;
7. run the project/build;
8. report what was implemented and any genuine blockers;
9. continue to Phase 2 only after Phase 1 is stable.

Do not ask for Unit vocabulary yet. Use empty/sample development data isolated in a dev fixture so real vocabulary can be inserted later.

---

# 32. FINAL PRODUCT FEEL

The finished product should communicate:

> **I know the word → I can repair the machine → I can detect the error → I can hear the code → I can hit the target → I can win the duel → my city comes alive.**

The learning mechanic and the world progression must reinforce each other.
