# POWER UP 2 — CODEX INSTRUCTION
## Insert Unit 2 vocabulary and make it work exactly like Unit 1, with its own city

MODEL TO USE: GPT-5.6 Sol

Continue working in the current project:

`/Users/sophie/Downloads/Power up 2`

Treat the CURRENT filesystem state as the source of truth.

Before editing anything:
1. inspect the current Unit 1 vocabulary/data schema;
2. inspect the current Unit 1 game integrations;
3. inspect Unit/Part progress tracking;
4. inspect Weak Word persistence;
5. inspect module coverage/completion logic;
6. inspect Unit 2 / Clockwork City configuration and existing city assets;
7. inspect current tests for Unit 1 vocabulary/progression.

DO NOT redesign working architecture.

The goal is to add real production vocabulary for Unit 2 and make Unit 2 behave like Unit 1 in all five learning modules, while keeping its own Unit 2 city/progression identity.

---

# 1. UNIT IDENTITY

Unit:

`Unit 2`

Canonical title:

`My week`

City/world identity:

`Clockwork City`

Do NOT reuse Unit 1 / Skyport Basics city art.

Use the existing Unit 2 / Clockwork City city configuration already present in the repository.

Preserve the existing world-map placement and city-reveal architecture for Unit 2.

If Unit 2 city-stage assets/configuration already exist, use them.

If some city visual asset is genuinely missing, DO NOT invent a fake placeholder or copy Unit 1 art. Finish the vocabulary/game-data integration and explicitly report the missing city asset/config in the final report.

---

# 2. UNIT 2 VOCABULARY SIZE

Unit 2 contains exactly:

`44 unique vocabulary entries`

Part split:

- Part 1 — 16 entries
- Part 2 — 9 entries
- Part 3 — 12 entries
- Part 4 — 7 entries

TOTAL:

`16 + 9 + 12 + 7 = 44`

This means Unit 2 module completion is based on:

`44/44 unique trained Unit 2 vocabulary items`

NOT 50/50.

Do NOT hardcode Unit 1’s number 50 into Unit 2.

The progression system must derive required coverage from the actual eligible vocabulary count of the current Unit.

---

# 3. PART STRUCTURE

Create these four source Parts.

## Part 1

Source title:

`My week. Vocabulary 1`

Vocabulary:

1. Monday
2. Tuesday
3. Wednesday
4. Thursday
5. Friday
6. Saturday
7. Sunday
8. how often...?
9. Do you ever...?
10. always
11. often
12. sometimes
13. never
14. talk
15. feed
16. weekend

---

## Part 2

Source title:

`My week. Vocabulary 2`

Vocabulary:

1. listen to music
2. write an email
3. go skating
4. read a comic
5. go shopping
6. watch films
7. listen to a CD
8. watch a DVD
9. must

---

## Part 3

Source title:

`Days of week. Let's be healthy`

Vocabulary:

1. helmet
2. elbow pads
3. knee pads
4. goggles
5. gloves
6. be healthy
7. accident
8. warm up
9. muscles
10. bones
11. put on sun cream
12. skin

---

## Part 4

Source title:

`Days of week. Literature`

Vocabulary:

1. turn off the alarm clock
2. suddenly
3. blanket
4. jump out of bed
5. traffic lights
6. have a presentation
7. consequence

---

# 4. SOURCE METADATA

Mirror the current Unit 1 metadata shape exactly.

Use the existing field names already present in Unit 1, for example if the schema currently contains fields such as:

- `sourcePart`
- `sourceTitle`
- `sourcePage`

then Unit 2 must use the same fields.

Do not create a second competing metadata schema.

No source page numbers were supplied for Unit 2.

Therefore:
- omit `sourcePage` if optional;
- or use the project’s canonical empty/null representation.

DO NOT invent page numbers.

---

# 5. CANONICAL VOCABULARY TEXT

Preserve the supplied vocabulary as the authoritative Unit 2 list.

Do not add extra production words.

Do not remove any of the 44 entries.

Do not silently merge two entries into one.

Do not split phrases into separate production vocabulary records.

Multiword phrases remain single vocabulary items.

Examples:

`listen to music`

is ONE vocabulary record.

`turn off the alarm clock`

is ONE vocabulary record.

`put on sun cream`

is ONE vocabulary record.

`Do you ever...?`

is ONE vocabulary record.

Use the project’s existing answer-normalization logic for case and terminal punctuation.

Do not create special hardcoded answer logic only for Unit 2 unless the existing normalizer genuinely cannot handle the supplied forms.

