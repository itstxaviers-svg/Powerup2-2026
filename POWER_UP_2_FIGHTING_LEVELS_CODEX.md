# POWER UP 2 — CODEX INSTRUCTION
## Add cumulative Fighting Levels after Units 3, 7 and 9

MODEL TO USE: GPT-5.6 Sol

Continue working in the CURRENT project:

`/Users/sophie/Downloads/Power up 2`

Treat the current filesystem state as the source of truth.

This task adds the NEW cumulative Fighting Level architecture and milestone rules for the 9-Unit course.

IMPORTANT:
- do not rewrite the existing five normal Unit games;
- do not change existing Unit vocabulary;
- do not invent vocabulary for Units that are still empty;
- do not break current Code Fighter;
- this Fighting Level is a SEPARATE milestone battle mode, not a replacement for normal Code Fighter.

The new Fighting Level system must be prepared now so that it automatically becomes usable as Units 3–9 receive real vocabulary later.

---

# 1. FIGHTING LEVEL MILESTONES

Add milestone Fighting Levels:

## After Unit 3

Cumulative review pool:

`Units 1–3`

Battle count:

`1`

Enemy:

`The Inkbound Knight`

Per battle, select approximately:

`1/3 of all eligible vocabulary from Units 1–3`

Only real production vocabulary may be used.

If a later Unit in this range is still empty during development, do not fabricate vocabulary. Build the pool from the real populated Units and expose a clear development warning.

---

## After Unit 7

Cumulative review pool:

`Units 1–7`

Battle count:

`2`

Enemies:

Battle 1:
`Prism Wraith`

Battle 2:
`The Bellkeeper`

Each battle uses approximately:

`1/3 of all eligible vocabulary from Units 1–7`

IMPORTANT:
Words selected for Battle 1 and Battle 2 must NOT repeat.

This means the milestone may test approximately two-thirds of the cumulative vocabulary across the two fights.

Create both battle rosters before the first fight begins so overlap is impossible.

---

## After Unit 9 — SUPER BATTLE

Cumulative review pool:

`Units 1–9`

Battle count:

`2`

Enemies:

Battle 1:
`Crownless Marionette`

Battle 2:
`Corrupted Archivist`

Each battle uses approximately:

`1/3 of all eligible vocabulary from Units 1–9`

Words must NOT repeat between the two fights.

This is the final cumulative review sequence for the course.

---

# 2. ENEMY CONFIGURATION

Create a centralized Fighting Level enemy registry.

Do not scatter milestone/enemy names through JSX.

Suggested identities/slugs:

```text
inkbound-knight
prism-wraith
bellkeeper
crownless-marionette
corrupted-archivist
```

Suggested semantic registry:

```ts
type FightingEnemyId =
  | 'inkbound-knight'
  | 'prism-wraith'
  | 'bellkeeper'
  | 'crownless-marionette'
  | 'corrupted-archivist'
```

Each enemy config should support:

```text
id
displayName
milestone
battleIndex
assetRoot
orientation
visual anchors
action asset mapping
```

Do not generate enemy artwork in code.

If artwork is not present yet, keep the architecture ready and report missing assets. Do not use fake permanent production art.

---

# 3. ENEMY VISUAL CONCEPTS

Use these identities consistently in code/content:

## The Inkbound Knight

Milestone:
after Unit 3

Concept:
a silent empty armored knight powered by glowing magical ink, with a mechanical quill-blade.

## Prism Wraith

Milestone:
after Unit 7, Battle 1

Concept:
a supernatural construct assembled from floating crystal plates, brass rings and a masked luminous core.

## The Bellkeeper

Milestone:
after Unit 7, Battle 2

Concept:
an ancient mechanical guardian with a bell-shaped body, articulated legs and magical resonance rings.

## Crownless Marionette

Milestone:
after Unit 9, Battle 1

Concept:
an elegant corrupted clockwork puppet with porcelain armor, a broken floating crown and magical control threads.

## Corrupted Archivist

Milestone:
after Unit 9, Battle 2 / final boss

Concept:
a corrupted mechanical bird guardian with:
- a long drill-like beak;
- propeller wings instead of normal wings;
- archive/clockwork mechanisms;
- brass + dark metal;
- violet corrupted energy;
- strong final-boss silhouette.

