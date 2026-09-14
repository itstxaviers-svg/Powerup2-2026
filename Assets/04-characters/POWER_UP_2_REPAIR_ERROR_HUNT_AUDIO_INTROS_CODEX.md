# POWER UP 2 — CODEX INSTRUCTION
## Add the approved manual character intro flow to Repair, Error Hunt, and Audio Code

MODEL TO USE: GPT-5.6 Sol

Continue working in the current project:

`/Users/sophie/Downloads/Power up 2`

Treat the current filesystem state as the source of truth.

The Word Strike / Specialist Nova intro has ALREADY been implemented and approved.

DO NOT rebuild, redesign, or refactor the Word Strike intro.

Use the EXISTING Word Strike intro implementation as the canonical behavioral and visual reference for the three remaining games:

- Repair
- Error Hunt
- Audio Code

The approved Word Strike behavior that must be reused is:

- intro DOES NOT advance dialogue automatically;
- every phrase remains visible until the learner presses `Next →`;
- `Next →` appears 650 ms after the current phrase appears;
- after the final phrase, the character changes to the final expressive state and `Start training` appears;
- `Skip intro` never launches gameplay directly; it only advances to the final ready state with `Start training`;
- accidental double clicks / repeated input are protected against;
- Reduced Motion works without movement animation;
- gameplay starts only after the learner explicitly presses `Start training`.

Do not create a different interaction model for Repair, Error Hunt, or Audio Code.

Reuse/refactor the existing Word Strike intro architecture where sensible so all four games behave consistently.

---

# 1. SCOPE

Implement the same approved MANUAL onboarding flow for:

1. Repair — Helper Spark
2. Error Hunt — Mentor Elara
3. Audio Code — Audio Guide

Do not alter actual training mechanics.

This task ends when those three intros are integrated, tested, and visually checked.

---

# 2. DO NOT CHANGE

Do NOT change:

- Word Strike intro or gameplay;
- Unit 1 vocabulary;
- Units 2–9 vocabulary;
- Part filtering;
- Weak Word Engine;
- trained-word coverage;
- module completion;
- city progression;
- medals;
- rewards;
- chest flow;
- avatar evolution;
- registration/profile logic;
- Repair task generation;
- Error Hunt spelling-error generation;
- Audio Code answer generation;
- Audio Code answer-leak protections;
- Code Fighter;
- any unrelated game.

The new intro is a presentation layer before each existing game.

---

# 3. EXISTING CHARACTER FOLDERS

The new images are already saved inside each game’s existing `character` folder.

DO NOT create new character subfolders.

DO NOT duplicate the images elsewhere.

DO NOT rename the images.

Preserve the project’s current asset-root capitalization and hierarchy.

If the repository currently uses `Assets/...`, keep `Assets/...`.

Resolve the real existing asset root before editing.

---

# 4. CANONICAL ASSET FILENAMES

## Repair — Helper Spark

Use these existing files:

```text
repair-spark-01-greeting.png
repair-spark-02-wink.png
repair-spark-03-point-right.png
```

Semantic states:

```text
greeting   -> repair-spark-01-greeting.png
wink       -> repair-spark-02-wink.png
pointRight -> repair-spark-03-point-right.png
```

---

## Error Hunt — Mentor Elara

Use these existing files:

```text
error-hunt-elara-01-greeting.png
error-hunt-elara-02-wink.png
error-hunt-elara-03-point-right.png
```

Semantic states:

```text
greeting   -> error-hunt-elara-01-greeting.png
wink       -> error-hunt-elara-02-wink.png
pointRight -> error-hunt-elara-03-point-right.png
```

---

## Audio Code — Audio Guide

Use these existing files:

```text
audio-guide-01-greeting.png
audio-guide-02-listening.png
audio-guide-03-wink.png
audio-guide-04-point-right.png
```

Semantic states:

```text
greeting   -> audio-guide-01-greeting.png
listening  -> audio-guide-02-listening.png
wink       -> audio-guide-03-wink.png
pointRight -> audio-guide-04-point-right.png
```

---

# 5. USE WORD STRIKE AS THE REFERENCE — DO NOT INVENT A SECOND SYSTEM

Inspect the already-working Word Strike Nova intro first.

Reuse its existing:

