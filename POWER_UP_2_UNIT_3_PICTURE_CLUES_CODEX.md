# POWER UP 2 — UNIT 3 PICTURE CLUES

## OBJECTIVE

Implement the supplied Unit 3 vocabulary picture clues in the existing **Power Up 2** Fighting Level system.

This is an implementation task. Inspect the repository and the existing Fighting Level architecture before editing. Reuse the current vocabulary model, asset-loading strategy, question scheduler, answer normalisation, audio player, timer, combat state machine, saved-progress schema, and responsive battle UI. Make the changes, run the relevant checks and production build, and fix any errors introduced by this work.

Do not stop after writing a plan or showing code snippets.

## ARCHIVE INSTALLATION

The supplied archive is designed to be extracted into the **repository root**.

After extraction, these paths must exist exactly:

```text
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/
```

The existing parent folder name `POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2` is intentional and must not be renamed, even though Unit 3 is now stored inside it.

Do not move, rename, duplicate, regenerate, crop, recolour, compress, convert, or overwrite the supplied PNG files.

## UNIT 3 ASSET MANIFEST

The following 13 files are final production vocabulary clues:

```text
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-treasure.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-dress-up.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-scarecrow.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-beard.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-moustache.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-teacher.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-firefighter.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-dentist.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-doctor.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-nurse.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-police-officer.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-a-farmer.png
Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2/unit-03/u3-smile.png
```

Every file is a separate 1024 × 1024 sRGB PNG with genuine alpha transparency.

## EXACT VOCABULARY MAPPING

Add these assets to the single authoritative picture-clue registry, or add a typed `pictureClue` field to the canonical Unit 3 vocabulary entries. Prefer stable vocabulary IDs over runtime display-string matching.

| Exact typed answer | Asset filename |
| --- | --- |
| `treasure` | `u3-treasure.png` |
| `dress up` | `u3-dress-up.png` |
| `scarecrow` | `u3-scarecrow.png` |
| `beard` | `u3-beard.png` |
| `moustache` | `u3-moustache.png` |
| `a teacher` | `u3-a-teacher.png` |
| `a firefighter` | `u3-a-firefighter.png` |
| `a dentist` | `u3-a-dentist.png` |
| `a doctor` | `u3-a-doctor.png` |
| `a nurse` | `u3-a-nurse.png` |
| `a police officer` | `u3-a-police-officer.png` |
| `a farmer` | `u3-a-farmer.png` |
| `smile` | `u3-smile.png` |

Do not create alternative target answers merely because a filename omits spaces or articles. Continue to use the project's existing accepted-answer and normalisation rules.

## UNIT 3 RECORDS THAT MUST REMAIN AUDIO-ONLY

Do not assign pictures to any of these records:

```text
dentist
nurse
surprise
invite
only
call
blonde
curly
fair
fat
short
straight
tall
thin
fire station
bus station
school
hospital
plants
restaurant
costume party
as a
idea
wear
come in
good at
meet
```

Important distinctions:

- `a dentist` has a picture, but the separate record `dentist` remains audio-only.
- `a nurse` has a picture, but the separate record `nurse` remains audio-only.
- Do not silently map either duplicate concept to the same PNG.
- Do not generate substitutes for excluded records.

## ASSET RESOLUTION

Use the repository's existing Vite/browser-safe asset pattern. A local filesystem path is not automatically a browser URL.

- If the project already has an asset manifest, extend it.
- Otherwise create one central typed Unit 3 mapping with actual static imports or valid `new URL(..., import.meta.url).href` expressions.
- Do not scatter raw path strings through components.
- Do not embed PNGs as base64 source code.
- Do not use Node filesystem APIs in browser code.
- Do not copy the same images into another public folder unless the existing repository architecture explicitly requires that location.

## QUESTION MODEL AND MODALITY

Extend the existing model without duplicating the vocabulary dataset. Adapt names to the codebase, but preserve the equivalent of:

```ts
type FightingQuestionMode = 'audio' | 'picture';

type FightingQuestion = {
  // existing fields
  mode: FightingQuestionMode;
  pictureClue?: string;
};
```

Rules:

1. Only the 13 approved Unit 3 records above may use Unit 3 picture mode.
2. Records without an approved image remain audio questions.
3. The expected typed answer and answer-normalisation logic remain the same for picture and audio questions.
4. Preserve existing accepted aliases; do not accept Russian translations as English answers.
5. Store the assigned mode in the generated round state so rerenders cannot change it.
6. A retry of the same failed fight must preserve the same selected question set and assigned modes.
7. Do not duplicate a word merely to achieve a modality ratio.
8. Preserve the current deterministic/seeded scheduler when one exists.

## UNIT 3 MILESTONE FIGHT

Preserve the approved cumulative battle rules:

- the fight unlocks after Unit 3;
- its source pool is vocabulary from Units 1–3;
- source-record counts remain Unit 1 = 50, Unit 2 = 44, Unit 3 = 40, total = 134;
- preserve the existing one-third selection rule; if the current implementation uses `ceil(total / 3)`, the Unit 3 fight contains 45 selected records;
- use both `Picture → typed answer` and `Audio → typed answer` when the selected records make both modes available;
- picture eligibility must not remove audio practice entirely;
- there is one fight after Unit 3, not two;
- the time limit remains 10 seconds per answer;
- the pass threshold remains at least 85% correct;
- on failure, preserve the existing retry behaviour and the same selected vocabulary set;
- do not change later fights after Units 7 and 9.

Do not select every picture-eligible record automatically if that bypasses the existing one-third vocabulary scheduler. First select the round vocabulary using the current deterministic rules, then assign an allowed modality to each selected record.

## PICTURE QUESTION UI

For a picture question:

- show the correct transparent PNG as the central clue;
- do not autoplay its audio;
- hide the audio replay control;
- keep the typed-answer input and existing submit behaviour;
- keep correctness feedback, damage, combo, health and enemy animation logic identical to audio questions;
- render with `object-fit: contain` or the project equivalent;
- never crop, stretch or distort the image;
- keep the image clear on narrow mobile screens without covering the timer, input, health bars or enemy;
- use a generic accessibility label such as `Vocabulary picture clue`; do not expose the answer or filename in alt text, tooltips or visible UI;
- clear the previous picture immediately when the question changes.

For an audio question, preserve automatic playback and the replay button, and ensure no stale picture remains visible.

Start the timer only when the active prompt is ready. For pictures, wait until the image has loaded and decoded. If an image fails to load, do not show a broken-image icon or block the fight: log a useful development warning, fall back to the record's normal audio question, wait until audio is ready, and then start the timer.

## PERSISTENCE AND COMPATIBILITY

- Preserve existing progress, rewards, win/loss results and milestone unlocking.
- Do not reset user data.
- If saved questions now need `mode` or `pictureClue`, add a backward-compatible default or migration.
- Never persist filesystem paths, browser object URLs or failed image-loading state.
- Preserve old saves that contain only audio questions.

## REQUIRED VALIDATION

Before finishing, verify:

1. Exactly 13 Unit 3 vocabulary PNG files exist at the canonical paths.
2. All 13 files are 1024 × 1024 PNGs with alpha transparency.
3. The registry contains 13 unique Unit 3 mappings and no missing paths.
4. `dentist` and `nurse` remain audio-only while `a dentist` and `a nurse` use their approved images.
5. No excluded Unit 3 record receives a picture.
6. A Unit 3 picture question displays the correct image and accepts the expected English answer.
7. An audio-only Unit 3 question still autoplays and can be replayed.
8. Switching between modes clears stale picture/audio state.
9. The timer starts only after the active prompt is ready.
10. Image-load failure falls back to audio without freezing the fight.
11. The cumulative Unit 3 fight still uses the approved Units 1–3 pool and one-third selection rule.
12. The 10-second timer and 85% pass threshold are unchanged.
13. Enemy intro dialogue does not start the timer.
14. Desktop, tablet and narrow-phone layouts remain usable.
15. Relevant tests pass.
16. Type checking, linting if configured, and the production build succeed.

Add focused tests for the new mappings, audio-only exclusions, modality rendering and image fallback when the repository already has a test framework. Do not install a new testing framework solely for this task.

## FINAL REPORT

After implementation, report concisely:

- files changed;
- how the 13 Unit 3 images were registered;
- how picture/audio selection works;
- confirmation that excluded records remain audio-only;
- tests and build commands run, with results;
- any genuine remaining limitation.