This is the FINAL opponent.

---

# 4. THIS IS A FIRST-PERSON BATTLE

The Fighting Level is NOT the normal side-view Code Fighter composition.

Do not render the learner/player avatar in the arena.

The learner sees the villain directly in front of them.

Composition:

```text
          ENEMY
      centered / upper-middle

   battle FX / attack toward camera

        task / answer UI
```

The enemy should feel like it is attacking the learner directly.

When the learner is hit:
- briefly flash/tint the screen red;
- use a subtle impact shake only if Reduced Motion is not enabled;
- keep it child-appropriate;
- no gore;
- no blood.

Do not add a visible player fighter.

---

# 5. QUESTION TYPES — ONLY TWO

Fighting Levels use typed-answer recall.

Do NOT use the normal written multiple-choice/definition question set.

There are only two task modes:

## A. AUDIO → TYPE ANSWER

Flow:

1. task appears;
2. short readiness delay;
3. audio automatically plays;
4. learner types the English word/phrase;
5. learner may manually press Replay;
6. answer is checked.

IMPORTANT:
- do not show the target spelling before submission;
- audio must not overlap itself;
- Replay cancels/restarts playback cleanly;
- clean audio/timers on task change/unmount;
- reuse the existing project audio mechanics rather than creating a second audio engine.

The countdown must not unfairly consume time before the first audio clue is actually available.

Start/synchronize the answer timer when the clue becomes available.

## B. PICTURE → TYPE ANSWER

Yes, this is supported and must be implemented.

Flow:

1. show ONE real image representing the target vocabulary item;
2. do not show the target word;
3. learner types the English word/phrase;
4. answer is checked.

IMPORTANT:
Use Picture mode ONLY for vocabulary records that have a real, approved picture asset.

Do NOT:
- create generic placeholders;
- use AI-generated runtime placeholders;
- use unrelated decorative art;
- display Picture tasks for words without an eligible picture.

If a selected vocabulary item has no real picture asset, schedule it as AUDIO instead.

The roster still contains vocabulary IDs; task modality can be resolved per item based on available assets.

---

# 6. MODALITY BALANCING

Prefer a mixed battle when picture assets exist.

Target roughly:

```text
Audio: 60–75%
Picture: 25–40%
```

This is a soft distribution, not a hard requirement.

If picture eligibility is low or zero:
- use more Audio;
- never fail the battle generator;
- never fabricate pictures.

Avoid long runs of identical modality when possible.

Do not repeat the same vocabulary item merely to achieve modality balance.

---

# 7. CUMULATIVE VOCABULARY POOL

Build the battle pool from actual vocabulary records in the milestone Unit range.

Examples:

After Unit 3:
all eligible production vocabulary IDs from Units 1, 2 and 3.

After Unit 7:
all eligible production vocabulary IDs from Units 1–7.

After Unit 9:
all eligible production vocabulary IDs from Units 1–9.

Use stable vocabulary IDs.

Do not deduplicate merely by visible string if two Units legitimately contain separate records.

However, if the project's canonical data layer already defines shared lexical identity, preserve that existing model.

---

# 8. HOW TO CALCULATE “ONE THIRD”

Let:

```text
N = number of eligible cumulative vocabulary records
```

Target battle size:

```text
ceil(N / 3)
```

Use the actual cumulative pool size.

Do not hardcode a word count such as 50.

For two-fight milestones:
- create Battle 1 roster of `ceil(N / 3)`;
- remove those IDs from the available pool;
- create Battle 2 roster of up to `ceil(N / 3)` from the remainder;
- no overlap.

If the remaining pool is unexpectedly smaller, use all remaining eligible words and report the data issue in development.

---

# 9. ROSTER SELECTION

Roster selection must be stable for the active battle attempt.

Do not change the target word list because React rerendered.

Create the roster when the battle starts and persist it for that attempt.

Within the roster:
- shuffle task order;
- softly balance across Units so one Unit does not dominate just because it contains more immediately sampled records;
- prefer fair coverage across the milestone's available Units;
- do not repeat a vocabulary ID inside one fight.