- intro shell/layout;
- dialogue card;
- `Next →` logic;
- 650 ms delayed button reveal;
- `Skip intro` behavior;
- `Start training` behavior;
- timer cleanup;
- click lock / double-click protection;
- Reduced Motion handling;
- responsive behavior;
- transitions;
- focus handling;
- shared styles where appropriate.

If the current Word Strike implementation is game-specific, extract only the reusable intro behavior into a shared component/config WITHOUT changing the approved visible behavior of Word Strike.

Do not perform a broad refactor.

The final experience should feel like one coherent system used by four game mentors.

---

# 6. CORE INTERACTION — EXACT RULE

For Repair, Error Hunt, and Audio Code:

1. Enter game.
2. Show intro.
3. Show phrase 1.
4. Phrase 1 STAYS on screen.
5. After 650 ms, reveal/enable `Next →`.
6. Learner presses `Next →`.
7. Show phrase 2.
8. Phrase 2 STAYS on screen.
9. After 650 ms, reveal/enable `Next →`.
10. Repeat until the final phrase.
11. After the final learner advance, switch character to the final ready/pointing state.
12. Show `Start training`.
13. Gameplay does NOT start automatically.
14. Learner presses `Start training`.
15. Intro unmounts and the existing game begins.

There must be NO automatic phrase progression.

Do not use fixed timers to move from one phrase to the next.

Timers may control only:
- entrance transition;
- the 650 ms delay before `Next →`;
- small visual transitions;
- final pose transition.

The learner controls dialogue progression.

---

# 7. BUTTON RULES

Use exact primary button text:

```text
Next →
```

for dialogue progression.

Use exact final CTA:

```text
Start training
```

Use:

```text
Skip intro
```

for skipping dialogue.

Preserve the existing game’s `Return to unit` / back control if already present.

`Return to unit` must remain visually secondary.

---

# 8. 650 MS NEXT-BUTTON RULE

Match Word Strike exactly.

When a new phrase becomes visible:

- `Next →` must not be immediately clickable;
- wait 650 ms;
- then reveal/enable it;
- protect against double click / Enter-repeat / rapid tap;
- once a valid Next action is accepted, lock progression until the next dialogue state is ready.

Do not allow two dialogue steps to be skipped by one double click.

Clean the 650 ms timer when:
- moving to another phrase;
- skipping intro;
- pressing Start training;
- returning to Unit;
- unmounting.

---

# 9. SKIP INTRO — EXACT RULE

`Skip intro` must behave exactly like the approved Word Strike version.

When clicked:

- cancel pending intro timers;
- immediately move to the final ready state;
- show the final character pose;
- show `Start training`;
- do NOT launch gameplay.

The learner must still explicitly press:

```text
Start training
```

This applies to all three games.

---

# 10. REPAIR INTRO — HELPER SPARK

## Character

Helper Spark.

Use:

```text
repair-spark-01-greeting.png
repair-spark-02-wink.png
repair-spark-03-point-right.png
```

## Dialogue sequence

Use exactly these learner-facing phrases:

### Phrase 1

```text
Some letters are damaged!
```

Character state:

```text
greeting
```

After 650 ms:

```text
Next →
```

### Phrase 2

```text
Use the clue and rebuild the word.
```

Character state:

```text
wink
```

After 650 ms:

```text
Next →
```

### Phrase 3

```text
Let’s fix it!
```

Keep Spark expressive.

After the learner advances from the final phrase:

Character state:

```text
pointRight
```

Show:

```text
Start training
```

## Labels

Character label:

```text
HELPER SPARK
```

Game title:

```text
Repair
```

Selected Part information may remain visible using the real current Part state.

## Visual personality

Spark should feel:
- cheerful;
- energetic;
- mechanical;
- helpful;
- small but visually important.

Spark must NOT be rendered as a tiny corner mascot.

Scale him sufficiently large in the intro composition.

The final `pointRight` pose should visually direct attention toward `Start training`.

---

# 11. REPAIR GAMEPLAY MUST REMAIN UNCHANGED

After `Start training`, preserve the current Repair implementation.

Canonical behavior remains:

- approximately 20–40% of letters damaged;
- prefer internal damage;
- at least one visible letter per lexical word;
- spaces/apostrophes/punctuation preserved;
- exactly one clue;
- learner types full word/phrase;
- canonical answer + acceptedForms only;
- no Error Hunt typo variants;
- long expressions wrap between words.

