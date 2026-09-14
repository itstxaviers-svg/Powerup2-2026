# POWER UP 2 — CODEX INSTRUCTION
## Fighting Level enemy assets + pre-battle story intros

MODEL TO USE: GPT-5.6 Sol

Continue working in the CURRENT project:

`/Users/sophie/Downloads/Power up 2`

Treat the current filesystem state as the source of truth.

This is a focused update to the cumulative Fighting Level system after Units 3, 7 and 9.

The enemy artwork is ALREADY ADDED to the project. Do not generate, redesign, rename, crop, move, mirror, or replace the PNG files unless the real filesystem proves that a filename/path differs from this specification.

The goals of this task are:
1. connect all prepared Fighting Level enemy action PNGs;
2. add short story dialogue BEFORE each milestone battle;
3. reuse the existing manual dialogue interaction style already used elsewhere in the project;
4. preserve all existing Fighting Level vocabulary, roster, timer, 85% pass rule, persistence and first-person battle logic.

Do NOT redesign normal Code Fighter.
Do NOT change Unit 1/2 opponent logic.
Do NOT change vocabulary.
Do NOT change Weak Word, city progression, rewards, normal Unit games, or player avatars.

---

# 1. FIGHTING LEVEL STRUCTURE

## AFTER UNIT 3

Battle 1:
`The Inkbound Knight`

Vocabulary pool:
`Units 1–3`

Battle size:
`ceil(total eligible vocabulary / 3)`

Timer:
`10 seconds`

Required accuracy:
`>= 85%`

## AFTER UNIT 7

Battle 1:
`Prism Wraith`

Battle 2:
`The Bellkeeper`

Vocabulary pool:
`Units 1–7`

Each battle:
`ceil(total eligible vocabulary / 3)`

No vocabulary ID may repeat between Battle 1 and Battle 2.

Timer:
`8 seconds`

Required accuracy:
`>= 85%`

## AFTER UNIT 9 — SUPER BATTLE

Battle 1:
`Crownless Marionette`

Battle 2:
`Corrupted Archivist`

Vocabulary pool:
`Units 1–9`

Each battle:
`ceil(total eligible vocabulary / 3)`

No vocabulary ID may repeat between Battle 1 and Battle 2.

Timer:
`6 seconds`

Required accuracy:
`>= 85%`

Do not change these rules in this task.

---

# 2. ENEMY ASSET ROOT

The prepared assets are under:

`Assets/05-games/code-fighter/opponents/`

Use the project's actual capitalisation and Vite asset-loading convention.

Do not create duplicate asset trees.

---

# 3. THE INKBOUND KNIGHT ASSETS

Folder:

`Assets/05-games/code-fighter/opponents/inkbound-knight/`

Expected files:

```text
inkbound-knight-base.png
inkbound-knight-idle.png
inkbound-knight-quick-attack.png
inkbound-knight-heavy-attack.png
inkbound-knight-block.png
inkbound-knight-counter.png
inkbound-knight-hit.png
inkbound-knight-ultimate.png
inkbound-knight-victory.png
inkbound-knight-defeat.png
```

Semantic mapping:

```text
base         -> inkbound-knight-base.png
idle         -> inkbound-knight-idle.png
quickAttack  -> inkbound-knight-quick-attack.png
heavyAttack  -> inkbound-knight-heavy-attack.png
block        -> inkbound-knight-block.png
counter      -> inkbound-knight-counter.png
hit          -> inkbound-knight-hit.png
ultimate     -> inkbound-knight-ultimate.png
victory      -> inkbound-knight-victory.png
defeat       -> inkbound-knight-defeat.png
```

---

# 4. PRISM WRAITH ASSETS

Folder:

`Assets/05-games/code-fighter/opponents/prism-wraith/`

Expected files:

```text
prism-wraith-base.png
prism-wraith-idle.png
prism-wraith-quick-attack.png
prism-wraith-heavy-attack.png
prism-wraith-block.png
prism-wraith-counter.png
prism-wraith-hit.png
prism-wraith-ultimate.png
prism-wraith-victory.png
prism-wraith-defeat.png
```

Semantic mapping:

```text
base         -> prism-wraith-base.png
idle         -> prism-wraith-idle.png
quickAttack  -> prism-wraith-quick-attack.png
heavyAttack  -> prism-wraith-heavy-attack.png
block        -> prism-wraith-block.png
counter      -> prism-wraith-counter.png
hit          -> prism-wraith-hit.png
ultimate     -> prism-wraith-ultimate.png
victory      -> prism-wraith-victory.png
defeat       -> prism-wraith-defeat.png
```

Use the corrected expanded-canvas production art where the prismatic beams are fully contained.
Do not crop the effects.

---

# 5. THE BELLKEEPER ASSETS

Folder:

`Assets/05-games/code-fighter/opponents/bellkeeper/`

Expected files:

```text
bellkeeper-base.png
bellkeeper-idle.png
bellkeeper-quick-attack.png
bellkeeper-heavy-attack.png
bellkeeper-block.png
bellkeeper-counter.png
bellkeeper-hit.png
bellkeeper-ultimate.png
bellkeeper-victory.png
bellkeeper-defeat.png
```

Semantic mapping:

```text
base         -> bellkeeper-base.png
idle         -> bellkeeper-idle.png
quickAttack  -> bellkeeper-quick-attack.png
heavyAttack  -> bellkeeper-heavy-attack.png
block        -> bellkeeper-block.png
counter      -> bellkeeper-counter.png
hit          -> bellkeeper-hit.png
ultimate     -> bellkeeper-ultimate.png
victory      -> bellkeeper-victory.png
defeat       -> bellkeeper-defeat.png
```

---

# 6. CROWNLESS MARIONETTE ASSETS

Folder:

`Assets/05-games/code-fighter/opponents/crownless-marionette/`

Expected files:

```text
crownless-marionette-base.png
crownless-marionette-idle.png
crownless-marionette-quick-attack.png
crownless-marionette-heavy-attack.png
crownless-marionette-block.png
crownless-marionette-counter.png
crownless-marionette-hit.png
crownless-marionette-ultimate.png
crownless-marionette-victory.png
crownless-marionette-defeat.png
```

Semantic mapping:

```text
base         -> crownless-marionette-base.png
idle         -> crownless-marionette-idle.png
quickAttack  -> crownless-marionette-quick-attack.png
heavyAttack  -> crownless-marionette-heavy-attack.png
block        -> crownless-marionette-block.png
counter      -> crownless-marionette-counter.png
hit          -> crownless-marionette-hit.png
ultimate     -> crownless-marionette-ultimate.png
victory      -> crownless-marionette-victory.png
defeat       -> crownless-marionette-defeat.png
```

Use the corrected expanded-canvas production artwork with fully terminated violet puppet threads.
Do not crop the completed strings/effects in CSS.
Use `object-fit: contain`.

---

# 7. CORRUPTED ARCHIVIST ASSETS

Folder:

`Assets/05-games/code-fighter/opponents/corrupted-archivist/`

Expected files:

```text
corrupted-archivist-base.png
corrupted-archivist-idle.png
corrupted-archivist-quick-attack.png
corrupted-archivist-heavy-attack.png
corrupted-archivist-block.png
corrupted-archivist-counter.png
corrupted-archivist-hit.png
corrupted-archivist-ultimate.png
corrupted-archivist-victory.png
corrupted-archivist-defeat.png
```

Semantic mapping:

```text
base         -> corrupted-archivist-base.png
idle         -> corrupted-archivist-idle.png
quickAttack  -> corrupted-archivist-quick-attack.png
heavyAttack  -> corrupted-archivist-heavy-attack.png
block        -> corrupted-archivist-block.png
counter      -> corrupted-archivist-counter.png
hit          -> corrupted-archivist-hit.png
ultimate     -> corrupted-archivist-ultimate.png
victory      -> corrupted-archivist-victory.png
defeat       -> corrupted-archivist-defeat.png
```

Visual identity:
- mechanical bird;
- long drill-like beak;
- propeller/blade wings;
- archive papers/tags/books/mechanisms;
- brass/dark metal;
- emerald/teal/cyan-green energy palette;
- do NOT recolour it into the violet Prism/Marionette palette.

This is the final boss.

---

# 8. CENTRALIZED ENEMY REGISTRY

Use one Fighting Level enemy registry.

Do not scatter filenames through components.

Each entry should conceptually support:

```ts
{
  id,
  displayName,
  milestoneId,
  battleIndex,
  assetRoot,
  actions,
  intro,
  visualAnchors,
  mirrorX,
}
```