For two-fight milestones:
the second fight must exclude every vocabulary ID used in the first fight.

---

# 10. FAILED BATTLE / REPEAT

Win threshold:

`85% correct`

Compute:

```text
accuracy = correctAnswers / totalAnsweredBattleItems
```

Win when:

```text
accuracy >= 0.85
```

Equivalent required correct count:

```text
ceil(totalBattleItems * 0.85)
```

If accuracy is below 85%:
- battle is failed;
- milestone is NOT completed;
- next milestone/battle progression does not unlock through this attempt;
- learner must repeat the fight.

On repeat:
- use the SAME vocabulary roster;
- reshuffle task order;
- modality may be re-resolved only where both valid Audio and Picture versions exist;
- do not replace difficult words with easier new words.

This ensures the repeat actually reviews the failed material.

---

# 11. TWO-BATTLE MILESTONES

After Unit 7 and Unit 9:

Battle 2 becomes available only after Battle 1 is passed at ≥85%.

If Battle 2 is failed:
- repeat Battle 2;
- do NOT force the learner to replay the already-passed Battle 1.

Persist:
- Battle 1 passed state;
- Battle 1 vocabulary roster / exclusion IDs needed for Battle 2;
- current milestone progress.

Do not accidentally regenerate Battle 2 with Battle 1 words after reload.

---

# 12. TIMERS

Use milestone difficulty progression:

## After Unit 3

Answer time:

`10 seconds`

## After Unit 7

Answer time:

`8 seconds`

## After Unit 9 — Super Battle

Answer time:

`6 seconds`

This is per task.

For Audio:
the effective countdown starts/synchronizes only when the first audio clue is available.

Timeout:
- lock input immediately;
- mark incorrect;
- trigger enemy attack / learner-hit feedback;
- continue according to battle choreography.

Do not submit fake empty/spelling answers through normal answer checking on timeout.

---

# 13. ANSWER CHECKING

Reuse the project's canonical text normalization.

Support:
- case-insensitive matching where current project rules allow;
- trimming;
- current punctuation normalization;
- canonical target;
- acceptedForms where present.

Do not add fuzzy spelling acceptance that would incorrectly mark misspellings correct.

For multiword phrases, preserve the same accepted-answer conventions already used in the normal training games.

---

# 14. BATTLE FEEDBACK

Correct answer:
- learner “attacks” the opponent;
- enemy shows hit reaction;
- progress/energy increases.

Wrong answer:
- enemy attacks learner;
- screen briefly flashes red;
- optional small camera impact;
- continue battle.

Timeout:
same consequence as incorrect.

Keep feedback quick enough that a long vocabulary roster does not make the battle exhausting.

Do not make every item play a multi-second cinematic.

---

# 15. ENEMY ACTION STATES

Use the same semantic opponent asset philosophy already established in the project.

Each milestone enemy should support the standard action set:

```text
base
idle
quick-attack
heavy-attack
block
counter
hit
ultimate
victory
defeat
```

Canonical filenames should follow:

```text
<enemy-slug>-base.png
<enemy-slug>-idle.png
<enemy-slug>-quick-attack.png
<enemy-slug>-heavy-attack.png
<enemy-slug>-block.png
<enemy-slug>-counter.png
<enemy-slug>-hit.png
<enemy-slug>-ultimate.png
<enemy-slug>-victory.png
<enemy-slug>-defeat.png
```

Recommended asset roots:

```text
Assets/05-games/fighting-level/opponents/inkbound-knight/
Assets/05-games/fighting-level/opponents/prism-wraith/
Assets/05-games/fighting-level/opponents/bellkeeper/
Assets/05-games/fighting-level/opponents/crownless-marionette/
Assets/05-games/fighting-level/opponents/corrupted-archivist/
```

If the repository already has a better existing milestone-fight asset root, preserve it instead of duplicating hierarchy.

Do not move existing Code Fighter opponent assets.

---

# 16. ORIENTATION

These enemies are centered/front-facing first-person opponents, so do not blindly reuse the side-view Code Fighter mirroring rules.

Use per-enemy presentation metadata.

Support:

```text
scale
x
y
groundY / visual anchor
mirrorX if genuinely necessary
```