For display, preserve appropriate capitalization such as:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday
- Do you ever...?
- CD
- DVD

For typed-answer checking, follow the same normalization rules already used in Unit 1.

---

# 6. PART 3 — SUPPLIED CLUES / DEFINITIONS / EXAMPLES

Use the supplied material below as Unit 2 source content.

Preserve the meaning and wording as closely as the existing Unit 1 data model permits.

Do NOT expose the full target answer inside a clue when that would leak the answer before response.

Where the user supplied a cloze form, keep the cloze as the learner-facing clue/example where appropriate.

## helmet

Supplied clue:

`We use h___ to protect our head.`

Use this as the clue/example.

---

## elbow pads

Supplied clue:

`We use e___ p___ to protect our e___s.`

Use this as the clue/example.

---

## knee pads

Supplied clue:

`We use kn___ p___ to protect our kn____s.`

Use this as the clue/example.

---

## goggles

Supplied clue:

`We use g___ to protect our eyes.`

Use this as the clue/example.

---

## gloves

Supplied clue:

`We use g___ to protect our hands.`

Use this as the clue/example.

---

## be healthy

Supplied definition:

`be well; have good health`

Supplied example/cloze:

`I'm not so h_____.`

---

## accident

Supplied definition:

`something bad that happens without being planned`

Supplied example/cloze:

`I had a car a_____ this morning.`

---

## warm up

Supplied definition:

`prepare body for exercise`

Supplied example/cloze:

`Before exercising you must w___ u_ your muscles.`

---

## muscles

Supplied example/cloze:

`Before exercising you must warm up your m_____.`

---

## bones

Supplied definition:

`skeletal system`

Supplied example/cloze:

`Our b___ and muscles help us to move.`

---

## put on sun cream

Supplied support/gloss:

`use s___ c___`

Supplied example/cloze:

`We use s___ c___ to protect our skin.`

---

## skin

Supplied example/cloze:

`We use sun cream to protect our s___.`

---

# 7. PART 4 — SUPPLIED CLUES / DEFINITIONS / EXAMPLES

## turn off the alarm clock

Supplied example/cloze:

`I t___ o__ my a___ c___ and go to sleep.`

---

## suddenly

Supplied definition:

`quickly and unexpectedly`

Supplied example/cloze:

`S___, my mum's standing over me.`

---

## blanket

Supplied clue:

`You sleep under b___ in the bed.`

---

## jump out of bed

Supplied definition:

`to get out of bed very quickly`

Supplied example/cloze:

`I j___ o__ o_ b__ and get dressed.`

---

## traffic lights

Supplied definition:

`the red, yellow and green lights which control the traffic`

Supplied example/cloze:

`We were driving and all the l___ were red!`

The source also contained the isolated word `lights`; do not create a separate production vocabulary entry for it.

---

## have a presentation

Canonical vocabulary item:

`have a presentation`

Supplied gloss:

`to protect a project`

Supplied example/cloze:

`You h___ _ p___ at school today.`

IMPORTANT:
The supplied gloss `to protect a project` appears semantically unusual for `have a presentation`.

DO NOT silently rewrite the user’s supplied source into a different definition.

Do NOT use an obviously misleading definition in learner-facing production content if the current schema allows this field to be omitted.

Preferred handling:
- keep `have a presentation` as the canonical vocabulary item;
- keep the supplied cloze/example;
- omit the questionable gloss from learner-facing definition tasks for now if necessary;
- flag this exact source phrase in the final report for teacher confirmation.

Do not invent a different production definition without explicit approval.

---

## consequence

Supplied definition:

`result`

Supplied example/cloze:

`Every action has its c_____s.`

Canonical target remains singular:

`consequence`

The supplied sentence may contain an inflected/plural form as contextual support.

Do not change the canonical vocabulary item to plural merely because of the example.

---

# 8. PARTS 1–2 SUPPORTING TASK CONTENT

For Part 1 and Part 2, the user supplied the canonical vocabulary but not full definitions/examples for every item.

Do NOT add new vocabulary.

However, if the existing Unit 1 schema requires support fields for game generation such as:

- definition
- translation
- example sentence
- audio text

then populate only the REQUIRED support fields needed by the current architecture.

Rules:

- English must be simple A1+/A2 level.
- Definitions must be short and unambiguous.
- Example sentences must be natural and age-appropriate.
- Russian translations may be added only if the current Unit 1 production schema already uses them.
- Do not introduce grammar beyond the level needed to understand the word.
- Do not use the target itself inside a definition if doing so makes the clue useless.
- Do not introduce extra target vocabulary records.

