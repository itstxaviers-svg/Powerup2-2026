# POWER UP 2 — INTEGRATE VOCABULARY PICTURE CLUES INTO FIGHTING LEVELS

## TASK

Implement the newly added vocabulary picture clues in the existing **Power Up 2** game.

This is an implementation task, not an asset-generation task. All 30 final PNG files already exist in the project. Inspect the current codebase first, locate the existing Fighting Level implementation, vocabulary data, question scheduler, answer validation, audio playback, timers, enemy intros, retry logic, and asset-loading conventions, then integrate the images into the existing architecture cleanly.

Work autonomously. Do not stop after describing the solution. Make the required code and data changes, run the relevant tests and production build, fix any errors introduced by this work, and report the files changed and verification results.

## NON-NEGOTIABLE CONSTRAINTS

- Do not generate new images.
- Do not redesign, edit, crop, recolour, compress, rename, or overwrite the supplied PNG files.
- Do not invent alternative filenames or folders.
- Do not convert the files to a collage, sprite sheet, WebP, SVG, or base64 data embedded in source code.
- Do not remove or weaken existing Fighting Level logic.
- Do not modify the already approved enemy roster, enemy dialogue, combat animations, timers, win threshold, progression, or retry behaviour except where strictly necessary to display picture questions correctly.
- Do not turn every Fighting Level question into a picture question. Words without an approved picture must remain audio questions.
- Do not create a picture question for `to protect a project`. Keep it audio-only because its intended visual meaning is ambiguous and would overlap with `have a presentation`.
- Do not expose the correct answer through image alt text, title text, filename, tooltip, debug label, CSS class, or visible UI.
- Preserve mobile, tablet, and desktop support.
- Preserve the existing visual language of the game. Do not redesign the whole battle screen.

## CANONICAL ASSET LOCATIONS

The assets are already stored here:

```text
Assets/05-games/fighting-level/vocabulary-clues/unit-01/
Assets/05-games/fighting-level/vocabulary-clues/unit-02/
```

There must be exactly 17 Unit 1 files and 13 Unit 2 files.

Use the project's existing asset-resolution convention. Do not assume that a raw filesystem path is automatically a valid browser URL. If the current Vite setup requires static imports, create a typed asset manifest with real imports or `new URL(..., import.meta.url).href` values using paths that are valid from the actual source file. Do not use runtime filesystem APIs in browser code. Do not relocate the originals merely to make imports easier.

## APPROVED PICTURE-CLUE MAPPING

Create one authoritative typed registry or add an explicit `pictureClue` field to the canonical vocabulary entries. Prefer stable vocabulary IDs over display-string matching. Do not scatter path strings throughout components.

### Unit 1

| Target answer | Asset |
| --- | --- |
| `field` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-field.png` |
| `mountain` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-mountain.png` |
| `river` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-river.png` |
| `leaves` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-leaves.png` |
| `rock` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-rock.png` |
| `lake` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-lake.png` |
| `forest` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-forest.png` |
| `tractor` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-tractor.png` |
| `flower` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-flower.png` |
| `kitten` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-kitten.png` |
| `puppy` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-puppy.png` |
| `lunch` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-lunch.png` |
| `toothpaste` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-toothpaste.png` |
| `toothbrush` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-toothbrush.png` |
| `towel` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-towel.png` |
| `factory` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-factory.png` |
| `plastic bags` | `Assets/05-games/fighting-level/vocabulary-clues/unit-01/u1-plastic-bags.png` |

### Unit 2

| Target answer | Asset |
| --- | --- |
| `go skating` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-go-skating.png` |
| `read a comic` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-read-a-comic.png` |
| `helmet` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-helmet.png` |
| `elbow pads` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-elbow-pads.png` |
| `knee pads` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-knee-pads.png` |
| `goggles` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-goggles.png` |
| `gloves` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-gloves.png` |
| `muscles` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-muscles.png` |
| `bones` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-bones.png` |
| `blanket` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-blanket.png` |
| `jump out of bed` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-jump-out-of-bed.png` |
| `traffic lights` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-traffic-lights.png` |
| `have a presentation` | `Assets/05-games/fighting-level/vocabulary-clues/unit-02/u2-have-a-presentation.png` |