Enemy IDs:

```text
inkbound-knight
prism-wraith
bellkeeper
crownless-marionette
corrupted-archivist
```

Action keys:

```text
base
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

Fallback:
if an action image is unavailable, fall back to the SAME enemy's idle art and emit a development warning.

Never substitute another enemy.

---

# 9. PRE-BATTLE DIALOGUE SYSTEM

Before EVERY NEW Fighting Level battle, show a short story intro from that specific enemy.

This happens BEFORE:
- question generation is presented to the learner;
- first audio clue;
- answer timer;
- battle damage;
- battle task progression.

The timer must remain STOPPED during dialogue.

No vocabulary item is consumed during dialogue.

The battle begins only after the learner presses the final Start button.

---

# 10. DIALOGUE INTERACTION — SAME FEEL AS EXISTING CHARACTER INTROS

Reuse the project's already approved manual intro interaction style.

Required behavior:

1. enemy appears;
2. first line appears;
3. line remains until learner presses `Next →`;
4. `Next →` appears/enables after approximately 650 ms;
5. one press advances one line;
6. never auto-advance;
7. protect against accidental/double clicks;
8. after final line, replace `Next →` with the battle start CTA;
9. only the start CTA transitions into the actual battle;
10. Reduced Motion removes large transitions but preserves manual progression.

Do not create an unrelated dialogue framework if the existing character-intro component can be generalized/reused safely.

---

# 11. NO SKIP ON FIRST ENCOUNTER

Do NOT show `Skip intro` the first time a learner meets a milestone enemy.

The intros are only three short lines.

If the learner FAILS and presses `Repeat battle`, do NOT force the full dialogue again.

On retry:
- keep the same vocabulary roster;
- preserve current repeat rules;
- go directly to the battle-ready state or a very short enemy-ready transition;
- do not replay all three intro lines.

Do not replay a completed Battle 1 intro when continuing later after reload.

Persist intro/encounter state through the existing Fighting Level progress model.

A structure such as:

```text
seenEnemyIntros: FightingEnemyId[]
```

or an equivalent battle-specific persisted flag is acceptable.

Do not create a separate unrelated localStorage system.

---

# 12. INTRO VISUAL PRESENTATION

This is a first-person Fighting Level.

There is NO player avatar in the arena.

During dialogue:
- show the enemy large and clearly readable;
- use `idle` as default intro art;
- enemy occupies center / upper-middle;
- dialogue panel remains compact and must not hide most of the enemy;
- show enemy name above or inside the dialogue panel;
- no answer input yet;
- no active countdown yet;
- no battle HP/damage changes yet.

Use the existing game style.

---

# 13. OPTIONAL FINAL-LINE POSE CHANGE

On the LAST dialogue line only, the enemy may switch from `idle` to an existing prepared action state for a short dramatic cue.

Do NOT add new artwork.

Suggested mapping:

```text
Inkbound Knight       -> heavyAttack or quickAttack
Prism Wraith          -> heavyAttack
Bellkeeper            -> heavyAttack
Crownless Marionette  -> counter or heavyAttack
Corrupted Archivist   -> ultimate
```

The pose change must NOT:
- inflict damage;
- start the timer;
- consume a vocabulary question;
- count as battle action.

If the visual fit is poor, keep idle.

---

# 14. AFTER UNIT 3 — THE INKBOUND KNIGHT DIALOGUE

Enemy name:

`THE INKBOUND KNIGHT`

Exact dialogue:

```text
So... you made it this far.
```

then:

```text
Words are easy when you can see them.
```

then:

```text
But can you remember them when I take the letters away?
```

Final CTA:

`Start battle`

Only after pressing `Start battle`:
- initialize/show first task;
- perform Audio/Picture readiness flow;
- start the 10-second timer at the proper task-ready moment.

---

# 15. AFTER UNIT 7 — PRISM WRAITH DIALOGUE

Enemy name:

`PRISM WRAITH`

Exact dialogue:

```text
Seven worlds. So many words.
```

then:

```text
Let us see what is still clear in your memory.
```

then:

```text
One mistake... and the prism cracks.
```

Final CTA:

`Start battle`

Timer after task readiness:

`8 seconds`

---

# 16. AFTER UNIT 7 — THE BELLKEEPER DIALOGUE

This intro appears before Battle 2 AFTER Prism Wraith Battle 1 has been passed.

Enemy name:

`THE BELLKEEPER`

Exact dialogue:

```text
I heard your victory.
```

then:

```text
But every word leaves an echo.
```

then:

```text
Show me which echoes you can still hear.
```

Final CTA:

`Start battle`

Timer after task readiness:

`8 seconds`

Battle 2 must continue to exclude every vocabulary ID used by Prism Wraith Battle 1.

The dialogue must not regenerate the roster.

---

# 17. AFTER UNIT 9 — CROWNLESS MARIONETTE DIALOGUE

Enemy name:

`CROWNLESS MARIONETTE`

Exact dialogue:

```text
Nine cities restored... How impressive.
```

then:

```text
But are those words truly yours?
```

then:

```text
Let me pull the strings and find out.
```

Final CTA:

`Start super battle`

Timer after task readiness:

`6 seconds`

---

# 18. AFTER UNIT 9 — CORRUPTED ARCHIVIST FINAL DIALOGUE

This is the FINAL encounter.

Enemy name:

`CORRUPTED ARCHIVIST`

Make the entrance visually stronger than the others using existing CSS/effects only:
- subtle propeller/blade spin impression if already supported;
- archive-paper / teal-energy ambience if reusable;
- short entrance glow;
- no new asset generation.

Exact dialogue:

```text
ARCHIVE ACCESS: DENIED.
```

then:

```text
Nine units detected. Memory verification required.
```

then:

```text
Prove that nothing you learned has been lost.
```

Final CTA:

`Begin final battle`

Timer after task readiness:

`6 seconds`

Do not begin countdown before the first actual Audio/Picture clue is ready.

---

# 19. OPTIONAL SHORT VICTORY LINES

If the existing result architecture supports a short enemy/final line cleanly, add:

Prism Wraith:

`Interesting... You remember more than I expected.`

Bellkeeper:

`The bells remember you.`

Crownless Marionette:

`You cut every string...`

Corrupted Archivist final result:

```text
VERIFICATION COMPLETE.
Knowledge preserved.
ACCESS GRANTED.
```

Do not build a second long dialogue system after battles just for these lines.

They must not affect pass/fail logic.

---

# 20. AUDIO / PICTURE TASKS REMAIN UNCHANGED

The Fighting Level continues to use ONLY:

```text
Audio -> typed English answer
Picture -> typed English answer
```

Do not introduce definitions, translations, multiple choice, Error Hunt, or normal Code Fighter exchange questions.

Dialogue occurs BEFORE all task logic.

---

# 21. BATTLE FEEDBACK REMAINS FIRST-PERSON

Do not show the player avatar.

Correct answer:
- enemy shows `hit`;
- learner attack/effect may play;
- return to idle.

Wrong/timeout:
- enemy uses semantic attack state;
- screen briefly flashes red;
- optional reduced camera impact;
- return to idle.

Failure:
- enemy `ultimate`;
- learner-hit feedback;
- enemy `victory`;
- failed result.

Pass:
- enemy `hit`;
- enemy `defeat`;
- result.

Do not randomly cycle action images.

---

# 22. ACTION IMAGE USE

Use the prepared semantic states rather than only idle artwork.

At minimum verify:

```text
idle
quickAttack
heavyAttack
hit
ultimate
victory
defeat
```

Use block/counter only where choreography has a meaningful semantic use.

Do not force every state randomly.

---

# 23. IMAGE FIT / CROPPING

Preserve full silhouettes and effects.

Use:

`object-fit: contain`

Do NOT use:

`object-fit: cover`

Do not crop:
- Prism Wraith prismatic beams/crystals;
- Crownless Marionette puppet strings;
- Bellkeeper bells/halo;
- Inkbound Knight weapon/effects;
- Corrupted Archivist drill beak, propeller wings, archive halo/papers.

Use centralized enemy presentation metadata:

```text
scale
x
y
groundY / visualY
offsetX
offsetY
mirrorX
```

The milestone Fighting Level is first-person, so do not blindly reuse side-view mirroring from normal Code Fighter.

---

# 24. RESPONSIVE INTRO LAYOUT

Desktop/landscape is primary.

During dialogue:
- enemy remains the visual focus;
- dialogue panel stays compact;
- no huge panel covering lower half of enemy;
- `Next →` / Start CTA stays accessible;
- long enemy effects remain visible where possible.

For short landscape screens:
1. slightly reduce enemy scale;
2. slightly reduce dialogue-panel padding;
3. keep text readable;
4. never hide CTA;
5. avoid cropping actual character body.

---

# 25. PERSISTENCE

Use the existing Fighting Level persistence architecture.

Persist enough state to ensure:
- first encounter shows intro;
- retry does not replay full intro;
- passed Battle 1 remains passed;
- Battle 2 gets its own first intro exactly once;
- reload cannot regenerate no-repeat rosters;
- reload cannot show the wrong enemy intro.

Intro-seen state must never count as battle completion.

---

# 26. ASSET VERIFICATION

Programmatically verify all five enemy folders.

Expected:

`5 enemies × 10 PNGs = 50 prepared files`

Check:
- expected path exists;
- non-empty;
- Vite resolves it;
- runtime action registry resolves it.

If the filesystem uses slightly different exact filenames because the files were manually saved, inspect and map the real file once in the central registry rather than silently creating duplicates.

Do NOT rename/move user artwork without a real need.

---

# 27. TESTS

Add/update focused tests for:

## Asset registry
- all five enemies resolve;
- each enemy has all semantic actions;
- no enemy falls back to another enemy;
- missing action falls back only to same enemy idle.

## Intro mapping
- Unit 3 battle -> Inkbound Knight intro;
- Unit 7 Battle 1 -> Prism Wraith intro;
- Unit 7 Battle 2 -> Bellkeeper intro;
- Unit 9 Battle 1 -> Crownless Marionette intro;
- Unit 9 Battle 2 -> Corrupted Archivist intro.

## Intro interaction
- first line appears;
- no automatic advancement;
- Next appears/enables after ~650 ms;
- one click advances one line only;
- final line produces correct battle CTA;
- battle timer is stopped during intro;
- no vocabulary item is consumed during intro;
- Start button begins battle;
- first task gets correct 10/8/6 timer only when clue is ready;
- failed-battle retry does not replay full intro;
- Battle 2 first encounter gets its own intro;
- intro-seen persistence survives reload;
- Reduced Motion preserves manual dialogue progression.

## Regression
- cumulative vocabulary pool unchanged;
- one-third roster logic unchanged;
- two-fight no-repeat rule unchanged;
- 85% pass rule unchanged;
- failed battle uses same roster;
- Audio/Picture task logic unchanged;
- normal Code Fighter unchanged.

---

# 28. DO NOT CHANGE

Do not change:
- Unit vocabulary;
- Parts;
- Unit module coverage;
- Weak Word;
- city construction;
- rewards;
- avatar evolution;
- Repair;
- Error Hunt;
- Audio Code;
- Word Strike;
- normal Code Fighter;
- Unit 1/2 Code Fighter enemies;
- Fighting Level one-third selection;
- no-repeat logic;
- 85% threshold;
- 10 / 8 / 6 second timer rules;
- Audio/Picture-only milestone task design.

---

# 29. BUILD

Run focused Fighting Level + persistence + enemy-registry tests.

Then run ONE production build.

---

# 30. STOP CONDITION

STOP after:
- all five prepared enemy sets are connected;
- all 50 expected PNGs are verified or exact filesystem differences are reported;
- every milestone battle has its correct three-line pre-battle conversation;
- manual `Next →` progression works;
- final Start CTA works;
- countdown never runs during dialogue;
- retry does not force full intro replay;
- enemy action images work during battle;
- existing Fighting Level logic is unchanged;
- tests pass;
- production build passes.

Do not continue into new Unit vocabulary or new enemy generation.

---

# 31. FINAL REPORT

Return a concise report containing:
1. files changed;
2. enemy registry file/location;
3. five asset roots actually used;
4. how many of the expected 50 PNGs were found;
5. any filename/path differences discovered;
6. action mapping for each enemy;
7. intro/dialogue component used or generalized;
8. exact battle-to-intro mapping;
9. persisted intro-seen behavior;
10. retry behavior;
11. timer gating during intro;
12. Unit 3 / Unit 7 / Unit 9 CTA behavior;
13. image anchor/scale corrections, if any;
14. focused tests and results;
15. production build result;
16. explicit confirmation that vocabulary, roster rules, no-repeat logic, 85% threshold, Audio/Picture tasks, normal Code Fighter, Weak Word, city progression and rewards were not changed.