Before generating support fields, inspect how Unit 1 stores and uses them and mirror that structure.

---

# 9. PART SELECTION — SAME AS UNIT 1

Unit 2 must use the SAME Part-selection system as Unit 1.

Required behavior:

- learner can select one Part;
- learner can select multiple Parts;
- learner can select all Parts;
- tasks are drawn only from currently selected Parts during that session;
- selected Part(s) are a training filter only;
- Parts are NOT separate progression tracks;
- Part selection must not reduce the full Unit completion requirement.

Example:

If a learner trains only Part 1, the learner may make progress on Unit 2 vocabulary coverage, but the module is NOT considered fully complete until all eligible Unit 2 vocabulary has been trained across the whole Unit.

For Unit 2:

full module coverage = `44/44`

not `16/16` just because Part 1 is selected.

---

# 10. SESSION LENGTH — SAME AS UNIT 1

Preserve the current short-session behavior.

A normal session may contain approximately 5 tasks.

But:

`5 tasks ≠ module complete`

Do not regress to the old session-completion logic.

A module is complete only after every eligible Unit 2 vocabulary ID has been encountered/answered at least once according to the current canonical coverage rules.

For Unit 2:

`44 unique vocabulary IDs`

must be covered for full module completion.

Repeats do not increase unique coverage.

An abandoned/unanswered task does not count.

A wrong answered item may count as exposed/trained for coverage according to the current Unit 1 logic, while separately entering Weak Word.

Mirror Unit 1 exactly.

---

# 11. WEAK WORD — SAME AS UNIT 1

Unit 2 must use the existing Weak Word Engine.

Do not create a second Unit 2 review system.

Requirements:

- Weak Word state is persistent per Unit;
- Unit 2 Weak Words remain separate from Unit 1;
- current selected Part filter is respected during a session;
- spelling mistakes receive the existing higher priority;
- recognition mistakes use the existing lower priority;
- existing spaced-review rules remain unchanged;
- immediate correction does not count as mastery;
- existing required later successes remain unchanged.

Do not alter the current Weak Word algorithm.

Only ensure Unit 2 vocabulary IDs integrate correctly.

---

# 12. REPAIR — SAME MECHANICS AS UNIT 1

Unit 2 Repair must use the current canonical Repair implementation.

Do NOT create Unit-specific Repair logic.

Requirements remain:

- approximately 20–40% of letters damaged;
- prefer internal damage;
- at least one visible letter per lexical word;
- spaces/apostrophes/punctuation preserved;
- deterministic task damage where current implementation expects it;
- exactly one clue;
- learner types the full word/phrase;
- canonical answer + accepted forms only;
- Error Hunt typo variants are not used;
- long expressions wrap only between words.

Multiword Unit 2 phrases must work correctly.

Examples that must be structurally safe:

- listen to music
- write an email
- put on sun cream
- turn off the alarm clock
- jump out of bed
- have a presentation

---

# 13. ERROR HUNT — SAME MECHANICS AS UNIT 1

Unit 2 Error Hunt remains spelling-only.

For EVERY Unit 2 vocabulary item, create/derive the same canonical spelling-error support used by Unit 1.

If the current data architecture stores explicit typo variants, provide 3 realistic spelling variants per vocabulary item following the current canonical rules.

Rules:

- one spelling error only where practical;
- prefer internal omission;
- adjacent transposition;
- incorrect internal vowel/consonant;
- duplicate letter;
- avoid crude deletion of the first letter;
- short words must not receive obviously silly edge deletion;
- multiword phrases retain the same word order and grammar;
- misspell only one component of a phrase where practical;
- do not introduce grammar errors;
- do not introduce punctuation tasks.

Do not use all-uppercase display.

Use normal vocabulary casing.

---

# 14. AUDIO CODE — SAME MECHANICS AS UNIT 1

Unit 2 must work in Audio Code through the existing audio pipeline.

Do not expose the written target before the learner responds.

Preserve:

- delayed autoplay after task readiness;
- manual Replay;
- existing repeat behavior if currently enabled;
- timer/audio cleanup;
- no overlapping audio;
- shuffled letters/options where applicable;
- no canonical-order answer leak.

For Unit 2 audio text, pronounce the canonical vocabulary naturally.

Examples:

- Monday
- Do you ever...?
- listen to music
- watch a DVD
- put on sun cream
- turn off the alarm clock

Do not invent a second audio engine.

Use the same production audio/fallback architecture currently used by Unit 1.

If static audio assets are required by the existing architecture and Unit 2 audio files are not present, report that clearly rather than silently creating broken paths.

