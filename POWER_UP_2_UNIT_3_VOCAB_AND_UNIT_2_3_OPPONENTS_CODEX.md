# POWER UP 2 — CODEX INSTRUCTION
## Fill Unit 3 vocabulary + register Unit 2 and Unit 3 Code Fighter opponents

MODEL TO USE: GPT-5.6 Sol

Continue working in the CURRENT project:

`/Users/sophie/Downloads/Power up 2`

Treat the current filesystem state as the source of truth.

This is ONE focused implementation task:

1. populate **Unit 3 — Party time!** with the supplied production vocabulary;
2. make Unit 3 behave exactly like the already working Units 1/2 in training logic;
3. preserve the existing Unit 3 city/world assets and progression visuals;
4. register the already prepared **Unit 2** and **Unit 3** normal Code Fighter opponents;
5. keep Unit 1 and all already working systems unchanged.

Do not invent extra production vocabulary.
Do not change the supplied canonical English targets.
Do not add the Quizlet UI fragments copied with the vocabulary.
Do not change milestone Fighting Levels after Units 3/7/9 in this task.

---

# 1. UNIT 3 IDENTITY

Unit:

`Unit 3`

Learner-facing unit title:

`Party time!`

Existing world/city identity:

`Garden of Words`

IMPORTANT:
Use the project's existing Unit 3 world/city configuration and artwork.

Do NOT rename the city.
Do NOT replace its city image.
Do NOT change map coordinates.
Do NOT change city-construction/reveal mechanics.

This task fills the learning data and connects the normal Unit 3 Code Fighter opponents.

---

# 2. UNIT 3 PARTS

Create/confirm FOUR selectable Unit 3 Parts.

Use the same multi-select Part behaviour already implemented for Units 1/2.

Part selection is a TRAINING FILTER only.

Selecting only one Part must NOT make the whole module complete.

Canonical parts:

```text
Part 1 — Party time. Vocabulary 1
Part 2 — Party time. Vocabulary 2
Part 3 — Party time! People who help us
Part 4 — Party time! Literature
```

Do not invent a Part 5.

---

# 3. UNIT 3 VOCABULARY — PART 1

Source title:

`Unit 3. Party time. Vocabulary 1`

Production entries:

```text
dentist
nurse
surprise
treasure
invite
only
call
dress up
```

User-supplied meaning notes that must be preserved semantically:

```text
surprise — что-то, что удивило
only — только; единственный
```

Count:

`8 source entries`

Canonical English answer strings are exactly the entries above.

Do not replace:
- `dress up`
with another phrase;
- `only`
with a synonym;
- any supplied word with a more advanced alternative.

---

# 4. UNIT 3 VOCABULARY — PART 2

Source title:

`Unit 3. Party time. Vocabulary 2`

Production entries:

```text
scarecrow
beard
blonde
curly
fair
fat
moustache
short
straight
tall
thin
```

Count:

`11 source entries`

Keep British spelling:

`moustache`

Do not silently change it to `mustache`.

For appearance adjectives, preserve the exact lexical targets.

---

# 5. UNIT 3 VOCABULARY — PART 3

Source title:

`Unit 3. Party time! People who help us`

Production entries:

```text
a teacher
a firefighter
a dentist
a doctor
a nurse
a police officer
fire station
bus station
school
hospital
a farmer
plants
restaurant
```

Count:

`13 source entries`

IMPORTANT:
Keep the article in the canonical answer where the user supplied it:

```text
a teacher
a firefighter
a dentist
a doctor
a nurse
a police officer
a farmer
```

Do not strip `a` from those targets unless the existing acceptedForms system additionally allows the article-free version for learner tolerance.

Canonical display form must remain exactly as supplied.

---

# 6. UNIT 3 VOCABULARY — PART 4

Source title:

`Unit 3. Party time! Literature`

Production entries:

```text
costume party
as a
idea
wear
come in
good at
meet
smile
```

User-supplied meaning notes:

```text
as a — в качестве
idea — идея
```

Count:

`8 source entries`

Keep multiword expressions intact:

```text
costume party
as a
come in
good at
```

Do not split them into separate production targets.

---

# 7. TOTAL UNIT 3 SIZE

Raw supplied source-entry count:

```text
Part 1: 8
Part 2: 11
Part 3: 13
Part 4: 8

TOTAL: 40 source entries
```

The source list intentionally contains repeated lexical concepts across Parts:

```text
dentist / a dentist
nurse / a nurse
```

Do NOT silently delete user-supplied source entries.

Follow the existing project data model.