Do not alter any of this.

---

# 12. ERROR HUNT INTRO — MENTOR ELARA

## Character

Mentor Elara.

Use:

```text
error-hunt-elara-01-greeting.png
error-hunt-elara-02-wink.png
error-hunt-elara-03-point-right.png
```

## Dialogue sequence

Use exactly these learner-facing phrases:

### Phrase 1

```text
A spelling error is hiding here.
```

Character state:

```text
greeting
```

After 650 ms:

```text
Next →
```

### Phrase 2

```text
Look closely and find the mistake.
```

Character state:

```text
wink
```

After 650 ms:

```text
Next →
```

### Phrase 3

```text
Type the correct word!
```

After the learner advances from the final phrase:

Character state:

```text
pointRight
```

Show:

```text
Start training
```

## Labels

Character label:

```text
MENTOR ELARA
```

Game title:

```text
Error Hunt
```

Selected Part information may remain visible using the actual Part filter state.

## Visual personality

Elara should feel:
- clever;
- observant;
- calm;
- encouraging;
- slightly playful.

Do not make her look like a static character-profile illustration.

She is temporarily speaking directly to the learner.

---

# 13. ERROR HUNT GAMEPLAY MUST REMAIN UNCHANGED

Error Hunt remains SPELLING-ONLY.

Do not introduce:
- grammar correction;
- punctuation tasks;
- general proofreading;
- find-the-difference mechanics.

Current spelling-error rules remain untouched, including realistic learner-style variants.

Do not alter scheduler/task generation while integrating the intro.

---

# 14. AUDIO CODE INTRO — AUDIO GUIDE

## Character

Use the new Audio Guide.

Use:

```text
audio-guide-01-greeting.png
audio-guide-02-listening.png
audio-guide-03-wink.png
audio-guide-04-point-right.png
```

## Dialogue sequence

Audio Code has FOUR meaningful visual states, but the interaction must still be manual.

Use exactly these learner-facing phrases:

### Phrase 1

```text
Ready to crack the audio code?
```

Character state:

```text
greeting
```

After 650 ms:

```text
Next →
```

### Phrase 2

```text
Listen carefully to the word.
```

Character state:

```text
listening
```

After 650 ms:

```text
Next →
```

### Phrase 3

```text
Remember the sounds and spell what you hear.
```

Character state:

```text
wink
```

After 650 ms:

```text
Next →
```

### Phrase 4

```text
Time to decode!
```

After the learner advances from the final phrase:

Character state:

```text
pointRight
```

Show:

```text
Start training
```

## Labels

Character label:

```text
AUDIO GUIDE
```

Game title:

```text
Audio Code
```

Selected Part information may remain visible using the actual Part filter state.

## Visual personality

The new guide should feel:
- connected to sound/listening;
- lively;
- precise;
- magical-tech;
- friendly.

The `listening` artwork is semantically important and must be shown during the line:

```text
Listen carefully to the word.
```

Do not auto-skip this state.

---

# 15. IMPORTANT — NO VOCABULARY AUDIO DURING AUDIO CODE INTRO

Do NOT play target-word audio while the intro dialogue is active.

The Audio Code task audio lifecycle must begin only AFTER:

```text
Start training
```

is pressed and the first actual task is ready.

Preserve the current audio rules:

- no visible target answer leak before response;
- short delayed autoplay after task readiness;
- manual Replay remains;
- no overlapping audio;
- existing repeat behavior remains;
- timers/audio clean up on task change.

The intro character sequence must not interfere with game audio.

---

# 16. VISUAL DESIGN — MATCH THE APPROVED NOVA INTRO

Do not independently redesign each screen.

Match the visual language of the approved Specialist Nova / Word Strike intro.

Use the same or very closely related:

- dialogue panel geometry;
- spacing;
- character scale philosophy;
- typography;
- button styling;
- glow treatment;
- border treatment;
- transition timing;
- layout behavior.

Each game can keep its own background/theme details, but the onboarding system must clearly belong to the same product.

General style:

- bright magical steampunk;
- elegant;
- cyan energy;
- brass/gold accents;
- light surfaces;
- readable;
- polished;
- not cartoonishly dark;
- not a technical dashboard.

---

# 17. CHARACTER RENDERING

All supplied images are standalone transparent PNGs.