## DATA MODEL

Extend the existing Fighting Level question model without duplicating the entire vocabulary dataset. Adapt names to the project's conventions, but preserve this behaviour:

```ts
type FightingQuestionMode = 'audio' | 'picture';

type FightingQuestion = {
  // existing fields remain
  mode: FightingQuestionMode;
  pictureClue?: string;
};
```

Rules:

1. A question may use `mode: 'picture'` only when its canonical vocabulary entry has one of the approved picture assets above.
2. A picture question must contain a valid resolved asset URL.
3. A question without an approved image must use `mode: 'audio'`.
4. `to protect a project` must always use `mode: 'audio'`.
5. The expected typed answer and answer-normalisation logic must remain identical across audio and picture modes.
6. Preserve existing accepted-answer aliases if the project already supports them. Do not silently broaden accepted answers or add translations as correct answers.
7. Store the mode in the generated round/question state so it cannot change during rerenders.

If the current vocabulary records use IDs, connect images by ID. If they do not, add stable IDs or add `pictureClue` directly to the canonical entries. Avoid fragile lookup based only on user-facing text, punctuation, or capitalisation.

## FIGHT QUESTION SELECTION

Preserve the existing milestone structure:

- after Unit 3: one Fighting Level using vocabulary accumulated from Units 1–3;
- after Unit 7: two consecutive fights using vocabulary accumulated from Units 1–7, with no repeated vocabulary between the two fights;
- after Unit 9: two final fights using vocabulary accumulated from Units 1–9, with no repeated vocabulary between the two fights;
- each milestone continues to use the existing one-third vocabulary selection rule;
- the existing pass threshold remains **85%**;
- the existing time limits remain **10 seconds after Unit 3, 8 seconds after Unit 7, and 6 seconds after Unit 9**;
- when a learner fails, preserve the existing retry rule and the same selected vocabulary set;
- preserve the existing no-repeat guarantees between paired fights.

Integrate modality selection into the existing deterministic round-generation step:

1. Build the milestone vocabulary pool using the current rules.
2. Select the round vocabulary using the current one-third and no-repeat logic.
3. Assign `picture` only to selected entries with an approved image.
4. Keep selected entries without an approved image as `audio`.
5. Ensure a normal round contains both modalities when its selected vocabulary makes that possible. Do not replace every eligible selected word with a picture if doing so would remove audio practice entirely.
6. Keep the assignment stable for a retry of the same failed fight.
7. Do not introduce the same vocabulary item twice merely to achieve a modality ratio.

Use the project's existing seeded/deterministic randomisation if one exists. Do not add nondeterministic reshuffling on component rerenders.

## PICTURE QUESTION UI

When `question.mode === 'picture'`:

- show the supplied PNG as the central prompt;
- do not autoplay audio;
- hide or disable the audio replay control for that question;
- keep the existing typed-answer field, submit behaviour, countdown, correctness feedback, damage logic, combo logic, and enemy animation flow;
- render the transparent PNG with `object-fit: contain` or the project's equivalent;
- keep the complete image visible without cropping;
- do not place the image behind the enemy or under combat effects;
- do not stretch or distort it;
- use a generic accessibility label such as `Vocabulary picture clue`; never use the answer or filename as alt text;
- prevent dragging and accidental selection if that matches the existing game UI;
- keep the image large enough to read on a phone but do not let it cover the countdown, answer field, health bars, enemy, or required controls.

Use a responsive clue container consistent with the existing battle interface. A suitable implementation normally uses a bounded square area, `max-width`, `max-height`, and `object-fit: contain`, but adapt exact values to the real layout instead of hardcoding a second unrelated design system.

## AUDIO QUESTION UI

When `question.mode === 'audio'`:

- preserve existing automatic playback when the question becomes active;
- preserve the manual replay button;
- do not display a stale picture from the previous question;
- preserve existing loading, replay, and accessibility behaviour.

## TIMER AND LOADING FAIRNESS