If the current vocabulary schema already has a canonical/shared lexical-identity mechanism:
- use it cleanly;
- retain both source-Part associations;
- do not lose source metadata.

If the current schema treats them as separate stable records:
- keep them as separate stable records;
- do not perform a risky schema redesign just for these duplicates;
- avoid showing both surface-equivalent forms back-to-back in short sessions where possible.

Do not invent additional duplicates.

---

# 8. IGNORE COPY/PASTE NOISE

The following text came from the source website interface and is NOT Unit 3 vocabulary:

```text
Listen as a podcast
bookmark
share ios
more horizontal
```

Do not add any of these to production vocabulary, labels, tasks, metadata, or UI.

The Quizlet/podcast URL is also NOT required for game runtime data.

---

# 9. VOCABULARY RECORD METADATA

Follow the exact vocabulary schema already used by Units 1/2.

Every Unit 3 record must have:
- stable ID;
- canonical English target;
- Unit ID;
- Part/sourcePart;
- source title;
- acceptedForms where genuinely useful;
- task metadata required by the existing games.

No source page number was supplied.

Do NOT invent a page number.

Use `undefined`, `null`, omission, or the project's normal no-page representation.

---

# 10. SUPPORTING LEARNING FIELDS

Use the SAME helper-data structure as Units 1/2.

Where the existing schema requires fields such as:
- Russian meaning;
- simple English definition;
- simple example sentence;
- spelling variants;
- audio text;
- task eligibility;

populate them consistently at the current project level.

Rules:

- English learner-facing definitions/examples must stay age-appropriate and roughly A1/A1+;
- definitions must not simply repeat the target word when that would leak the answer;
- preserve the user-supplied Russian meaning notes semantically;
- do not change the canonical English target;
- do not introduce grammar beyond the level just to make examples sophisticated.

If Unit 1/2 already use a helper generator/data-builder, reuse it rather than building a second parallel system.

---

# 11. REPAIR — UNIT 3

Unit 3 Repair behaves exactly like the currently fixed Repair game.

Use the existing canonical rules:

- learner reconstructs the FULL word/phrase;
- about 30% of letters are damaged/hidden, staying within the current 20–40% rule;
- prefer internal letters first;
- keep at least one visible letter in every lexical word;
- spaces/apostrophes/punctuation remain visible;
- long phrases wrap only between words;
- exactly ONE clue;
- clue may be definition/example/Russian meaning according to existing scheduler;
- canonical target + acceptedForms only;
- Error Hunt typo variants must NOT leak into Repair;
- task changes remain deterministic for a given generated task.

Do not show technical concept-sheet art in gameplay.

---

# 12. ERROR HUNT — UNIT 3

Unit 3 Error Hunt is SPELLING ONLY.

No grammar correction.
No punctuation correction.
No general proofreading.

For each eligible target, prepare/use plausible learner-style spelling-error variants according to the current engine.

Preferred typo types:
- internal omission;
- adjacent transposition;
- wrong internal vowel/consonant;
- duplicate letter.

Avoid obviously bad first-letter deletion when possible.

For multiword targets:
- preserve word order;
- preserve grammar;
- corrupt spelling in only one component where practical.

Use normal lowercase display.

Do not create spelling tasks for forms where the current engine marks the item unsuitable.

---

# 13. AUDIO CODE — UNIT 3

Use the already fixed Audio Code implementation.

Requirements:

- answer text hidden before response;
- no visible canonical spelling leak;
- shuffled letters if letter tiles are used;
- typed mode starts blank;
- audio begins after the project's current short readiness delay;
- manual Replay remains available;
- clean playback/timers on task change and unmount;
- do not overlap multiple audio playback instances.

Use the project's current audio asset/TTS policy.

Do not silently display the written target when audio is unavailable.

---

# 14. WORD STRIKE — UNIT 3

Do NOT redesign Word Strike.

Keep the already approved current production design:

Only active task types:

```text
SPELLING STRIKE
AUDIO STRIKE
```

## Spelling Strike

For one canonical target:
- exactly 3 targets;
- 1 correct;
- 2 plausible spelling-error forms;
- target placement randomized.

## Audio Strike

- delayed autoplay after task is ready;
- replay button;
- repeat behaviour follows the current project implementation;
- 3 correctly spelled vocabulary options;
- only one matches the audio;
- no answer leak.

Keep:
- transparent circular magical targets;
- current arena;
- current lower-right first-person cannon;
- cannon NOT mirrored;
- projectile originates from visible muzzle.