Do not globally mirror the whole enemy system.

---

# 17. ENEMY CHOREOGRAPHY

Keep choreography semantic and deterministic.

Possible short response cycle:

Correct:
```text
enemy idle
→ enemy hit
→ return idle
```

Wrong:
```text
enemy quick-attack or heavy-attack
→ screen hit feedback
→ return idle
```

Near end / high-pressure phase:
allow heavier attacks.

Battle victory:
```text
enemy hit
→ defeat
→ victory result
```

Learner failure:
```text
enemy ultimate
→ learner hit feedback
→ enemy victory
→ failed result
```

Do not randomly cycle poses just to show artwork.

---

# 18. FINAL CORRUPTED ARCHIVIST

The final boss after Unit 9 is:

`Corrupted Archivist`

Visual identity must remain:

- mechanical bird;
- long drill-like beak;
- propeller wings;
- corrupted archive machinery;
- violet energy;
- brass/dark-metal body.

Treat it as the strongest final encounter.

It can receive stronger presentation:
- more dramatic entrance;
- stronger ultimate FX;
- slightly stronger screen impact;
- final victory/defeat presentation.

Do not increase answer difficulty beyond the specified 6-second timer and cumulative vocabulary pool rules.

---

# 19. MILESTONE UNLOCKING

The Fighting Level should appear after the relevant curriculum milestone:

- after Unit 3;
- after Unit 7;
- after Unit 9.

Do not require the learner to replay all earlier Units immediately before entering the fight.

Use the current course progression/unlock model.

Because the course data is still being populated:
- architecture must tolerate future Units being empty during development;
- production milestone should only be considered truly playable when required Unit vocabulary exists.

Do not fake completion of missing Units.

---

# 20. PROGRESS PERSISTENCE

Persist Fighting Level state independently from normal Unit module progress.

At minimum track:

```text
milestoneId
battleIndex
battleRosterIds
passedBattleIndexes
attemptCount
bestAccuracy
completed
```

For two-battle milestones also persist the exclusion relationship so Battle 2 never reuses Battle 1 words.

Use the current repository/progress architecture and migration style.

Do not create an unrelated second persistence system.

---

# 21. RESULT SCREEN

After each fight show:

```text
accuracy %
correct / total
PASS / REPEAT
```

PASS when accuracy ≥85%.

If failed:
primary CTA:

`Repeat battle`

If Battle 1 of a two-battle milestone is passed:
primary CTA:

`Next battle`

If final battle is passed:
primary CTA can use the existing course/progression continuation wording.

Keep learner-facing UI in English where the rest of the game is English.

---

# 22. DO NOT USE NORMAL WRITTEN CHALLENGES

This milestone system intentionally tests active recall.

Do NOT use:
- multiple choice definitions;
- translation buttons;
- sentence multiple choice;
- Error Hunt correction;
- normal Code Fighter seven-exchange question structure.

Only:

```text
Audio → typed English answer
Picture → typed English answer
```

---

# 23. PICTURE ELIGIBILITY

Add or reuse explicit picture eligibility per vocabulary record.

A Picture task is legal only when:
- the record has a real approved semantic image;
- the image clearly represents the target;
- the image does not contain the written answer.

If not eligible:
use Audio.

This allows Picture tasks to become more common later without blocking current implementation.

---

# 24. AUDIO ELIGIBILITY

Audio should be the universal fallback modality.

Use:
- existing real audio asset where available;
- the project's existing approved audio/TTS fallback mechanism if one already exists.

Do not silently create broken audio URLs.

Do not show the written answer as an audio fallback.

---

# 25. RESPONSIVE LAYOUT

Design primarily for the same landscape/game environment used by the project.

The first-person opponent should remain:
- centered;
- large;
- fully visible;
- not hidden by task card;
- not hidden by timer.

Keep the task area compact.

Timer should use a separate compact HUD position and must not cover:
- enemy head;
- enemy attacks;
- picture clue;
- input field.

Reuse the recent Code Fighter layout lessons:
do not allow task/timer UI to bury the combat art.

---

# 26. REDUCED MOTION