---

# 15. WORD STRIKE — SAME MECHANICS AS UNIT 1

Unit 2 Word Strike must use ONLY the currently approved active modes:

- Spelling Strike
- Audio Strike

Do not reactivate:
- Definition Strike
- Translation Strike
- Sentence Strike
- Picture Strike

## Spelling Strike

For Unit 2:

- exactly 3 targets;
- one correct canonical spelling;
- two plausible typo variants;
- same vocabulary item;
- correct target position randomized.

## Audio Strike

For Unit 2:

- exactly 3 correctly spelled vocabulary choices;
- one matches the audio;
- all choices must be real eligible Unit 2 vocabulary items;
- preserve delayed autoplay;
- preserve manual replay;
- preserve repeat timing;
- no answer leak.

No picture tasks are required.

Picture eligibility remains:

`0`

unless real Unit 2 picture assets are later supplied.

Do NOT generate fake picture placeholders.

---

# 16. CODE FIGHTER — SAME MECHANICS AS UNIT 1

Unit 2 must enter the existing Code Fighter task system.

Do not redesign Code Fighter.

Use the same seven challenge types currently approved:

1. Quick Meaning
2. Error Defense
3. Heavy Spelling
4. Audio Counter
5. Meaning Strike
6. Combo Chain
7. Ultimate Recall

Generate/use Unit 2 task content from Unit 2’s real 44 vocabulary records.

Preserve:
- current player action PNG system;
- opponent action system;
- timers;
- choreography;
- audio gating;
- result art;
- visual anchors.

Do not touch fighter assets in this task.

---

# 17. COVERAGE TRACKING PER MODULE

Each of the five Unit 2 modules must track unique Unit 2 vocabulary IDs independently.

Expected full module coverage:

Repair:
`44/44`

Error Hunt:
`44/44`

Audio Code:
`44/44`

Word Strike:
`44/44`

Code Fighter:
`44/44`

Do NOT share one coverage set between modules.

Example:

Training `Monday` in Repair does not mean `Monday` has been trained in Audio Code.

Each module keeps its own coverage.

---

# 18. UNIT 2 CITY PROGRESSION

Use the SAME progression mechanics as Unit 1 but with Unit 2’s own city:

`Clockwork City`

City construction stage must depend only on fully completed Unit 2 modules.

Canonical mapping:

- 0 completed modules = foundation / initial state
- 1 completed module = city stage 1
- 2 completed modules = city stage 2
- 3 completed modules = city stage 3
- 4 completed modules = city stage 4
- 5 completed modules = Clockwork City fully restored

A short 5-task session must NOT construct a city stage.

A Part completion must NOT construct a city stage.

Only a FULL MODULE completion at `44/44` may increase the completed-module count.

Keep medals tied to true full module completion.

Keep chest/reward behavior tied to full 5/5 Unit completion according to the current architecture.

Do not copy Unit 1’s Skyport visual layer.

Use Unit 2 / Clockwork City’s own map/build visuals.

---

# 19. UNIT 2 PROGRESS MUST BE SEPARATE

Unit 2 persistence must be separate from Unit 1.

Do not reuse Unit 1 keys/IDs in a way that overwrites progress.

Verify migration/backward compatibility so existing learners with Unit 1 progress do not lose or reset it after Unit 2 is added.

Unit 1 current progress must survive this change untouched.

---

# 20. AVAILABILITY / ACCESS

The educational group is already studying Unit 3 and needs Units 1 and 2 for review.

Therefore Unit 2 must be accessible for review without requiring the learner to fully restore Unit 1 first.

Do NOT force children to complete Unit 1 before they can enter Unit 2.

Implement this using the cleanest existing Unit availability configuration rather than hacking around UI buttons.

If the project currently uses strictly sequential unlocking, adjust the availability configuration so Unit 2 is initially available while preserving all internal Unit 2 progression.

Do NOT yet populate Unit 3 vocabulary in this task.

Do not invent Unit 3 data.

If Unit 3 is already visually available due to another existing configuration, do not remove it; just do not add fake vocabulary to it.

---

# 21. UNITS 3–9 DATA SAFETY

Do not add production vocabulary to Units 3–9.

Unless the project already contains user-supplied data there, keep their existing vocabulary arrays untouched.

No invented vocabulary.

No placeholders pretending to be production words.

---

# 22. IDS

Give all 44 Unit 2 vocabulary records stable unique IDs using the project’s existing ID convention.

Do not reuse Unit 1 IDs.

Do not derive unstable random IDs at runtime.

Part changes must not change a word’s identity.