Unit 3 vocabulary must flow through the same scheduler.

---

# 15. NORMAL CODE FIGHTER — UNIT 3

Do NOT replace normal Code Fighter with the milestone Fighting Level.

Normal Unit 3 Code Fighter must use the same existing seven-exchange learning battle architecture currently used by normal Units.

Preserve:
- HP;
- combo;
- accuracy;
- energy;
- audio gating;
- semantic action states;
- result flow;
- answer timing logic;
- Reduced Motion behaviour.

Only connect the correct Unit 3 opponents and Unit 3 vocabulary.

---

# 16. UNIT 3 COVERAGE / COMPLETION

Use the same canonical module-coverage rule already implemented.

A ~5-task session is NOT module completion.

Each module tracks UNIQUE trained vocabulary IDs.

A Unit 3 module completes only after all eligible Unit 3 vocabulary records required by that module have been encountered/answered according to the existing coverage engine.

Rules:

- Part selection is only a session filter;
- selected Parts do not reduce whole-Unit completion requirements;
- wrong answer counts as trained/exposed for coverage;
- unanswered/abandoned task does not count;
- repeats do not increase unique coverage;
- medals only on true full module completion;
- chest/Unit completion only after true module completion conditions.

Do not reintroduce “5 tasks = complete”.

---

# 17. WEAK WORD — UNIT 3

Unit 3 must participate in the existing persistent Weak Word engine.

Keep current canonical rules:

- spelling mistakes = higher priority;
- recognition mistakes = lower priority;
- weak word returns only after the current spacing delay;
- immediate correction does not count as mastery;
- two later spaced successes required for mastery;
- current Part filter applies to the active training session;
- underlying weak-word state remains Unit-wide.

Do not build a separate Unit 3 weak-word store.

---

# 18. UNIT 3 CITY PROGRESSION

Preserve the existing city-construction system.

City:

`Garden of Words`

Construction stage remains derived from FULLY completed modules only:

```text
0 completed modules -> foundation
1 -> stage 1
2 -> stage 2
3 -> stage 3
4 -> stage 4
5 -> city restored
```

Do not advance city construction after a short 5-word session.

Do not change the current Unit 3 city art/reveal assets.

---

# 19. UNIT 2 NORMAL CODE FIGHTER OPPONENTS

Unit 2 must resolve its normal Code Fighter opponents as follows:

## Rival role

`Lady Gearveil`

Asset folder:

`Assets/05-games/code-fighter/opponents/unit-02-lady-gearveil/`

Expected files:

```text
unit-02-gearveil-base.png
unit-02-gearveil-idle.png
unit-02-gearveil-quick-attack.png
unit-02-gearveil-heavy-attack.png
unit-02-gearveil-block.png
unit-02-gearveil-counter.png
unit-02-gearveil-hit.png
unit-02-gearveil-ultimate.png
unit-02-gearveil-victory.png
unit-02-gearveil-defeat.png
```

IMPORTANT:
Lady Gearveil artwork faces the wrong direction in the source set.

Keep the existing centralized:

```text
mirrorX: true
```

for Lady Gearveil.

Mirror the CHARACTER ART layer only.

Do not mirror:
- arena;
- UI;
- HUD;
- attack motion wrapper;
- projectiles.

## Boss role

`Chronofang`

Asset folder:

`Assets/05-games/code-fighter/opponents/unit-02-chronofang/`

Expected files:

```text
unit-02-chronofang-base.png
unit-02-chronofang-idle.png
unit-02-chronofang-quick-attack.png
unit-02-chronofang-heavy-attack.png
unit-02-chronofang-block.png
unit-02-chronofang-counter.png
unit-02-chronofang-hit.png
unit-02-chronofang-ultimate.png
unit-02-chronofang-victory.png
unit-02-chronofang-defeat.png
```

Chronofang already faces the correct direction.

Use:

```text
mirrorX: false
```

Preserve existing Unit 2 role-based timing/choreography.

Do not globally replace Unit 1 opponents.

---

# 20. UNIT 3 NORMAL CODE FIGHTER OPPONENTS

Register the new Unit 3 normal Code Fighter opponents.

## Rival role — ROSECLOCK DUCHESS

Display name:

`Roseclock Duchess`

Asset folder:

`Assets/05-games/code-fighter/opponents/roseclock-duchess/`

Expected files:

```text
roseclock-duchess-base.png
roseclock-duchess-idle.png
roseclock-duchess-quick-attack.png
roseclock-duchess-heavy-attack.png
roseclock-duchess-block.png
roseclock-duchess-counter.png
roseclock-duchess-hit.png
roseclock-duchess-ultimate.png
roseclock-duchess-victory.png
roseclock-duchess-defeat.png
```