- Do not start the answer timer during enemy dialogue or transition screens.
- For a picture question, start the timer only after the image is loaded and decoded sufficiently to be visible.
- Preload the next question's image when practical so the battle does not pause unnecessarily.
- For an audio question, preserve the existing fair-start behaviour; the timer must not expire while the required audio is still unavailable.
- If a picture fails to load, do not show a broken-image icon and do not block the fight. Log a useful development warning, convert that question to its existing audio fallback, wait until audio is ready, then start the timer.
- Clear old load handlers, timers, audio playback, and pending callbacks when the question changes or the component unmounts.

## ENEMY INTROS AND COMBAT FLOW

The enemy introductions and dialogue already belong to the Fighting Level flow. Preserve them exactly:

- the intro appears before the first attempt against that enemy;
- the timer and prompt do not start during the dialogue;
- the learner advances dialogue manually;
- the start-battle button begins the fight;
- a failed-fight retry does not replay the intro if the existing implementation already suppresses it;
- picture loading must not cause combat to begin before the intro has finished;
- picture questions must trigger the same correct/wrong attack consequences as audio questions.

Do not change enemy names, dialogue text, opponent assets, battle order, screen-hit effects, victory dialogue, or final completion flow as part of this task.

## STATE, PROGRESS, AND PERSISTENCE

- Do not change existing saved-progress semantics.
- Do not mark a unit or fight complete merely because a picture loaded.
- Preserve the existing result calculation and 85% pass rule.
- Preserve the same selected question IDs and assigned modalities across a retry when the current system stores the failed round.
- If persisted state is versioned, add a safe backward-compatible migration/default so older saves without `mode` or `pictureClue` continue to work.
- Never persist browser object URLs or machine-specific filesystem paths.

## IMPLEMENTATION QUALITY

- Reuse existing components and styles where practical.
- Keep the picture registry typed and centralized.
- Avoid duplicate mappings, duplicated question-generation logic, and mode-specific copies of the whole battle screen.
- Avoid `any` when the project uses TypeScript.
- Do not add a large dependency for image display or preloading.
- Do not leave placeholder data, fake assets, TODO-only implementations, commented-out experimental code, console noise, or dead branches.
- Do not alter unrelated games or Unit content.

## REQUIRED VALIDATION

Before finishing, verify all of the following:

1. All 30 exact PNG files exist at the canonical paths.
2. The picture registry contains exactly 30 unique approved mappings: 17 for Unit 1 and 13 for Unit 2.
3. No mapping points to a missing file.
4. No picture mapping exists for `to protect a project`.
5. A Unit 1 picture question displays the correct image and accepts the correct typed answer.
6. A Unit 2 picture question displays the correct image and accepts the correct typed answer.
7. An audio-only word still autoplays audio and shows the replay control.
8. Moving from picture to audio clears the old picture.
9. Moving from audio to picture stops stale audio and hides the replay control.
10. The timer starts only when the active prompt is ready.
11. A failed image load falls back to audio without breaking the round.
12. The same correct/wrong combat effects occur for both modes.
13. The 10/8/6-second milestone timers are unchanged.
14. The 85% pass threshold is unchanged.
15. The one-third selection rule and paired-fight no-repeat rules are unchanged.
16. Failed-fight retry preserves the same round as required by the existing design.
17. Enemy intros still finish before any timer or prompt begins.
18. The layout remains usable on desktop, tablet, and narrow mobile screens.
19. There are no missing-asset, TypeScript, React, lint, or runtime console errors caused by this work.
20. The production build succeeds.

Add or update focused tests for the registry, modality assignment, fallback behaviour, and question rendering if the repository already has a test setup. Do not introduce a new testing framework solely for this task.

## FINAL RESPONSE

After implementation, provide a concise report containing:

- what was changed;
- the main files changed;
- how the 30 images were connected to vocabulary entries;
- how picture/audio selection now works;
- confirmation that `to protect a project` remains audio-only;
- tests and production build commands run, with results;
- any real limitation that remains.

Do not return only a plan or code snippets. Complete the implementation in the repository.