Under Reduced Motion:
- keep semantic enemy state changes;
- remove large camera shake;
- use a simple red tint instead of dramatic hit motion;
- reduce particles;
- preserve all gameplay/timing rules.

---

# 27. TESTS

Add focused tests for:

## Milestones
- after Unit 3 → 1 fight
- after Unit 7 → 2 fights
- after Unit 9 → 2 fights

## Enemy mapping
- Unit 3 milestone → Inkbound Knight
- Unit 7 Battle 1 → Prism Wraith
- Unit 7 Battle 2 → Bellkeeper
- Unit 9 Battle 1 → Crownless Marionette
- Unit 9 Battle 2 → Corrupted Archivist

## Pooling
- milestone uses correct cumulative Unit range
- one battle size = ceil(N / 3)
- no duplicate word IDs inside a fight
- Unit 7 two rosters do not overlap
- Unit 9 two rosters do not overlap

## Pass rule
- exactly 85% passes
- >85% passes
- <85% fails
- requiredCorrect = ceil(total * 0.85)

## Repeat
- failed battle repeats same vocabulary roster
- order may reshuffle
- Battle 1 does not need replay after already passed

## Modalities
- Audio task hides written answer
- Audio autoplays only after readiness delay
- Replay works
- timer begins fairly with audio readiness
- Picture task uses only picture-eligible records
- no picture → Audio fallback
- picture does not contain written answer via app UI

## Timers
- Unit 3 milestone = 10 sec
- Unit 7 milestone = 8 sec
- Unit 9 milestone = 6 sec

## Persistence
- reload preserves passed first battle
- Battle 2 exclusions survive reload
- roster is stable during attempt

Do not create a huge new test framework.

---

# 28. CURRENT EMPTY FUTURE UNITS

At the moment some later Units may still have empty vocabulary arrays.

Do not invent words to make tests pass.

Use synthetic fixture data ONLY inside unit tests where needed to validate generic milestone logic.

Production data must remain real user-supplied vocabulary only.

---

# 29. IMPLEMENTATION PHASE

Implement now:

1. data types/config;
2. milestone registry;
3. enemy registry;
4. cumulative roster builder;
5. no-repeat two-battle allocation;
6. 85% pass/repeat engine;
7. Audio → Type task;
8. Picture → Type task;
9. timer rules 10/8/6;
10. persistence schema/migration;
11. Fighting Level route/screen shell;
12. result logic;
13. tests.

If final enemy assets are not yet present:
- do not fabricate artwork;
- keep asset paths/config ready;
- use an explicit development-safe missing-asset state;
- report which assets are still required.

---

# 30. DO NOT CHANGE

Do not change:

- Unit 1/2 vocabulary content;
- normal Repair;
- Error Hunt;
- Audio Code;
- Word Strike;
- normal Code Fighter;
- character intros;
- Weak Word Engine;
- normal module coverage;
- city construction;
- rewards;
- avatar evolution;
- existing opponent artwork.

This Fighting Level is an additional cumulative milestone system.

---

# 31. BUILD

Run focused Fighting Level tests plus relevant persistence/progression regression tests.

Then run ONE production build.

Do not perform repeated unrelated builds unless fixing a real failure.

---

# 32. STOP CONDITION

STOP after the Fighting Level architecture is integrated and verified.

Do not add Unit 3–9 vocabulary.

Do not generate enemy images.

Do not redesign other games.

---

# 33. FINAL REPORT

Return a concise report containing:

1. files changed;
2. Fighting Level route/component architecture;
3. milestone registry;
4. enemy registry and mappings;
5. cumulative vocabulary-pool logic;
6. exact one-third calculation;
7. two-battle no-repeat allocation;
8. Audio → Type implementation;
9. Picture → Type implementation;
10. picture eligibility/fallback;
11. timer implementation: 10 / 8 / 6;
12. 85% pass/repeat behavior;
13. failed-battle roster reuse;
14. first-person enemy presentation;
15. red learner-hit feedback;
16. progress persistence/migration;
17. handling of currently empty future Units;
18. tests and results;
19. production build result;
20. exact list of enemy assets still needed, if any;
21. confirmation that existing games, vocabulary, Weak Word, normal module coverage, city progression, rewards and Code Fighter were not changed.