Use:

```css
object-fit: contain;
```

Preserve aspect ratio.

Do not:
- crop heads;
- crop feet;
- crop Spark wings;
- crop Elara staff/arms;
- crop Audio Guide effects;
- stretch images;
- use sprite-sheet positioning;
- use `object-fit: cover`;
- add white image backgrounds;
- globally mirror characters.

Only one character-state PNG should be visible at a time.

Use a short crossfade/state transition if the approved Word Strike intro does so.

Do not render all states stacked simultaneously.

---

# 18. OLD CONCEPT SHEETS / OLD INTRO ART

Audit Repair, Error Hunt, and Audio Code.

If any old onboarding currently renders:
- character sheet;
- concept sheet;
- turnaround sheet;
- technical asset board;
- multi-pose poster;
- old oversized reference illustration;

remove that reference from production UI.

Do NOT necessarily delete the source image from the repository.

It can remain as reference/archive material.

It simply must not be rendered as the onboarding character anymore.

---

# 19. TEXT MUST BE REAL UI TEXT

All dialogue must be HTML/CSS text.

Do NOT bake phrases into PNGs.

Do NOT use text embedded in concept/reference sheets.

Dialogue must remain readable and accessible.

---

# 20. REDUCED MOTION — MATCH CURRENT WORD STRIKE BEHAVIOR

The approved Word Strike intro already has Reduced Motion support.

Reuse that behavior.

Reduced Motion must NOT auto-progress dialogue.

The learner still controls:

```text
Next →
```

Reduced Motion means:
- no entrance translation;
- no large scale movement;
- no decorative moving particles;
- state PNG may change immediately or with simple opacity;
- 650 ms button rule may remain if this matches current Nova behavior;
- semantic character state still changes;
- `Start training` still requires explicit click.

Do not remove dialogue just because Reduced Motion is enabled.

---

# 21. RESPONSIVE DESIGN

Match the approved Word Strike onboarding responsiveness.

Desktop:
- character left / content right where appropriate;
- character large;
- full body/effects visible;
- no unnecessary scrolling on normal laptop dimensions.

Landscape tablet/mobile:
- scale character down;
- preserve readable dialogue;
- keep `Next →`, `Skip intro`, and `Start training` accessible;
- no clipping.

Portrait:
- preserve the existing project orientation behavior;
- do not create a competing orientation system.

Repair needs special attention because Spark has a very different silhouette/size from human characters. Do not force identical raw pixel dimensions; use presentation sizing that produces equivalent visual presence.

---

# 22. ACCESSIBILITY

Reuse existing Word Strike intro accessibility behavior.

Ensure:
- `Next →` is keyboard accessible;
- `Start training` is keyboard accessible;
- `Skip intro` is keyboard accessible;
- Back/Return remains keyboard accessible;
- focus states remain visible;
- character imagery has sensible alt/aria handling;
- dialogue exists as actual text.

Enter/Space must not accidentally trigger two dialogue advances from key repeat.

---

# 23. PRELOADING

Preload only the character images needed for the CURRENT intro.

Repair:
3 images.

Error Hunt:
3 images.

Audio Code:
4 images.

Do not preload all project characters globally.

The learner must not see blank frames while switching character state.

---

# 24. FALLBACK

If one state image cannot load:

- never show a broken image;
- stay within the same character;
- use that character’s nearest sensible available state;
- emit a development warning.

Examples:

Repair wink missing:
→ use Repair greeting or pointRight.

Error Hunt point missing:
→ use Elara greeting/wink.

Audio listening missing:
→ use Audio Guide greeting.

Never substitute:
- Nova for Elara;
- Elara for Spark;
- Spark for Audio Guide;
- another unrelated character.

---

# 25. SHARED CONFIG

Prefer a centralized intro config instead of scattering text and filenames through multiple JSX files.

For example:

```ts
repair: {
  characterName,
  title,
  steps,
  finalState,
  assets
}

errorHunt: {
  ...
}

audioCode: {
  ...
}
```

Each step can contain:

```ts
{
  text,
  characterState
}
```

Use the already-approved Word Strike infrastructure if it can be generalized cleanly.

Do not replace working code with a large framework.

---

# 26. TIMER / STATE CLEANUP

Clean all intro timers/state safely when:

- `Next →` is clicked;
- `Skip intro` is clicked;
- `Start training` is clicked;
- learner returns to Unit;
- component unmounts;
- route changes.

No delayed timer from the intro may fire after gameplay has already started.

Preserve the approved double-click guard behavior from Word Strike.

---

# 27. TESTS

Add/update focused tests.

At minimum verify:

## Shared behavior

1. Dialogue does NOT auto-advance.
2. Phrase remains until `Next →`.
3. `Next →` is unavailable before 650 ms.
4. `Next →` becomes available after 650 ms.
5. One click advances exactly one phrase.
6. Double click does not skip two phrases.
7. `Skip intro` moves only to final ready state.
8. `Skip intro` does NOT start gameplay.
9. `Start training` starts gameplay only from ready state.
10. timers clean on unmount.
11. Reduced Motion does not break manual dialogue progression.

## Repair

12. correct Spark greeting asset renders.
13. correct Spark wink asset renders.
14. final Spark pointRight asset renders.
15. all 3 Repair assets resolve.
16. existing Repair gameplay still starts correctly.

## Error Hunt

17. correct Elara greeting asset renders.
18. correct Elara wink asset renders.
19. final Elara pointRight asset renders.
20. all 3 Error Hunt assets resolve.
21. existing spelling-only Error Hunt starts correctly.

## Audio Code

22. greeting asset renders.
23. listening asset renders on the listening phrase.
24. wink asset renders.
25. pointRight is final ready state.
26. all 4 Audio Guide assets resolve.
27. no target vocabulary audio plays during intro.
28. existing Audio Code autoplay begins only after Start training / task readiness.
29. answer text is still not leaked before response.

Total new character assets expected for these three games:

```text
3 + 3 + 4 = 10
```

Verify all 10 actual paths exist and are non-empty.

---

# 28. MANUAL QA

Use Yandex Browser for the manual visual check.

Check all three intros.

## Repair

Verify:
- Spark has enough visual presence;
- no clipping;
- transparent PNG;
- dialogue waits for learner;
- 650 ms Next delay;
- greeting → wink → final point;
- Start training;
- Skip intro;
- no old character sheet.

## Error Hunt

Verify:
- Elara full artwork visible;
- dialogue waits for learner;
- 650 ms Next delay;
- greeting → wink → final point;
- Start training;
- Skip intro;
- no old concept sheet.

## Audio Code

Verify:
- all four states display correctly;
- listening state matches the listening line;
- dialogue never moves automatically;
- 650 ms Next delay;
- final point pose + Start training;
- no vocabulary audio during intro;
- gameplay audio works after Start training.

Also inspect at least one reduced-width landscape viewport.

---

# 29. BUILD

Run focused tests for:
- shared intro behavior;
- Repair;
- Error Hunt;
- Audio Code.

Then run ONE production build.

Do not repeatedly run unrelated full test suites/builds unless an actual failure requires it.

---

# 30. STOP CONDITION

STOP after:

- Repair uses the approved manual intro interaction;
- Error Hunt uses the approved manual intro interaction;
- Audio Code uses the approved manual intro interaction;
- all 10 new character PNGs resolve;
- old character/concept sheets are removed from production onboarding where applicable;
- focused tests pass;
- production build passes.

Do not continue into gameplay redesign.

---

# 31. FINAL REPORT

Return a concise report containing:

1. files changed;
2. whether the existing Word Strike intro component was reused/generalized;
3. confirmation that Word Strike visible behavior was not changed;
4. exact Repair character asset root and 3 resolved files;
5. exact Error Hunt character asset root and 3 resolved files;
6. exact Audio Code character asset root and 4 resolved files;
7. Repair dialogue/state sequence;
8. Error Hunt dialogue/state sequence;
9. Audio Code dialogue/state sequence;
10. confirmation that every phrase waits for `Next →`;
11. confirmation of 650 ms Next-button delay;
12. double-click protection;
13. Skip intro behavior;
14. Start training behavior;
15. Reduced Motion behavior;
16. old concept-sheet references removed from production UI;
17. Audio Code intro/audio separation;
18. responsive/manual QA result;
19. tests and results;
20. production build result;
21. explicit confirmation that vocabulary, Parts, Weak Word, coverage, city progression, rewards, evolution, Word Strike, Code Fighter, and actual game mechanics were not changed.