Use the corrected production versions:
- corrected left-facing block art;
- corrected less-sexualized defeat art with transparent background.

Do not use older rejected variants if both old and corrected files remain elsewhere.

The production registry must point only to the canonical filenames above.

Orientation:
the prepared production art is intended to face toward the player from the RIGHT side of the arena.

Default:

```text
mirrorX: false
```

However, inspect the actual canonical PNGs once during integration.

If the whole canonical set is consistently wrong-facing, fix it centrally with one `mirrorX` metadata value.

Do NOT add per-action random mirroring hacks.

## Boss role — THORNBOUND ARCHIVIST

Display name:

`Thornbound Archivist`

Asset folder:

`Assets/05-games/code-fighter/opponents/thornbound-archivist/`

Expected files:

```text
thornbound-archivist-base.png
thornbound-archivist-idle.png
thornbound-archivist-quick-attack.png
thornbound-archivist-heavy-attack.png
thornbound-archivist-block.png
thornbound-archivist-counter.png
thornbound-archivist-hit.png
thornbound-archivist-ultimate.png
thornbound-archivist-victory.png
thornbound-archivist-defeat.png
```

Default:

```text
mirrorX: false
```

Inspect actual canonical art once to confirm orientation.

Use centralized anchor metadata.

Do not alter the PNG files.

---

# 21. UNIT-AWARE NORMAL CODE FIGHTER RESOLUTION

Normal Code Fighter must remain Unit-aware.

Expected mapping:

```text
UNIT 1
rival -> existing Unit 1 rival
boss  -> existing Unit 1 boss

UNIT 2
rival -> Lady Gearveil
boss  -> Chronofang

UNIT 3
rival -> Roseclock Duchess
boss  -> Thornbound Archivist
```

Use/extend one centralized opponent resolver/registry.

Conceptually:

```ts
resolveOpponentForUnit(unitId, role)
```

Do not scatter `unitId === 2` / `unitId === 3` conditions throughout JSX.

Do not replace milestone Fighting Level enemies here.

---

# 22. OPPONENT ACTION MAPPING

For all Unit 2/3 normal Code Fighter opponents, resolve semantic actions centrally:

```text
idle
quickAttack
heavyAttack
block
counter
hit
ultimate
victory
defeat
```

`base` may remain reference/anchor art if runtime does not require it.

Do not randomly switch art.

Keep semantic battle choreography.

---

# 23. RESULT / ULTIMATE RULE

Preserve the currently approved normal Code Fighter enemy-result architecture.

If the existing normal Code Fighter reserves `ultimate.png` as special enemy-victory result art:

- continue doing so;
- normal in-battle final super uses heavy-attack pose + existing super FX;
- player defeat;
- enemy ordinary victory pose briefly;
- result screen;
- delayed reserved ultimate art.

Extend the SAME architecture to Unit 3.

Do not invent a different Unit 3 result flow.

---

# 24. VISUAL ANCHORS

Unit 3 opponents have large, ornate silhouettes and long effects.

Use the existing centralized visual-anchor system.

Support the project's equivalents of:

```text
scale
x
feetY
offsetX
offsetY
mirrorX
```

Calibrate visible art rather than transparent canvas bounds.

## Roseclock Duchess

Ground anchor:
visible shoes/feet.

Ensure:
- dress does not sink into the task panel;
- halo is not cropped;
- rapier/rose effects remain visible;
- defeat pose is scaled/anchored separately if needed.

## Thornbound Archivist

Ground anchor:
visible armored feet in standing states.

Ensure:
- quill weapon is not cropped;
- papers/vines/halo remain readable;
- large attack effects do not force absurd scaling changes;
- defeat pose remains fully contained.

Use:

`object-fit: contain`

Never use:

`object-fit: cover`

---

# 25. FALLBACK

If a Unit 2/3 normal Code Fighter action image is missing:

- never show broken image;
- fall back to SAME opponent `idle`;
- emit development warning;
- do not substitute another enemy;
- do not substitute Unit 1 opponent.

---

# 26. DO NOT TOUCH MILESTONE FIGHTING LEVELS

This instruction concerns:
- Unit 3 vocabulary;
- normal Unit Code Fighter opponent mapping for Units 2 and 3.

Do NOT change the separate cumulative Fighting Levels after Units 3/7/9.