Weak Word, module coverage, persistence, and analytics must all refer to the same stable Unit 2 vocabulary IDs.

---

# 23. DATA VALIDATION

Add/update validation tests to assert:

- Unit 2 has exactly 44 vocabulary records;
- all 44 IDs are unique;
- Part 1 = 16;
- Part 2 = 9;
- Part 3 = 12;
- Part 4 = 7;
- no empty canonical targets;
- required metadata is present;
- all vocabulary items point to Unit 2;
- all sourcePart references are valid;
- Units 3–9 are not accidentally populated;
- no duplicate Unit 2 canonical items;
- multiword items remain single records.

---

# 24. GAME INTEGRATION TESTS

Add/update focused tests proving Unit 2 can be used by:

- Repair;
- Error Hunt;
- Audio Code;
- Word Strike;
- Code Fighter.

Also test:

- Part filtering;
- multi-Part selection;
- All Parts;
- Unit 2 Weak Word isolation;
- Unit 2 progress isolation;
- actual module requiredCoverage = 44;
- 5-task session does NOT complete a module;
- one Part alone does NOT complete a module;
- true 44/44 completes that module;
- city stage increments only after full module completion;
- switching Unit 1 ↔ Unit 2 does not leak progress or vocabulary;
- existing Unit 1 tests remain green.

---

# 25. IMPORTANT REGRESSION CHECK — REMOVE ANY HARD-CODED 50

Audit production progression code for assumptions such as:

```ts
requiredWords = 50
coverage >= 50
`${trained}/50`
```

If such code is genuinely Unit-1-specific data, keep it local.

If it is incorrectly used as a global Unit rule, refactor it so required coverage derives from the current Unit’s actual eligible vocabulary count.

Expected:

Unit 1:
`50`

Unit 2:
`44`

Do not break Unit 1 while fixing this.

This is a critical acceptance criterion.

---

# 26. DISPLAY PROGRESS

Where the UI shows vocabulary coverage, Unit 2 must display its real denominator.

Examples:

`12 / 44 words trained`

`44 / 44`

Never display:

`12 / 50`

for Unit 2.

Part filtering must not change the denominator for full module mastery if the screen is showing full module coverage.

If the UI separately shows current-session selected vocabulary count, preserve the existing distinction between session pool and full Unit mastery.

---

# 27. DO NOT CHANGE CURRENT CHARACTER INTROS

Repair, Error Hunt, Audio Code, and Word Strike character intro work is already being implemented/approved separately.

Do not redesign their intro interactions in this task.

Do not change:
- manual `Next →`;
- 650 ms Next delay;
- Skip intro behavior;
- Start training behavior;
- character assets.

This task is Unit 2 vocabulary/data/progression integration.

---

# 28. BUILD / TEST LIMITS

Run focused Unit 2/data/progression/game integration tests.

Also run the existing relevant Unit 1 regression tests.

Then run ONE production build.

Do not waste context/time on repeated unrelated full builds unless fixing an actual failure.

---

# 29. STOP CONDITION

STOP after:

- Unit 2 contains exactly 44 production vocabulary entries;
- all four Parts are correct;
- all five games can consume Unit 2 data through existing mechanics;
- Weak Word works independently for Unit 2;
- module coverage uses 44/44;
- Unit 2 / Clockwork City progression is connected correctly;
- Unit 1 remains intact;
- Unit 2 is accessible for review;
- Units 3–9 were not fabricated;
- focused tests pass;
- production build passes.

Do not start adding Unit 3 vocabulary.

---

# 30. FINAL REPORT

Return a concise report containing:

1. files changed;
2. exact Unit 2 vocabulary file/data location;
3. total Unit 2 vocabulary count;
4. Part counts: 16 / 9 / 12 / 7;
5. stable ID strategy;
6. metadata/sourcePart integration;
7. treatment of supplied Part 3 clues;
8. treatment of supplied Literature clues;
9. explicit note on `have a presentation - to protect a project`;
10. Part 1–2 support-content generation, if any;
11. Repair integration;
12. Error Hunt integration;
13. Audio Code integration;
14. Word Strike integration;
15. Code Fighter integration;
16. Weak Word isolation;
17. confirmation that Unit 2 module mastery is 44/44, not 50/50;
18. confirmation that short 5-task sessions do not complete modules;
19. Unit 2 / Clockwork City progression integration;
20. Unit 2 access/unlock behavior;
21. confirmation that Unit 1 progress/data were preserved;
22. confirmation that Units 3–9 were not populated with invented words;
23. tests and results;
24. production build result.