Do NOT replace:
- Inkbound Knight milestone encounter;
- Prism Wraith;
- Bellkeeper;
- Crownless Marionette;
- Corrupted Archivist.

Those are a separate system.

---

# 27. TESTS — UNIT 3 DATA

Add/update focused tests for:

- Unit 3 has 4 Parts;
- raw Unit 3 source-entry count is 40;
- Part 1 count = 8;
- Part 2 count = 11;
- Part 3 count = 13;
- Part 4 count = 8;
- no Quizlet UI noise appears as vocabulary;
- `moustache` spelling preserved;
- article-bearing profession forms preserved;
- multiword forms remain intact;
- no invented source page numbers;
- Unit 3 works with Part filtering;
- Unit 3 coverage still requires full module vocabulary coverage;
- Unit 3 participates in Weak Word.

---

# 28. TESTS — UNIT 2/3 OPPONENTS

Verify:

```text
Unit 1 rival/boss -> unchanged existing opponents
Unit 2 rival -> Lady Gearveil
Unit 2 boss -> Chronofang
Unit 3 rival -> Roseclock Duchess
Unit 3 boss -> Thornbound Archivist
```

Also test:

- Unit 2 Lady Gearveil `mirrorX: true`;
- Chronofang `mirrorX: false`;
- Unit 3 opponent orientation metadata resolves;
- all canonical Unit 2/3 action paths resolve;
- missing state falls back to same opponent idle;
- Unit 3 result screen uses correct opponent victory/defeat art;
- Unit 1 did not regress;
- milestone Fighting Level registry did not change.

---

# 29. ASSET VERIFICATION

Programmatically verify the canonical Unit 2/3 opponent folders.

Expected prepared files:

```text
Lady Gearveil: 10
Chronofang: 10
Roseclock Duchess: 10
Thornbound Archivist: 10

TOTAL: 40 opponent PNGs
```

If actual filesystem naming differs slightly:
- inspect;
- map the real canonical file once in centralized registry;
- report the mismatch.

Do not silently duplicate or regenerate artwork.

---

# 30. BUILD

Run:
1. focused Unit 3 vocabulary/data tests;
2. focused normal Code Fighter opponent-registry tests;
3. relevant coverage/Weak Word regressions;
4. ONE production build.

Do not repeatedly rebuild unrelated areas.

---

# 31. DO NOT CHANGE

Do not change:

- Unit 1 vocabulary;
- Unit 2 vocabulary;
- Unit 3 supplied canonical vocabulary strings;
- Units 4–9 vocabulary;
- Repair mechanics;
- Error Hunt mechanics;
- Audio Code mechanics;
- Word Strike approved design;
- normal Code Fighter seven-exchange structure;
- Weak Word mastery rules;
- module coverage rules;
- city construction rules;
- rewards;
- evolution;
- milestone Fighting Levels after Units 3/7/9;
- Unit 1 opponents.

---

# 32. STOP CONDITION

STOP after:

- Unit 3 production vocabulary is populated;
- Unit 3 has exactly the supplied four source Parts;
- all normal training games can consume Unit 3 data through existing engines;
- Unit 3 coverage/Weak Word integration works;
- Unit 2 normal Code Fighter resolves Lady Gearveil + Chronofang;
- Unit 3 normal Code Fighter resolves Roseclock Duchess + Thornbound Archivist;
- canonical opponent art is registered and verified;
- corrected Duchess assets are used;
- Unit 1 remains unchanged;
- milestone Fighting Levels remain unchanged;
- tests pass;
- production build passes.

Do not proceed into Unit 4.

---

# 33. FINAL REPORT

Return a concise report containing:

1. files changed;
2. Unit 3 data file(s);
3. Unit 3 Part counts and total source-entry count;
4. how duplicate dentist/nurse source entries were represented;
5. helper metadata/acceptedForms added;
6. Unit 3 integration with Repair;
7. Unit 3 integration with Error Hunt;
8. Unit 3 integration with Audio Code;
9. Unit 3 integration with Word Strike;
10. Unit 3 integration with normal Code Fighter;
11. Unit 3 coverage and Weak Word confirmation;
12. Unit 2 normal Code Fighter opponent mapping;
13. Unit 3 normal Code Fighter opponent mapping;
14. exact four opponent asset roots used;
15. asset verification count out of 40;
16. orientation/mirroring metadata;
17. anchor corrections, if any;
18. focused test results;
19. production build result;
20. explicit confirmation that Unit 1, existing Unit 2 vocabulary, milestone Fighting Levels, city progression, rewards and evolution were not changed.
